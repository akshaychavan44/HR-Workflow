"use client"

import {
  AlertTriangle,
  ArrowUpRight,
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
import Link from "next/link"

import {
  AnimatedNumber,
  Card,
  CardSubtitle,
  CardTitle,
  DataTable,
  EmptyState,
  HatchedProgress,
  HeroCard,
  HeroPill,
  IconBadge,
  InnerPanel,
  PillButton,
  ScoreBar,
  SegmentedControl,
  Stagger,
  StatTile,
  StatusDot,
  type Column,
  type Status,
} from "@/components/kit"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Candidate = {
  id: string
  name: string
  job: string
  score: number | null
  status: Status
  uploaded: string
}

const CANDIDATES: Candidate[] = []
const DEFAULT_CUTOFF = 0

const COLUMNS: Column<Candidate>[] = [
  { key: "name", header: "Candidate", cell: (c) => <span className="font-medium">{c.name}</span> },
  { key: "job", header: "Job", cell: (c) => <span className="text-ink-secondary">{c.job}</span> },
  { key: "score", header: "Score", cell: (c) => (c.score === null ? "—" : <ScoreBar score={c.score} cutoff={DEFAULT_CUTOFF} />) },
  { key: "status", header: "Status", cell: (c) => <StatusDot status={c.status} /> },
  { key: "uploaded", header: "Uploaded", cell: (c) => <span className="text-ink-secondary">{c.uploaded}</span> },
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

export default function OverviewPage() {
  const [filter, setFilter] = useState("all")

  return (
    <Stagger className="space-y-5 pb-8">
      <section className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr_1fr]">
          <Card className="flex flex-col">
            <CardTitle className="text-[15px]">Screening summary</CardTitle>
            <AnimatedNumber value={0} className="mt-2 block text-4xl font-semibold tracking-tight" />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <PillButton asChild><Link href="/jobs"><Upload aria-hidden />Upload CVs</Link></PillButton>
              <PillButton variant="secondary" asChild>
                <Link href="/job-setup"><Plus aria-hidden />New job</Link>
              </PillButton>
            </div>
            <InnerPanel className="mt-5 flex-1">
              <p className="text-xs text-ink-secondary">Open jobs · Total 0</p>
              <EmptyState icon={Users} message="No jobs yet." />
            </InnerPanel>
          </Card>

          <Card className="grid grid-cols-2 gap-3 p-4">
            <StatTile hero label="Shortlisted" value={0} icon={UserCheck} />
            <StatTile label="Rejected" value={0} icon={UserX} />
            <StatTile label="Total applicants" value={0} icon={Users} />
            <StatTile label="Needs attention" value={0} icon={AlertTriangle} />
          </Card>

          <Card className="flex flex-col">
            <CardTitle className="text-xl font-medium">Results by job</CardTitle>
            <CardSubtitle>Shortlisted vs rejected per job</CardSubtitle>
            <InnerPanel className="mt-4 flex-1">
              <EmptyState icon={Users} message="No screening results yet." className="min-h-52" />
            </InnerPanel>
          </Card>
        </div>

        <div className="grid gap-4 ">
          <HeroCard className="min-h-[300px] justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <AnimatedNumber value={0} className="text-[44px] leading-none font-semibold tracking-tight sm:text-[64px]" />
                <span className="text-sm text-white/85">shortlisted</span>
              </div>
              <HatchedProgress onHero value={0} max={0} label="Shortlisted of total applicants" className="mt-5" />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/85">
                <span>Shortlisted</span>
                <span>0 rejected · 0 processing</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <PillButton variant="hero" asChild><Link href="/jobs"><Upload aria-hidden />Upload CVs</Link></PillButton>
              <span className="text-xs text-white/75">0 applicants</span>
            </div>
          </HeroCard>

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
              <PillButton variant="secondary" onClick={() => toast("Notification preview")}>
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
                  <DialogDescription className="text-ink-secondary">Choose a saved job to upload and screen PDF or DOCX CVs.</DialogDescription>
                  <div className="flex flex-col items-center gap-3 rounded-panel border-2 border-dashed border-ink-muted/40 px-6 py-10 text-center">
                    <IconBadge icon={UploadCloud} className="size-11" />
                    <PillButton asChild><Link href="/jobs">Choose a job</Link></PillButton>
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
            <HatchedProgress value={0} max={0} label="Shortlist rate" className="mt-3" />
            <p className="text-[13px]">
              <span className="font-medium">0 shortlisted</span> <span className="text-ink-muted">out of 0</span>
            </p>
          </Card>
          <Card lift={false} className="space-y-4">
            <CardTitle>Filter with counts</CardTitle>
            <SegmentedControl
              label="Candidate status"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All", count: 0 },
                { value: "shortlisted", label: "Shortlisted", count: 0 },
                { value: "rejected", label: "Rejected", count: 0 },
                { value: "processing", label: "Processing", count: 0 },
                { value: "failed", label: "Failed", count: 0 },
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
