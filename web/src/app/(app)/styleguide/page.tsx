"use client"

import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Filter,
  Plus,
  Search,
  Sparkles,
  Upload,
  UploadCloud,
  UserCheck,
  Users,
  UserX,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  AnimatedNumber,
  Card,
  CardSubtitle,
  CardTitle,
  ChartLegend,
  DataTable,
  EmptyState,
  HatchedProgress,
  HeroCard,
  HeroPill,
  IconBadge,
  InnerPanel,
  KeywordChip,
  PillButton,
  ResultsChart,
  ScoreBar,
  SegmentedControl,
  Stagger,
  StatTile,
  StatusDot,
  TrendBadge,
  type Column,
  type Keyword,
} from "@/components/kit"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

import { CANDIDATES, CUTOFF, KEYWORDS, RESULTS, type SampleCandidate } from "./sample-data"

const COLUMNS: Column<SampleCandidate>[] = [
  { key: "name", header: "Candidate", cell: (c) => <span className="font-medium">{c.name}</span> },
  { key: "job", header: "Job", cell: (c) => <span className="text-ink-secondary">{c.job}</span> },
  { key: "score", header: "Score", cell: (c) => (c.score === null ? "—" : <ScoreBar score={c.score} cutoff={CUTOFF} />) },
  { key: "status", header: "Status", cell: (c) => <StatusDot status={c.status} /> },
  { key: "uploaded", header: "Uploaded", cell: (c) => <span className="text-ink-secondary">{c.uploaded}</span> },
]

const OPEN_JOBS = [
  { title: "Backend Engineer", applicants: 48, shortlisted: 12, status: "open" as const },
  { title: "Product Designer", applicants: 31, shortlisted: 9, status: "open" as const },
  { title: "QA Lead", applicants: 22, shortlisted: 5, status: "closed" as const },
]

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 pt-4">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-ink">{title}</h2>
        {note ? <p className="mt-1 text-[13px] text-ink-secondary">{note}</p> : null}
      </div>
      {children}
    </section>
  )
}

export default function StyleguidePage() {
  const [keywords, setKeywords] = useState<Keyword[]>(KEYWORDS)
  const [tab, setTab] = useState<Keyword["kind"]>("must")
  const [filter, setFilter] = useState("all")
  const [cutoff, setCutoff] = useState(CUTOFF)
  const [newKeyword, setNewKeyword] = useState("")

  const visible = keywords.filter((k) => k.kind === tab)

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
      <section className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr_1fr]">
          <Card className="flex flex-col">
            <CardTitle className="text-[15px]">Screening summary</CardTitle>
            <AnimatedNumber value={1284} className="mt-2 block text-4xl font-semibold tracking-tight" />
            <TrendBadge className="mt-2" value="12" note="this week" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <PillButton>
                <Upload aria-hidden />
                Upload CVs
              </PillButton>
              <PillButton variant="secondary">
                <Plus aria-hidden />
                New job
              </PillButton>
            </div>
            <InnerPanel className="mt-5 flex-1">
              <p className="text-xs text-ink-secondary">Open jobs · Total 6</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {OPEN_JOBS.map((job) => (
                  <div key={job.title} className="min-w-0 rounded-xl bg-surface p-2.5">
                    <p className="truncate text-xs font-medium">{job.title}</p>
                    <p className="mt-1.5 text-sm font-semibold tabular-nums">{job.applicants}</p>
                    <p className="text-[10px] text-ink-muted">{job.shortlisted} shortlisted</p>
                    <StatusDot status={job.status} className="mt-1.5 text-[11px]" />
                  </div>
                ))}
              </div>
            </InnerPanel>
          </Card>

          <Card className="grid grid-cols-2 gap-3 p-4">
            <StatTile hero label="Shortlisted" value={42} icon={UserCheck} trend={<TrendBadge onHero value="7" note="this week" />} />
            <StatTile label="Rejected" value={72} icon={UserX} trend={<TrendBadge direction="down" value="5" note="this week" />} />
            <StatTile label="Total applicants" value={120} icon={Users} trend={<TrendBadge value="12" note="this week" />} />
            <StatTile label="Needs attention" value={6} icon={AlertTriangle} trend={<TrendBadge direction="down" value="2" note="this week" tone="success" />} />
          </Card>

          <Card className="flex flex-col">
            <CardTitle className="text-xl font-medium">Results by job</CardTitle>
            <CardSubtitle>Shortlisted vs rejected per job</CardSubtitle>
            <InnerPanel className="mt-4 flex-1">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium">Last 8 jobs</span>
                <ChartLegend />
              </div>
              <ResultsChart data={RESULTS} height={208} />
            </InnerPanel>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <HeroCard className="min-h-[300px] justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <AnimatedNumber value={42} className="text-[44px] leading-none font-semibold tracking-tight sm:text-[64px]" />
                <span className="text-sm text-white/85">shortlisted</span>
              </div>
              <HatchedProgress onHero value={42} max={120} marker={65} label="Shortlisted of total applicants" className="mt-5" />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/85">
                <span>Shortlisted</span>
                <span>72 rejected · 6 processing</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <PillButton variant="hero">
                <Upload aria-hidden />
                Upload CVs
              </PillButton>
              <span className="text-xs text-white/75">120 applicants</span>
            </div>
          </HeroCard>

          <Card className="flex flex-col">
            <CardTitle className="text-xl font-medium">Keywords</CardTitle>
            {keywordTabs("Keyword type")}
            <ul className="mt-4 flex-1 space-y-3">
              {visible.map((k) => (
                <li key={k.id} className="flex items-center gap-2.5 text-sm">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-orange-tint text-orange">
                    <Check className="size-3" strokeWidth={2} aria-hidden />
                  </span>
                  {k.label}
                  {k.kind === "good" ? <span className="ml-auto text-xs text-ink-muted">Weight {k.weight}</span> : null}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-muted">Used to screen every CV for this job.</p>
          </Card>
        </div>
      </section>

      <Section title="Buttons, badges and status">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card lift={false} className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <PillButton>
                <Upload aria-hidden />
                Primary
              </PillButton>
              <PillButton variant="secondary">Secondary</PillButton>
              <PillButton disabled>Disabled</PillButton>
              <PillButton size="sm">Small</PillButton>
            </div>
            <div className="hero-surface flex flex-wrap items-center gap-3 rounded-panel p-4">
              <PillButton variant="hero">
                <Upload aria-hidden />
                On hero
              </PillButton>
              <HeroPill>Open</HeroPill>
              <HeroPill>Overridden by HR</HeroPill>
            </div>
            <div className="flex flex-wrap gap-3">
              <PillButton variant="secondary" onClick={() => toast("Job saved")}>
                Show toast
              </PillButton>
              <Dialog>
                <DialogTrigger asChild>
                  <PillButton variant="secondary">
                    <UploadCloud aria-hidden />
                    Open dialog
                  </PillButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="text-xl font-medium">Upload CVs</DialogTitle>
                  <DialogDescription className="text-ink-secondary">PDF or DOCX. Screening starts right after upload.</DialogDescription>
                  <div className="flex flex-col items-center gap-3 rounded-panel border-2 border-dashed border-ink-muted/40 px-6 py-10 text-center">
                    <IconBadge icon={UploadCloud} className="size-11" />
                    <p className="text-sm text-ink-secondary">Drop files here, or browse</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          <Card lift={false} className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <IconBadge icon={UserCheck} />
              <IconBadge icon={Sparkles} />
              <InnerPanel className="inline-flex p-2">
                <IconBadge icon={Users} tone="onPanel" />
              </InnerPanel>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <StatusDot status="shortlisted" />
              <StatusDot status="rejected" />
              <StatusDot status="processing" />
              <StatusDot status="failed" />
              <StatusDot status="open" />
              <StatusDot status="closed" />
              <StatusDot status="overridden" />
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-warning-tint px-2.5 py-1 text-warning">Unknown</span>
              <span className="rounded-full bg-panel px-2.5 py-1 text-ink-secondary">Extracted</span>
              <span className="rounded-full bg-panel px-2.5 py-1 text-ink-secondary">Manual</span>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Progress and segmented controls">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card lift={false} className="space-y-3">
            <CardTitle>Shortlist rate</CardTitle>
            <HatchedProgress value={42} max={120} label="Shortlist rate" className="mt-3" />
            <p className="text-[13px]">
              <span className="font-medium">42 shortlisted</span> <span className="text-ink-muted">out of 120</span>
            </p>
          </Card>
          <Card lift={false} className="space-y-4">
            <CardTitle>Filter with counts</CardTitle>
            <SegmentedControl
              label="Candidate status"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All", count: 120 },
                { value: "shortlisted", label: "Shortlisted", count: 42 },
                { value: "rejected", label: "Rejected", count: 72 },
                { value: "processing", label: "Processing", count: 4 },
                { value: "failed", label: "Failed", count: 2 },
              ]}
            />
            <Select defaultValue="score">
              <SelectTrigger aria-label="Sort candidates" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Highest score</SelectItem>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>
      </Section>

      <Section title="Form fields and keyword chips" note="Chips with a chevron are editable: open one to change its synonyms and weight.">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card lift={false} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sg-title">Title</Label>
              <Input id="sg-title" defaultValue="Backend Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sg-description">Description</Label>
              <Textarea id="sg-description" placeholder="What the role involves" />
            </div>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <Label id="sg-cutoff">Shortlist cutoff</Label>
                <AnimatedNumber value={cutoff} duration={0.2} className="text-4xl font-semibold tracking-tight" />
              </div>
              <Slider aria-labelledby="sg-cutoff" value={[cutoff]} min={0} max={100} onValueChange={([v]) => setCutoff(v)} />
            </div>
          </Card>
          <Card lift={false} className="flex flex-col">
            <CardTitle>Keywords</CardTitle>
            {keywordTabs("Keyword type for editing")}
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
      </Section>

      <Section title="Data table">
        <Card lift={false}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl font-medium">Recent candidates</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.5} aria-hidden />
                <Input aria-label="Search candidates" placeholder="Search" className="h-10 w-48 rounded-full pl-10" />
              </div>
              <PillButton variant="secondary" size="sm" className="h-10">
                Filter
                <Filter aria-hidden />
              </PillButton>
            </div>
          </div>
          <DataTable
            caption="Recent candidates"
            selectable
            columns={COLUMNS}
            rows={CANDIDATES}
            getRowId={(c) => c.id}
            rowMenu={() => (
              <DropdownMenuItem>
                <ArrowUpRight strokeWidth={1.5} aria-hidden />
                Open profile
              </DropdownMenuItem>
            )}
            empty={<EmptyState icon={Users} message="No candidates yet." />}
          />
        </Card>
      </Section>
    </Stagger>
  )
}
