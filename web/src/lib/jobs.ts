import type { Keyword } from "@/components/kit/keyword-chip"

export type SavedJob = {
  id: string
  title: string
  description: string
  cutoff: number
  keywords: Keyword[]
  createdAt: string
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/hr${path}`, { ...init, cache: "no-store" })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(typeof body?.detail === "string" ? body.detail : "Could not reach the recruitment server. Make sure the Python backend is running.")
  }
  return response.json()
}

export async function loadJobs(): Promise<SavedJob[]> {
  return api<SavedJob[]>("/jobs")
}

export async function saveJob(job: SavedJob) {
  return api<SavedJob>("/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(job) })
}
