import type { JobResult, Keyword, Status } from "@/components/kit"

/** Invented data for the style guide only. Deleted along with this page. */

export const CUTOFF = 65

export const RESULTS: JobResult[] = [
  { job: "Backend", shortlisted: 12, rejected: 28 },
  { job: "Designer", shortlisted: 9, rejected: 16 },
  { job: "QA Lead", shortlisted: 5, rejected: 11 },
  { job: "Data Eng", shortlisted: 7, rejected: 13 },
  { job: "PM", shortlisted: 4, rejected: 6 },
  { job: "DevOps", shortlisted: 3, rejected: 9 },
  { job: "Support", shortlisted: 2, rejected: 4 },
]

export const KEYWORDS: Keyword[] = [
  { id: "k1", label: "Python", kind: "must", synonyms: ["py", "python3"] },
  { id: "k2", label: "PostgreSQL", kind: "must", synonyms: ["postgres"] },
  { id: "k3", label: "REST APIs", kind: "must", synonyms: [] },
  { id: "k4", label: "Docker", kind: "good", weight: 4, synonyms: ["containers"] },
  { id: "k5", label: "AWS", kind: "good", weight: 3, synonyms: [] },
  { id: "k6", label: "Kafka", kind: "good", weight: 2, synonyms: [] },
]

export type SampleCandidate = {
  id: string
  name: string
  job: string
  score: number | null
  status: Status
  uploaded: string
}

export const CANDIDATES: SampleCandidate[] = [
  { id: "c1", name: "Maya Fernandes", job: "Backend Engineer", score: 86, status: "shortlisted", uploaded: "4 Nov 2026" },
  { id: "c2", name: "Daniel Okafor", job: "Backend Engineer", score: 71, status: "shortlisted", uploaded: "4 Nov 2026" },
  { id: "c3", name: "Lena Novak", job: "Product Designer", score: 52, status: "rejected", uploaded: "3 Nov 2026" },
  { id: "c4", name: "Processing", job: "Data Engineer", score: null, status: "processing", uploaded: "3 Nov 2026" },
  { id: "c5", name: "Tomás Rivera", job: "QA Lead", score: null, status: "failed", uploaded: "2 Nov 2026" },
]
