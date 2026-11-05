"use client"

import { ChevronDown, Plus, X } from "lucide-react"
import { useState, type FormEvent } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PillButton } from "./pill-button"

export type Keyword = {
  id: string
  label: string
  kind: "must" | "good"
  /** 1–5. Only used for good-to-have keywords. */
  weight?: number
  synonyms: string[]
}

function WeightDots({ weight }: { weight: number }) {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`Weight ${weight} of 5`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn("size-[5px] rounded-full", n <= weight ? "bg-ink-secondary" : "bg-ink-muted/35")}
        />
      ))}
    </span>
  )
}

/**
 * A keyword pill. Pass `onChange` to make it expandable, which opens an editor
 * for its synonyms (and weight, when good-to-have). Without it the chip is
 * read-only.
 */
export function KeywordChip({
  keyword,
  onChange,
  onRemove,
}: {
  keyword: Keyword
  onChange?: (next: Keyword) => void
  onRemove?: () => void
}) {
  const [draft, setDraft] = useState("")
  const must = keyword.kind === "must"
  const weight = keyword.weight ?? 3

  const addSynonym = (e: FormEvent) => {
    e.preventDefault()
    const value = draft.trim()
    if (!value || keyword.synonyms.includes(value)) return
    onChange?.({ ...keyword, synonyms: [...keyword.synonyms, value] })
    setDraft("")
  }

  const pill = cn(
    "inline-flex h-8 items-center gap-2 rounded-full text-[13px] font-medium",
    must ? "bg-orange-tint text-orange-tint-ink" : "bg-panel text-ink"
  )

  const content = (
    <>
      <span>{keyword.label}</span>
      {!must ? <WeightDots weight={weight} /> : null}
      {keyword.synonyms.length ? (
        <span className="text-[11px] font-normal opacity-70">+{keyword.synonyms.length}</span>
      ) : null}
    </>
  )

  if (!onChange) return <span className={cn(pill, "px-3")}>{content}</span>

  return (
    <span className={cn(pill, "pr-1")}>
      <Popover>
        <PopoverTrigger className="inline-flex h-8 items-center gap-2 rounded-full pl-3">
          {content}
          <ChevronDown className="size-3 opacity-60" aria-hidden />
          <span className="sr-only">Edit {keyword.label}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72">
          {!must ? (
            <div className="mb-1">
              <p className="mb-2 text-xs text-ink-secondary">Weight</p>
              <div className="flex gap-1" role="radiogroup" aria-label="Weight">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={n === weight}
                    onClick={() => onChange({ ...keyword, weight: n })}
                    className={cn(
                      "size-8 rounded-full text-[13px] font-medium transition-colors",
                      n === weight ? "bg-primary text-primary-foreground" : "bg-panel text-ink-secondary hover:text-ink"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="text-xs text-ink-secondary">Synonyms</p>
          {keyword.synonyms.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {keyword.synonyms.map((synonym) => (
                <li
                  key={synonym}
                  className="inline-flex h-7 items-center gap-1 rounded-full bg-panel pr-1 pl-2.5 text-xs text-ink"
                >
                  {synonym}
                  <button
                    type="button"
                    aria-label={`Remove ${synonym}`}
                    className="inline-flex size-5 items-center justify-center rounded-full text-ink-muted hover:text-ink"
                    onClick={() =>
                      onChange({ ...keyword, synonyms: keyword.synonyms.filter((s) => s !== synonym) })
                    }
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-muted">No synonyms yet.</p>
          )}
          <form onSubmit={addSynonym} className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a synonym"
              aria-label={`Add a synonym for ${keyword.label}`}
              className="h-9"
            />
            <PillButton type="submit" size="sm" variant="secondary">
              <Plus aria-hidden />
              Add
            </PillButton>
          </form>
        </PopoverContent>
      </Popover>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${keyword.label}`}
          onClick={onRemove}
          className="inline-flex size-6 items-center justify-center rounded-full opacity-60 hover:opacity-100"
        >
          <X className="size-3" aria-hidden />
        </button>
      ) : null}
    </span>
  )
}
