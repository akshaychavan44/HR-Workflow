import io
import unittest
import uuid
from docx import Document
from pypdf import PdfWriter
from fastapi.testclient import TestClient
from sqlalchemy import delete
from app import app
from database import db, JobRecord, CandidateRecord


class NeonWorkflowTest(unittest.TestCase):
    def test_workflow(self):
        job_id = "test-" + str(uuid.uuid4())
        client = TestClient(app)
        job = {"id": job_id, "title": "Test developer", "description": "Test role", "cutoff": 70,
               "createdAt": "2026-11-07", "keywords": [{"id": "one", "label": "React", "kind": "must", "synonyms": ["React.js"]}]}
        route = f"/jobs/{job_id}/candidates"
        try:
            self.assertEqual(client.post("/jobs", json=job).status_code, 200)
            document = Document()
            document.add_paragraph("Avery Example")
            document.add_paragraph("avery@example.com +1 202 555 0123")
            document.add_paragraph("Developed React.js interfaces and Python APIs.")
            buffer = io.BytesIO()
            document.save(buffer)
            content = buffer.getvalue()
            response = client.post(route, files={"file": ("cv.docx", content)})
            self.assertEqual(response.status_code, 200, response.text)
            candidate = response.json()["candidate"]
            self.assertEqual(candidate["score"], 100)
            self.assertEqual(candidate["email"], "avery@example.com")
            self.assertTrue(client.post(route, files={"file": ("cv.docx", content)}).json()["duplicate"])
            self.assertEqual(len(client.get(f"/candidates?job_id={job_id}").json()), 1)
            self.assertEqual(client.get(f'/candidates/{candidate["id"]}/file').content, content)
            self.assertEqual(client.post(route, files={"file": ("cv.txt", b"bad")}).status_code, 400)
            self.assertEqual(client.post(route, files={"file": ("cv.docx", b"bad")}).status_code, 400)
            writer = PdfWriter()
            writer.add_blank_page(width=600, height=800)
            buffer = io.BytesIO()
            writer.write(buffer)
            response = client.post(route, files={"file": ("scan.pdf", buffer.getvalue())})
            self.assertEqual(response.status_code, 200)
            self.assertIsNone(response.json()["candidate"]["score"])
            client.post("/jobs", json={**job, "title": "Updated role"})
            self.assertEqual(next(j for j in client.get("/jobs").json() if j["id"] == job_id)["title"], "Updated role")
        finally:
            with db() as connection:
                connection.execute(delete(CandidateRecord).where(CandidateRecord.job_id == job_id))
                connection.execute(delete(JobRecord).where(JobRecord.id == job_id))


if __name__ == "__main__":
    unittest.main()
