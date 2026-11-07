import { BriefcaseBusiness, LayoutGrid, SlidersHorizontal, Upload, Users, type LucideIcon } from "lucide-react"

export type NavItem = { label: string; href: string; icon: LucideIcon }

export const NAV_TABS: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "Job Setup", href: "/job-setup", icon: SlidersHorizontal },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Candidates", href: "/candidates", icon: Users },
]

export const RAIL_ITEMS: NavItem[] = [
  ...NAV_TABS,
  { label: "Upload", href: "/upload", icon: Upload },
]

export function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}
