import io
import json
import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch
if os.environ.get("TEST_DATABASE_URL"):
    os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
from fastapi.testclient import TestClient
from docx import Document
from pypdf import PdfWriter
from app import app, candidates, screen

client = TestClient(app)
job = {"id": "role", "title": "Developer", "description": "Build apps", "cutoff": 70, "createdAt": "2026-11-07",
       "keywords": [{"id": "one", "label": "React", "kind": "must", "synonyms": ["React.js"]},
                    {"id": "two", "label": "Python", "kind": "good", "weight": 3, "synonyms": []}]}


class WorkflowTests(unittest.TestCase):
    @unittest.skipUnless(os.environ.get("TEST_DATABASE_URL"), "Requires a dedicated migrated Neon test database")
    def test_complete_docx_workflow(self):
        self.assertEqual(client.post("/jobs", json=job).status_code, 200)
        document = Document()
        document.add_paragraph("Avery Example")
        document.add_paragraph("avery@example.com +1 202 555 0123")
        document.add_paragraph("Developed React.js interfaces and Python APIs.")
        data = io.BytesIO()
        document.save(data)
        content = data.getvalue()
        response = client.post("/jobs/role/candidates", files={"file": ("cv.docx", content)})
        self.assertEqual(response.status_code, 200, response.text)
        profile = response.json()["candidate"]
        self.assertEqual(profile["score"], 100)
        self.assertEqual(profile["email"], "avery@example.com")
        self.assertEqual(profile["status"], "meets_cutoff")
        self.assertTrue(client.post("/jobs/role/candidates", files={"file": ("cv.docx", content)}).json()["duplicate"])
        self.assertEqual(len(client.get("/candidates?job_id=role").json()), 1)
        self.assertEqual(client.get(f'/candidates/{profile["id"]}/file').content, content)
        changed = {**job, "title": "Updated role"}
        client.post("/jobs", json=changed)
        self.assertEqual(client.get("/jobs").json()[0]["title"], "Updated role")

    def test_missing_required_and_boundaries(self):
        result = screen("Python developer using reactive interfaces for multiple projects.", job)
        self.assertEqual(result["status"], "below_requirements")
        self.assertFalse(result["evidence"][0]["matched"])
        self.assertIsNone(screen("Experienced developer building application interfaces.", {**job, "keywords": []})["score"])

    def test_evidence_shows_full_line_for_new_and_existing_matches(self):
        role = {**job, "keywords": [{**job["keywords"][0], "label": "Frontend framework"}]}
        before = "Built a customer portal and designed accessible, responsive interfaces using "
        source = f"Technical skills\n{before}React.js and Tailwind CSS.\nOther experience"
        result = screen(source, role)
        line = {"before": before, "term": "React.js", "after": " and Tailwind CSS."}
        self.assertEqual(result["score"], 100)
        self.assertEqual(result["evidence"][0]["line"], line)

        item = result["evidence"][0].copy()
        del item["line"]
        start = source.index("React.js")
        item["snippet"] = source[start - 60:].strip()
        profile = {"jobId": role["id"], "createdAt": role["createdAt"], "text": source, "evidence": [item]}
        with patch("app.db") as database:
            database.return_value.__enter__.return_value.scalars.side_effect = [
                [json.dumps(profile)], [SimpleNamespace(id=role["id"], data=json.dumps(role))],
            ]
            profiles = candidates(job_id=role["id"])
        self.assertEqual(profiles[0]["evidence"][0]["line"], line)

    @unittest.skipUnless(os.environ.get("TEST_DATABASE_URL"), "Requires a dedicated migrated Neon test database")
    def test_invalid_and_scanned_files(self):
        client.post("/jobs", json=job)
        self.assertEqual(client.post("/jobs/missing/candidates", files={"file": ("cv.pdf", b"bad")}).status_code, 404)
        self.assertEqual(client.post("/jobs/role/candidates", files={"file": ("cv.txt", b"bad")}).status_code, 400)
        self.assertEqual(client.post("/jobs/role/candidates", files={"file": ("cv.docx", b"bad")}).status_code, 400)
        writer = PdfWriter()
        writer.add_blank_page(width=600, height=800)
        data = io.BytesIO()
        writer.write(data)
        response = client.post("/jobs/role/candidates", files={"file": ("scan.pdf", data.getvalue())})
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["candidate"]["score"])
        self.assertEqual(response.json()["candidate"]["status"], "needs_review")


if __name__ == "__main__":
    unittest.main()
