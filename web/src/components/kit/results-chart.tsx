"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type JobResult = { job: string; shortlisted: number; rejected: number }

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: JobResult }>
}) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  return (
    <div className="rounded-panel bg-surface px-3 py-2.5 text-xs text-ink shadow-lg shadow-black/5">
      <p className="mb-1.5 font-medium">{row.job}</p>
      <p className="flex items-center justify-between gap-6 text-ink-secondary">
        Shortlisted <span className="font-medium tabular-nums text-ink">{row.shortlisted}</span>
      </p>
      <p className="flex items-center justify-between gap-6 text-ink-secondary">
        Rejected <span className="font-medium tabular-nums text-ink">{row.rejected}</span>
      </p>
    </div>
  )
}

/** Eight bars share a narrow panel, so labels stay short. The tooltip has the full title. */
const shortLabel = (job: string) => (job.length > 6 ? `${job.slice(0, 5)}…` : job)

export function ChartLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-ink-secondary">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-orange" aria-hidden />
        Shortlisted
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-ink" aria-hidden />
        Rejected
      </span>
    </div>
  )
}

/** Per job: a solid ink bar for rejected with a solid accent bar stacked on top. */
export function ResultsChart({ data, height = 220 }: { data: JobResult[]; height?: number }) {
  const summary = data.map((d) => `${d.job}: ${d.shortlisted} shortlisted, ${d.rejected} rejected`).join("; ")

  return (
    <div role="img" aria-label={`Shortlisted vs rejected per job. ${summary}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -24 }} barCategoryGap="16%">
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
          <XAxis
            dataKey="job"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            tickFormatter={shortLabel}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--text-primary)", fillOpacity: 0.04, radius: 8 }}
            content={ChartTooltip}
          />
          <Bar dataKey="rejected" stackId="a" fill="var(--text-primary)" stroke="var(--panel)" strokeWidth={2} radius={8} animationDuration={600} />
          <Bar dataKey="shortlisted" stackId="a" fill="var(--accent-orange)" stroke="var(--panel)" strokeWidth={2} radius={8} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
