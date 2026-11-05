"use client"

import { LayoutGroup, motion } from "framer-motion"
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { pillSpring } from "@/lib/motion"

export type SegmentOption<T extends string> = {
  value: T
  label: ReactNode
  /** Optional count badge beside the label. */
  count?: number
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name of the group. */
  label: string
  className?: string
}) {
  const id = useId()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].value)
    buttons.current[next]?.focus()
  }

  return (
    <LayoutGroup id={id}>
      <div
        role="radiogroup"
        aria-label={label}
        className={cn("inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-panel p-1", className)}
      >
        {options.map((option, index) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttons.current[index] = el
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                "relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] whitespace-nowrap transition-colors",
                active ? "font-medium text-ink" : "text-ink-secondary hover:text-ink"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="segment"
                  transition={pillSpring}
                  className="absolute inset-0 rounded-full bg-surface shadow-[var(--card-shadow)]"
                />
              ) : null}
              <span className="relative">{option.label}</span>
              {option.count !== undefined ? (
                <span className="relative rounded-full bg-[color-mix(in_srgb,var(--panel),var(--text-primary)_8%)] px-1.5 text-[11px] leading-[18px] font-medium tabular-nums text-ink-secondary">
                  {option.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
