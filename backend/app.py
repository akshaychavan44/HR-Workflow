import hashlib
import io
import json
import re
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from docx import Document
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field
from pypdf import PdfReader
from sqlalchemy import select, text as sql_text
from sqlalchemy.dialects.postgresql import insert
from database import db, JobRecord, CandidateRecord

app = FastAPI(title="HR Workflow")


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


def extract(content, extension):
    if extension == ".pdf":
        reader = PdfReader(io.BytesIO(content))
        if reader.is_encrypted:
            raise ValueError("Password-protected PDFs are not supported.")
        if len(reader.pages) > 50:
            raise ValueError("Use a CV with 50 pages or fewer.")
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    with zipfile.ZipFile(io.BytesIO(content)) as archive:
        if sum(item.file_size for item in archive.infolist()) > 30 * 1024 * 1024:
            raise ValueError("This DOCX expands beyond the supported size.")
    document = Document(io.BytesIO(content))
    return "\n".join([p.text for p in document.paragraphs] + [cell.text for table in document.tables for row in table.rows for cell in row.cells])


def screen(text, job):
    evidence = []
    total = earned = 0
    for keyword in job["keywords"]:
        weight = 5 if keyword["kind"] == "must" else keyword.get("weight") or 3
        total += weight
        match = None
        for term in [keyword["label"], *keyword["synonyms"]]:
            if not term.strip():
                continue
            pattern = r"(?<!\w)" + r"\s+".join(re.escape(part) for part in term.strip().split()) + r"(?!\w)"
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                break
        if match:
            earned += weight
        evidence.append({"label": keyword["label"], "kind": keyword["kind"], "weight": weight,
                         "matched": bool(match), "snippet": text[max(0, match.start()-60):match.end()+100].strip() if match else None})
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
    if extension not in (".pdf", ".docx"):
        raise HTTPException(400, "Choose a PDF or DOCX file.")
    content = file.file.read(10 * 1024 * 1024 + 1)
    if not content or len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "Each CV must be between 1 byte and 10 MB.")
    digest = hashlib.sha256(content).hexdigest()
    with db() as connection:
        previous = connection.scalar(select(CandidateRecord.data).where(CandidateRecord.job_id == job_id, CandidateRecord.digest == digest))
    if previous:
        return {"candidate": json.loads(previous), "duplicate": True}
    try:
        text = extract(content, extension)[:200000]
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    except Exception as error:
        raise HTTPException(400, "Could not read this file. Upload a valid, unencrypted PDF or DOCX.") from error
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
        return sorted([json.loads(data) for data in connection.scalars(query)], key=lambda candidate: candidate["createdAt"], reverse=True)


@app.get("/candidates/{candidate_id}/file")
def download(candidate_id: str):
    with db() as connection:
        row = connection.get(CandidateRecord, candidate_id)
        if not row:
            raise HTTPException(404, "Candidate not found")
        extension = Path(json.loads(row.data)["filename"]).suffix.lower()
        content = row.content
    return Response(content, media_type="application/octet-stream", headers={"Content-Disposition": f'attachment; filename="cv-{candidate_id}{extension}"', "X-Content-Type-Options": "nosniff"})
