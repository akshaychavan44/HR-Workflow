"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveJob } from "@/lib/jobs"
import { Search } from "lucide-react"
import { Card, CardTitle, EmptyState, KeywordChip, PillButton, SegmentedControl, Stagger, type Keyword } from "@/components/kit"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@/components/ui/number-field"
import { Textarea } from "@/components/ui/textarea"

const DEFAULT_CUTOFF = 0

export default function JobSetupPage() {
  const router = useRouter()
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const savedId = useRef<string | null>(null)
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [tab, setTab] = useState<Keyword["kind"]>("must")
  const [cutoff, setCutoff] = useState(DEFAULT_CUTOFF)
  const [newKeyword, setNewKeyword] = useState("")

  const visible = keywords.filter((k) => k.kind === tab)

  const handleSave = async () => {
    if (saving) return
    setSaveError("")
    const title = titleRef.current?.value.trim() ?? ""
    const description = descriptionRef.current?.value.trim() ?? ""
    if (!title || !description) {
      setSaveError("Enter a job title and description before saving.")
      ;(!title ? titleRef.current : descriptionRef.current)?.focus()
      return
    }
    if (newKeyword.trim()) {
      setSaveError("Click Add to include your last keyword before saving.")
      return
    }
    setSaving(true)
    try {
      savedId.current ??= crypto.randomUUID()
      await saveJob({ id: savedId.current, title, description, cutoff, keywords, createdAt: new Date().toISOString() })
      toast.success("Job saved")
      router.push("/jobs")
    } catch {
      setSaveError("Could not save the job. Make sure the Python backend is running, then try again.")
      setSaving(false)
    }
  }

  const addKeyword = () => {
    const label = newKeyword.trim()
    if (!label) return
    setKeywords((all) => [
      ...all,
      { id: crypto.randomUUID(), label, kind: tab, weight: tab === "good" ? 3 : undefined, synonyms: [] },
    ])
    setNewKeyword("")
  }

  const keywordTabs = (label: string) => (
    <SegmentedControl
      className="mt-4 self-start"
      label={label}
      value={tab}
      onChange={setTab}
      options={[
        { value: "must", label: "Must-have" },
        { value: "good", label: "Good-to-have" },
      ]}
    />
  )

  return (
    <Stagger className="space-y-5 pb-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Job setup</h1>
        <p className="text-sm text-ink-secondary">Define the role, screening keywords, and shortlist cutoff.</p>
        <p className="text-xs text-ink-muted">Save the role, then upload CVs from Jobs to screen candidates.</p>
      </header>
      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card lift={false} className="space-y-6">
            <CardTitle>Role details</CardTitle>
            <div className="space-y-2">
              <Label htmlFor="job-title">Title</Label>
              <Input ref={titleRef} id="job-title" placeholder="Enter a job title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-description">Description</Label>
              <Textarea ref={descriptionRef} id="job-description" placeholder="What the role involves" className="min-h-32 text-sm leading-6" required />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-5">
              <div className="space-y-2">
                <Label htmlFor="job-cutoff">Shortlist cutoff</Label>
                <p id="cutoff-help" className="text-xs leading-5 text-ink-secondary">Minimum screening score, out of 100.</p>
              </div>
              <NumberField id="job-cutoff" className="w-60 max-w-full" value={cutoff} min={0} max={100} step={1} onValueChange={(value) => setCutoff(value ?? 0)}>
                <NumberFieldGroup>
                  <NumberFieldDecrement aria-label="Decrease shortlist cutoff" />
                  <NumberFieldInput aria-describedby="cutoff-help" />
                  <NumberFieldIncrement aria-label="Increase shortlist cutoff" />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </Card>
          <Card lift={false} className="flex flex-col">
            <CardTitle>Keywords</CardTitle>
            {keywordTabs("Keyword type for editing")}
            {visible.length === 0 ? <EmptyState icon={Search} message="No keywords added." /> : null}
            <div className="mt-4 flex flex-1 flex-wrap content-start gap-2">
              {visible.map((k) => (
                <KeywordChip
                  key={k.id}
                  keyword={k}
                  onChange={(next) => setKeywords((all) => all.map((item) => (item.id === next.id ? next : item)))}
                  onRemove={() => setKeywords((all) => all.filter((item) => item.id !== k.id))}
                />
              ))}
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                addKeyword()
              }}
            >
              <Input aria-label="New keyword" placeholder="Add a keyword" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} />
              <PillButton type="submit">Add</PillButton>
            </form>
          </Card>
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role={saveError ? "alert" : undefined} className={saveError ? "text-sm text-destructive" : "text-xs text-ink-secondary"}>
          {saveError || "Save this role to view its requirements under Jobs."}
        </p>
        <PillButton onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Job"}</PillButton>
      </div>
    </Stagger>
  )
}
