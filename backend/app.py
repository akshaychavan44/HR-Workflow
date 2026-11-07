import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field
from pypdf import PdfReader
from sqlalchemy import select, text as sql_text
from sqlalchemy.dialects.postgresql import insert
from database import db, JobRecord, CandidateRecord

app = FastAPI(title="HR Workflow")

OFFICE_EXTENSIONS = {".doc", ".docx", ".odt", ".rtf", ".xls", ".xlsx", ".ods", ".ppt", ".pptx", ".odp"}
SUPPORTED_EXTENSIONS = {".pdf", *OFFICE_EXTENSIONS}
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_PDF_PAGES = 50


class Keyword(BaseModel):
    id: str = Field(max_length=200)
    label: str = Field(min_length=1, max_length=200)
    kind: Literal["must", "good"]
    synonyms: list[str] = Field(default_factory=list, max_length=30)
    weight: int | None = Field(default=None, ge=1, le=5)


class Job(BaseModel):
    id: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=20000)
    cutoff: int = Field(ge=0, le=100)
    keywords: list[Keyword] = Field(max_length=100)
    createdAt: str


def get_job(job_id):
    with db() as connection:
        row = connection.get(JobRecord, job_id)
        data = row.data if row else None
    if not row:
        raise HTTPException(404, "Job not found")
    return json.loads(data)


@app.get("/health")
def health():
    try:
        with db() as connection:
            connection.execute(sql_text("SELECT 1"))
        return {"status": "ok", "database": "postgres"}
    except Exception:
        raise HTTPException(503, "Neon database is not connected. Configure backend/.env and run the migration.")


@app.get("/jobs")
def jobs():
    with db() as connection:
        return sorted([json.loads(row.data) for row in connection.scalars(select(JobRecord))], key=lambda job: job["createdAt"], reverse=True)


@app.post("/jobs")
def save_job(job: Job):
    if not job.title.strip() or not job.description.strip():
        raise HTTPException(422, "Title and description are required")
    with db() as connection:
        connection.execute(insert(JobRecord).values(id=job.id, data=job.model_dump_json()).on_conflict_do_update(index_elements=[JobRecord.id], set_={"data": job.model_dump_json()}))
    return job


def soffice_command():
    configured = os.environ.get("SOFFICE_PATH")
    windows_default = Path(r"C:\Program Files\LibreOffice\program\soffice.exe")
    command = configured or (str(windows_default) if windows_default.is_file() else shutil.which("soffice"))
    if not command:
        raise ValueError("LibreOffice is required for this file type. Install it on the backend server or set SOFFICE_PATH.")
    return command


def extract_pdf(content):
    reader = PdfReader(io.BytesIO(content))
    if reader.is_encrypted:
        raise ValueError("Password-protected PDFs are not supported.")
    if len(reader.pages) > MAX_PDF_PAGES:
        raise ValueError(f"Use a CV with {MAX_PDF_PAGES} pages or fewer.")
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def convert_to_pdf(content, filename):
    with tempfile.TemporaryDirectory(prefix="hr-workflow-") as workspace:
        folder = Path(workspace)
        source = folder / filename
        output = folder / "converted"
        profile = folder / "profile"
        output.mkdir()
        source.write_bytes(content)
        try:
            subprocess.run(
                [
                    soffice_command(),
                    "--headless",
                    f"-env:UserInstallation={profile.as_uri()}",
                    "--convert-to", "pdf",
                    "--outdir", str(output),
                    str(source),
                ],
                check=True,
                capture_output=True,
                text=True,
                timeout=60,
            )
        except subprocess.TimeoutExpired as error:
            raise ValueError("Document conversion took too long. Try a smaller file.") from error
        except subprocess.CalledProcessError as error:
            detail = (error.stderr or error.stdout).strip()
            raise ValueError(f"LibreOffice could not convert this file{f': {detail}' if detail else ''}.") from error
        pdfs = list(output.glob("*.pdf"))
        if len(pdfs) != 1:
            raise ValueError("LibreOffice did not create a PDF for this file.")
        return pdfs[0].read_bytes()


def extract(content, filename, extension):
    return extract_pdf(content if extension == ".pdf" else convert_to_pdf(content, filename))


def find_keyword(text, label, synonyms):
    for term in [label, *synonyms]:
        if not term.strip():
            continue
        pattern = r"(?<!\w)" + r"\s+".join(re.escape(part) for part in term.strip().split()) + r"(?!\w)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match
    return None


def evidence_line(text, match):
    start = text.rfind("\n", 0, match.start()) + 1
    end = text.find("\n", match.end())
    return {
        "before": text[start:match.start()].lstrip(),
        "term": match.group(),
        "after": text[match.end():end if end != -1 else len(text)].rstrip(),
    }


def screen(text, job):
    evidence = []
    total = earned = 0
    for keyword in job["keywords"]:
        weight = 5 if keyword["kind"] == "must" else keyword.get("weight") or 3
        total += weight
        match = find_keyword(text, keyword["label"], keyword["synonyms"])
        if match:
            earned += weight
        evidence.append({"label": keyword["label"], "kind": keyword["kind"], "weight": weight,
                         "matched": bool(match), "line": evidence_line(text, match) if match else None})
    score = round(earned / total * 100) if total and len(text.strip()) >= 30 else None
    missing = [item["label"] for item in evidence if not item["matched"]]
    missing_must = any(not item["matched"] and item["kind"] == "must" for item in evidence)
    status = "needs_review" if score is None else "meets_cutoff" if score >= job["cutoff"] and not missing_must else "below_requirements"
    return {"score": score, "status": status, "evidence": evidence, "missing": missing, "cutoff": job["cutoff"]}


@app.post("/jobs/{job_id}/candidates")
def upload(job_id: str, file: UploadFile):
    job = get_job(job_id)
    filename = Path((file.filename or "cv").replace("\\", "/")).name
    extension = Path(filename).suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(400, "Choose a PDF, Word, spreadsheet, or presentation file.")
    content = file.file.read(MAX_FILE_SIZE + 1)
    if not content or len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "Each CV must be between 1 byte and 10 MB.")
    digest = hashlib.sha256(content).hexdigest()
    with db() as connection:
        previous = connection.scalar(select(CandidateRecord.data).where(CandidateRecord.job_id == job_id, CandidateRecord.digest == digest))
    if previous:
        return {"candidate": json.loads(previous), "duplicate": True}
    try:
        text = extract(content, filename, extension)[:200000]
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    except Exception as error:
        raise HTTPException(400, "Could not read this file. Upload a valid, unencrypted supported file.") from error
    emails = re.findall(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text)
    phones = [m.group().strip() for m in re.finditer(r"(?<!\w)\+?\d[\d ()-]{7,}\d(?!\w)", text) if 10 <= len(re.sub(r"\D", "", m.group())) <= 15]
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    first = lines[0] if lines else ""
    name = first if 2 <= len(first.split()) <= 5 and len(first) < 70 and not re.search(r"[\d@:/]", first) else Path(filename).stem
    candidate_id = str(uuid.uuid4())
    result = {"id": candidate_id, "jobId": job_id, "jobTitle": job["title"], "name": name,
              "email": emails[0] if emails else None, "phone": phones[0] if phones else None,
              "filename": filename, "createdAt": datetime.now(timezone.utc).isoformat(),
              "text": text, "notes": ["Name and contact details are extracted suggestions; verify against the CV.",
              "Keyword matching does not verify years of experience or interpret the full job description."], **screen(text, job)}
    if len(text.strip()) < 30:
        result["notes"].append("No readable text found. This may be a scanned CV; OCR/manual review is required.")
    if not job["keywords"]:
        result["notes"].append("This job has no screening keywords, so no score was assigned.")
    with db() as connection:
        connection.execute(insert(CandidateRecord).values(id=candidate_id, job_id=job_id, digest=digest, data=json.dumps(result), content=content).on_conflict_do_nothing())
        stored = connection.scalar(select(CandidateRecord.data).where(CandidateRecord.job_id == job_id, CandidateRecord.digest == digest))
    saved = json.loads(stored)
    return {"candidate": saved, "duplicate": saved["id"] != candidate_id}


@app.get("/candidates")
def candidates(job_id: str | None = None):
    with db() as connection:
        query = select(CandidateRecord.data)
        if job_id:
            query = query.where(CandidateRecord.job_id == job_id)
        profiles = [json.loads(data) for data in connection.scalars(query)]
        legacy = [(profile, item) for profile in profiles for item in profile["evidence"] if item.get("snippet")]
        if legacy:
            job_ids = {profile["jobId"] for profile, _ in legacy}
            job_rows = connection.scalars(select(JobRecord).where(JobRecord.id.in_(job_ids)))
            keywords = {
                (row.id, keyword["kind"], keyword["label"]): keyword["synonyms"]
                for row in job_rows for keyword in json.loads(row.data)["keywords"]
            }
            for profile, item in legacy:
                source = profile["text"]
                synonyms = keywords.get((profile["jobId"], item["kind"], item["label"]), [])
                match = find_keyword(source, item["label"], synonyms)
                # The saved excerpt verifies that the current keyword still points to the original match.
                if match and source[max(0, match.start()-60):match.end()+100].strip() == item["snippet"]:
                    item["line"] = evidence_line(source, match)
    return sorted(profiles, key=lambda candidate: candidate["createdAt"], reverse=True)


@app.get("/candidates/{candidate_id}/file")
def download(candidate_id: str):
    with db() as connection:
        row = connection.get(CandidateRecord, candidate_id)
        if not row:
            raise HTTPException(404, "Candidate not found")
        extension = Path(json.loads(row.data)["filename"]).suffix.lower()
        content = row.content
    return Response(content, media_type="application/octet-stream", headers={"Content-Disposition": f'attachment; filename="cv-{candidate_id}{extension}"', "X-Content-Type-Options": "nosniff"})
