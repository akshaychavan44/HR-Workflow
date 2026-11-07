"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BriefcaseBusiness, Plus } from "lucide-react"
import { Card, CardTitle, EmptyState, KeywordChip, PillButton, Stagger } from "@/components/kit"
import { loadJobs, type SavedJob } from "@/lib/jobs"
import { CvUpload } from "@/components/cv-upload"

export default function JobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    let active = true
    loadJobs().then((data) => { if (active) setJobs(data) }).catch((e) => { if (active) setError(e.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <Stagger className="space-y-5 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Jobs</h1>
          <p className="text-sm text-ink-secondary">Saved roles and screening requirements.</p>
          <p className="text-xs text-ink-muted">Upload CVs to screen them against a saved role.</p>
        </div>
        <PillButton asChild><Link href="/job-setup"><Plus aria-hidden />New job</Link></PillButton>
      </header>
      {loading ? <p role="status" className="text-sm text-ink-secondary">Loading jobs…</p> : error ? <p role="alert" className="text-sm text-destructive">{error} <button onClick={() => window.location.reload()} className="underline">Retry</button></p> : jobs.length === 0 ? (
        <Card lift={false}><EmptyState icon={BriefcaseBusiness} message="No saved jobs yet. Create a role in Job Setup to get started." /></Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} lift={false} className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="break-words text-lg">{job.title}</CardTitle>
                <span className="shrink-0 rounded-full bg-panel px-3 py-1.5 text-xs text-ink-secondary">Cutoff {job.cutoff}/100</span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink-secondary">{job.description}</p>
              {(["must", "good"] as const).map((kind) => (
                <div key={kind} className="space-y-2">
                  <h3 className="text-sm font-medium">{kind === "must" ? "Must-have" : "Good-to-have"}</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.keywords.filter((k) => k.kind === kind).map((k) => <KeywordChip key={k.id} keyword={k} />)}
                    {!job.keywords.some((k) => k.kind === kind) && <p className="text-xs text-ink-muted">No keywords added.</p>}
                  </div>
                </div>
              ))}
              <CvUpload jobId={job.id} />
              <Link href={`/candidates?job=${encodeURIComponent(job.id)}`} className="text-sm underline">View candidates for this job</Link>
            </Card>
          ))}
        </div>
      )}
    </Stagger>
  )
}
