"use client"

import { Check, LogOut } from "lucide-react"
import { useSyncExternalStore } from "react"
import { ACCENTS, ACCENT_STORAGE_KEY, DEFAULT_ACCENT, type AccentId } from "@/lib/accents"
import { cn } from "@/lib/utils"

const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const readAccent = () => (document.documentElement.dataset.accent ?? DEFAULT_ACCENT) as AccentId

function setAccent(id: AccentId) {
  document.documentElement.dataset.accent = id
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, id)
  } catch {
    // Private windows can block storage; the theme still applies until reload.
  }
  listeners.forEach((listener) => listener())
}

export function SettingsPanel({ onLogout }: { onLogout?: () => void }) {
  const current = useSyncExternalStore(subscribe, readAccent, () => DEFAULT_ACCENT)

  return (
    <div className="space-y-4">
      <p className="text-base font-medium tracking-tight text-ink">Settings</p>

      <div>
        <p id="colour-theme-label" className="mb-2.5 text-xs text-ink-secondary">
          Colour theme
        </p>
        <div role="radiogroup" aria-labelledby="colour-theme-label" className="flex gap-2">
          {ACCENTS.map(({ id, label, color }) => {
            const active = id === current
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={label}
                title={label}
                onClick={() => setAccent(id)}
                style={{ backgroundColor: color }}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full text-white transition-transform hover:scale-110 active:scale-95",
                  active && "ring-2 ring-ink ring-offset-2 ring-offset-surface"
                )}
              >
                {active ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="flex h-10 w-full items-center gap-2.5 rounded-full bg-panel px-4 text-[13px] font-medium text-ink transition-colors hover:text-danger"
      >
        <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
        Log out
      </button>
    </div>
  )
}
