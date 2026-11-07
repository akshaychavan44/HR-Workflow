"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardTitle, PillButton, Stagger } from "@/components/kit"
import { api } from "@/lib/jobs"

type SkillEvidence = {
  label: string
  kind: "must" | "good"
  weight: number
  matched: boolean
  line?: { before: string; term: string; after: string } | null
}

type Candidate = {
  id: string; name: string; email: string | null; phone: string | null; jobTitle: string; jobId: string
  filename: string; score: number | null; status: string; cutoff: number; notes: string[]; text: string
  evidence: SkillEvidence[]
}
const labels: Record<string, string> = { meets_cutoff: "Meets cutoff · HR review", below_requirements: "Below requirements · HR review", needs_review: "Needs manual review" }

function SkillEvidenceRow({ skill }: { skill: SkillEvidence }) {
  const { label, kind, weight, matched, line } = skill
  return (
    <li className="rounded-field bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <p className="min-w-0 wrap-anywhere font-semibold">
          {label} <span className="text-xs font-normal text-ink-secondary">· {kind === "must" ? "Must-have" : "Good-to-have"}</span>
        </p>
        <p className="flex shrink-0 items-baseline gap-2">
          <span className="text-ink-secondary">{matched ? "Found" : "Not found"}</span>
          <span className="font-semibold tabular-nums">{matched ? weight : 0}/{weight} points</span>
        </p>
      </div>
      {line ? (
        <p className="mt-1.5 wrap-anywhere whitespace-pre-wrap text-sm leading-6">
          {line.before}<mark className="rounded bg-orange-tint font-semibold text-orange-tint-ink">{line.term}</mark>{line.after}
        </p>
      ) : null}
    </li>
  )
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  useEffect(() => {
    const job = new URLSearchParams(window.location.search).get("job")
    let active = true
    api<Candidate[]>(`/candidates${job ? `?job_id=${encodeURIComponent(job)}` : ""}`).then((data) => { if (active) setCandidates(data) }).catch((e) => { if (active) setError(e.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const visible = candidates.filter((c) => `${c.name} ${c.email ?? ""} ${c.jobTitle}`.toLowerCase().includes(search.toLowerCase()))
  return <Stagger className="space-y-5 pb-8">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">Candidates</h1><p className="mt-1 text-sm text-ink-secondary">CV profiles and screening evidence for HR review.</p></div><PillButton asChild><Link href="/jobs">Upload CVs</Link></PillButton></header>
    <input aria-label="Search candidates" placeholder="Search name, email, or job" value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full rounded-field bg-surface px-4 text-sm" />
    {loading ? <p role="status">Loading candidates…</p> : error ? <p role="alert">{error} <button className="underline" onClick={() => window.location.reload()}>Retry</button></p> : !visible.length ? <Card lift={false}><p className="text-sm text-ink-secondary">No candidates found. Upload CVs from a saved job.</p></Card> : visible.map((c) => <Card key={c.id} lift={false} className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><CardTitle className="text-lg">{c.name}</CardTitle><p className="mt-1 text-sm text-ink-secondary">{c.jobTitle}</p></div><div className="text-right"><p className="text-xl font-semibold tabular-nums">{c.score === null ? "Unscored" : `${c.score}/100`}</p><p className="text-xs text-ink-secondary">{labels[c.status]} · Cutoff {c.cutoff}</p></div></div>
      <p className="text-sm text-ink-secondary">{c.email ?? "Email not found"} · {c.phone ?? "Phone not found"}</p>
      <details className="rounded-panel bg-panel p-4"><summary className="cursor-pointer text-sm font-medium">View candidate profile and evidence</summary><div className="mt-4 space-y-4">
        <ul className="space-y-1 text-xs text-ink-secondary">{c.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        <a href={`/api/hr/candidates/${encodeURIComponent(c.id)}/file`} className="inline-block text-sm underline">Download original CV: {c.filename}</a>
        {c.evidence.length ? (
          <ul aria-label="Skill matches" className="space-y-2">
            {c.evidence.map((item, index) => <SkillEvidenceRow key={index} skill={item} />)}
          </ul>
        ) : null}
        <details><summary className="cursor-pointer text-sm">Extracted CV text</summary><p className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-5">{c.text || "No readable text extracted."}</p></details>
      </div></details>
    </Card>)}
  </Stagger>
}
