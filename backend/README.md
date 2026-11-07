# Local recruitment backend

From the repository root, run:

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python.exe backend/migrate.py
backend/.venv/Scripts/python.exe -m uvicorn app:app --app-dir backend --host 127.0.0.1 --port 8000
pnpm --dir web dev
```

Before running the migration, configure `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) in the git-ignored `backend/.env` for a Neon development branch. SQLAlchemy defines the schema in `database.py`; `migrate.py` creates the initial tables without dropping existing data. Future schema changes require versioned migrations.

Run the two servers in separate terminals. Jobs are saved directly to Neon Postgres.

Jobs, candidate profiles, and original CV bytes are stored in the Neon tables `hr_jobs` and `hr_candidates`.

Install LibreOffice on every machine that runs the backend. On Windows, the default installation location works automatically. Set `SOFFICE_PATH` when LibreOffice is installed elsewhere. The backend converts Word, OpenDocument, Excel, and PowerPoint files to a temporary PDF before extracting text.

Choose a job, select PDF, Word, OpenDocument, spreadsheet, or presentation files, then click Upload CVs. Supported extensions are PDF, DOC, DOCX, ODT, RTF, XLS, XLSX, ODS, PPT, PPTX, and ODP. Uploads run one at a time and report individual failures. Exact duplicate files for the same job reuse the existing profile; the same CV can be uploaded for a different role.

The screening score is matched keyword weight divided by total keyword weight, rounded to 0–100. Must-have keywords have weight 5; optional keywords use their configured 1–5 weight. Matching ignores case and accepts configured synonyms. Missing must-have keywords prevent a meets-cutoff result. All results require HR review. Job descriptions and years of experience are not semantically evaluated. Name/contact extraction is heuristic. Scanned PDFs need OCR/manual review and are unscored. Password-protected and malformed files are rejected. Limit: 10 MB/file and 50 PDF pages after conversion.

Tests: database integration tests require `TEST_DATABASE_URL` pointing to a dedicated, migrated Neon test database; without it they are skipped. Do not point tests at a database containing real records.

```powershell
cd backend
.venv/Scripts/python.exe -m unittest test_app -v
```

This backend runs locally and binds only to loopback. It has no authentication yet. Do not expose it publicly with candidate data. Production needs authentication/authorization, backend hosting, and an authenticated proxy. Vercel does not run this local Python process; no live deployment is included. `HR_BACKEND_URL` configures the Next.js proxy destination when a hosted backend is ready. Database credentials belong only in the backend environment, never in a NEXT_PUBLIC variable.
