export const ACCENT_STORAGE_KEY = "accent"
export const DEFAULT_ACCENT = "orange"

/** Colours live in globals.css under [data-accent]; `color` is only the swatch. */
export const ACCENTS = [
  { id: "orange", label: "Orange", color: "#e8633a" },
  { id: "blue", label: "Blue", color: "#2f6fed" },
  { id: "emerald", label: "Emerald", color: "#059669" },
  { id: "violet", label: "Violet", color: "#7c3aed" },
  { id: "rose", label: "Rose", color: "#e11d63" },
] as const

export type AccentId = (typeof ACCENTS)[number]["id"]

/** Runs before first paint so a saved theme never flashes orange. */
export const ACCENT_INIT_SCRIPT = `try{var a=localStorage.getItem(${JSON.stringify(ACCENT_STORAGE_KEY)});if(a)document.documentElement.dataset.accent=a}catch(e){}`
