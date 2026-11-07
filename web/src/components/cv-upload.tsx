"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Upload } from "lucide-react"
import { PillButton } from "@/components/kit"
import { api } from "@/lib/jobs"

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.odt,.rtf,.xls,.xlsx,.ods,.ppt,.pptx,.odp"
const ACCEPTED_FILE_PATTERN = /\.(pdf|doc|docx|odt|rtf|xls|xlsx|ods|ppt|pptx|odp)$/i

export function CvUpload({ jobId }: { jobId: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const upload = async () => {
    setBusy(true)
    setResults([])
    for (const file of files) {
      try {
        if (!ACCEPTED_FILE_PATTERN.test(file.name) || file.size > 10 * 1024 * 1024 || file.size === 0) throw new Error("Use a non-empty PDF, office document, spreadsheet, or presentation up to 10 MB.")
        const form = new FormData()
        form.append("file", file)
        const result = await api<{ duplicate: boolean }>(`/jobs/${encodeURIComponent(jobId)}/candidates`, { method: "POST", body: form })
        setResults((all) => [...all, `${file.name}: ${result.duplicate ? "Already uploaded for this job; existing profile kept." : "Candidate profile created."}`])
      } catch (e) {
        setResults((all) => [...all, `${file.name}: ${e instanceof Error ? e.message : "Upload failed. Try again."}`])
      }
    }
    setBusy(false)
  }
  return (
    <div className="space-y-3 border-t border-ink/10 pt-4">
      <label className="block text-sm font-medium">CV files
        <input ref={input} type="file" accept={ACCEPTED_FILE_TYPES} multiple disabled={busy} className="mt-2 block w-full rounded-field bg-panel p-3 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-3 file:py-2" onChange={(e) => { setFiles(Array.from(e.target.files ?? [])); setResults([]) }} />
      </label>
      <p className="text-xs text-ink-muted">PDF, Word, spreadsheet, or presentation files, up to 10 MB each. Office files are converted to PDF before screening. Scanned PDFs may need manual review.</p>
      <PillButton disabled={!files.length || busy} onClick={upload}><Upload aria-hidden />{busy ? "Screening CVs…" : `Upload CVs${files.length ? ` (${files.length})` : ""}`}</PillButton>
      <ul aria-live="polite" className="space-y-1 text-xs text-ink-secondary">{results.map((result, i) => <li key={i} className="break-words">{result}</li>)}</ul>
      {results.length > 0 && !busy && <Link className="inline-block text-sm underline" href={`/candidates?job=${encodeURIComponent(jobId)}`}>Open screening results</Link>}
    </div>
  )
}
