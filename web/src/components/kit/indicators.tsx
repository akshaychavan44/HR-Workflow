"use client"

import { animate, motion, useReducedMotion } from "framer-motion"
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react"
import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------- numbers */

const format = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

/** Counts up from 0 on first render, then eases between later values. */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 0.6,
  className,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  const node = useRef<HTMLSpanElement>(null)
  const shown = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const paint = (n: number) => {
      shown.current = n
      if (node.current) node.current.textContent = `${prefix}${format(n, decimals)}${suffix}`
    }
    if (reduced) {
      paint(value)
      return
    }
    const controls = animate(shown.current, value, { duration, ease: "easeOut", onUpdate: paint })
    return () => controls.stop()
  }, [value, decimals, prefix, suffix, duration, reduced])

  const final = `${prefix}${format(value, decimals)}${suffix}`
  return (
    <span className={cn("relative inline-block tabular-nums", className)}>
      <span className="sr-only">{final}</span>
      <span ref={node} aria-hidden>
        {`${prefix}${format(0, decimals)}${suffix}`}
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ badges */

type BadgeTone = "default" | "onPanel" | "hero"

export function IconBadge({
  icon: Icon,
  tone = "default",
  className,
}: {
  icon: LucideIcon
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full",
        tone === "default" && "bg-panel text-ink-secondary",
        tone === "onPanel" &&
          "bg-[color-mix(in_srgb,var(--panel),var(--text-primary)_8%)] text-ink-secondary",
        tone === "hero" && "bg-white/20 text-white",
        className
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
    </span>
  )
}

export function TrendBadge({
  direction = "up",
  value,
  note,
  tone,
  onHero = false,
  className,
}: {
  direction?: "up" | "down"
  value: ReactNode
  /** Muted text after the pill, e.g. "this week". */
  note?: ReactNode
  /** Overrides the default of green for up, red for down. */
  tone?: "success" | "danger"
  onHero?: boolean
  className?: string
}) {
  const Arrow = direction === "up" ? ArrowUp : ArrowDown
  const resolved = tone ?? (direction === "up" ? "success" : "danger")
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs", className)}>
      <span
        className={cn(
          "inline-flex h-[22px] items-center gap-1 rounded-full px-2 font-medium tabular-nums",
          onHero && "bg-white/20 text-white",
          !onHero && resolved === "success" && "bg-success-tint text-success",
          !onHero && resolved === "danger" && "bg-danger-tint text-danger"
        )}
      >
        <Arrow className="size-3" strokeWidth={2} aria-hidden />
        <span className="sr-only">{direction === "up" ? "Up" : "Down"}</span>
        {value}
      </span>
      {note ? <span className={onHero ? "text-white/75" : "text-ink-muted"}>{note}</span> : null}
    </span>
  )
}

/* ------------------------------------------------------------------ status */

export type Status =
  | "shortlisted"
  | "rejected"
  | "processing"
  | "failed"
  | "open"
  | "closed"
  | "overridden"

const STATUS: Record<Status, { label: string; dot: string; pulse?: boolean }> = {
  shortlisted: { label: "Shortlisted", dot: "bg-success" },
  rejected: { label: "Rejected", dot: "bg-danger" },
  processing: { label: "Processing", dot: "bg-warning", pulse: true },
  failed: { label: "Failed", dot: "bg-danger" },
  open: { label: "Open", dot: "bg-success" },
  closed: { label: "Closed", dot: "bg-ink-muted" },
  overridden: { label: "Overridden by HR", dot: "bg-orange" },
}

export function StatusDot({
  status,
  label,
  className,
}: {
  status: Status
  label?: ReactNode
  className?: string
}) {
  const s = STATUS[status]
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] text-ink", className)}>
      <span className="relative flex size-1.5">
        {s.pulse ? (
          <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", s.dot)} />
        ) : null}
        <span className={cn("relative size-1.5 rounded-full", s.dot)} />
      </span>
      {label ?? s.label}
    </span>
  )
}

/* ---------------------------------------------------------------- progress */

export function HatchedProgress({
  value,
  max = 100,
  marker,
  onHero = false,
  label,
  className,
}: {
  value: number
  max?: number
  /** Value at which to draw a small tick, e.g. the shortlist cutoff. */
  marker?: number
  onHero?: boolean
  /** Accessible name, e.g. "Shortlist rate". */
  label: string
  className?: string
}) {
  const safeMax = max > 0 ? max : 1
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100))
  const markerPct = marker === undefined ? null : Math.min(100, Math.max(0, (marker / safeMax) * 100))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={value}
      className={cn("relative h-2.5", className)}
    >
      <div className={cn("absolute inset-0 overflow-hidden rounded-full", onHero ? "hatch-on-hero" : "hatch")}>
        <motion.div
          className={cn("h-full rounded-full", onHero ? "bg-white" : "bg-orange")}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      {markerPct !== null ? (
        <span
          aria-hidden
          data-slot="progress-marker"
          className={cn(
            "absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full",
            onHero ? "bg-white ring-2 ring-[#e8633a]" : "bg-ink ring-2 ring-surface"
          )}
          style={{ left: `${markerPct}%` }}
        />
      ) : null}
    </div>
  )
}

/** Score as a number plus a short bar: orange at or above the cutoff, grey below. */
export function ScoreBar({ score, cutoff }: { score: number; cutoff: number }) {
  const passed = score >= cutoff
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="w-6 text-right text-[13px] font-medium tabular-nums text-ink">{score}</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-muted/20" aria-hidden>
        <span
          className={cn("block h-full rounded-full", passed ? "bg-orange" : "bg-ink-muted")}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </span>
    </span>
  )
}

/* -------------------------------------------------------------- stat tiles */

export function StatTile({
  label,
  value,
  icon,
  trend,
  hero = false,
  className,
}: {
  label: string
  value: number
  icon: LucideIcon
  /** Usually a `TrendBadge`. Pass `onHero` when the tile is `hero`. */
  trend?: ReactNode
  hero?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-[148px] flex-col justify-between rounded-panel p-4",
        hero ? "hero-surface" : "bg-panel text-ink",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("text-[13px]", hero ? "text-white/85" : "text-ink-secondary")}>{label}</span>
        <IconBadge icon={icon} tone={hero ? "hero" : "onPanel"} />
      </div>
      <div className="mt-4 space-y-2.5">
        <AnimatedNumber value={value} className="block text-[32px] leading-none font-semibold tracking-tight" />
        {trend}
      </div>
    </div>
  )
}
