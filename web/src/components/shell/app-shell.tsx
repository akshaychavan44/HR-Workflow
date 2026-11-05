"use client"

import { LayoutGroup, motion } from "framer-motion"
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useSyncExternalStore, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { APP_INITIAL, APP_NAME, PLACEHOLDER_USER } from "@/lib/brand"
import { pillSpring } from "@/lib/motion"
import { DockGroup, DockItem } from "@/components/ui/dock-magnify"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NAV_TABS, RAIL_ITEMS, isActive } from "./nav"
import { SettingsPanel } from "./settings-panel"

const pill = "rounded-full bg-surface shadow-[var(--card-shadow)]"
const noSubscribe = () => () => {}

function Logo() {
  return (
    <Link
      href="/"
      aria-label={APP_NAME}
      className={cn(pill, "inline-flex h-12 items-center gap-2.5 pr-5 pl-2 sm:max-lg:px-2")}
    >
      <span className="hero-surface inline-flex size-8 items-center justify-center rounded-full text-sm font-semibold">
        {APP_INITIAL}
      </span>
      <span className="text-sm font-semibold tracking-tight whitespace-nowrap text-ink sm:max-lg:hidden">{APP_NAME}</span>
    </Link>
  )
}

function TabNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Primary" className={cn(pill, "hidden h-12 items-center gap-1 p-1.5 sm:flex")}>
      <LayoutGroup id="top-nav">
        <DockGroup className="gap-1">
        {NAV_TABS.map((tab) => {
          const active = isActive(tab.href, pathname)
          return (
            <DockItem key={tab.href} maxScale={1.15}>
            <Link
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex h-9 items-center rounded-full px-4 text-sm transition-colors",
                active ? "font-medium text-primary-foreground" : "text-ink-secondary hover:text-ink"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="tab-pill"
                  transition={pillSpring}
                  className="absolute inset-0 rounded-full bg-primary"
                />
              ) : null}
              <span className="relative">{tab.label}</span>
            </Link>
            </DockItem>
          )
        })}
        </DockGroup>
      </LayoutGroup>
    </nav>
  )
}

function CircleIconButton({
  icon: Icon,
  label,
  dot = false,
  className,
  ...props
}: { icon: LucideIcon; label: string; dot?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-panel",
        className
      )}
      {...props}
    >
      <Icon className="size-[18px]" strokeWidth={1.5} aria-hidden />
      {dot ? <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-orange" /> : null}
    </button>
  )
}

function UserMenu({ onLogout }: { onLogout?: () => void }) {
  const { name, email } = PLACEHOLDER_USER
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
  return (
    <Popover>
      <PopoverTrigger
        className={cn(pill, "inline-flex h-12 items-center gap-2.5 p-1.5 lg:pr-3.5")}
        aria-label={`Account menu for ${name}`}
      >
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-orange-tint text-[13px] font-semibold text-orange-tint-ink">
          {initials}
        </span>
        <span className="hidden text-left leading-tight xl:block">
          <span className="block text-[13px] font-medium whitespace-nowrap text-ink">{name}</span>
          <span className="block text-[11px] whitespace-nowrap text-ink-muted">{email}</span>
        </span>
        <ChevronDown className="hidden size-4 text-ink-muted lg:block" strokeWidth={1.5} aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64">
        <SettingsPanel onLogout={onLogout} />
      </PopoverContent>
    </Popover>
  )
}

function ThemePill({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  // Theme is unknown during SSR, so no option is pressed until after hydration.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false)

  const options = [
    { value: "light", label: "Light mode", icon: Sun },
    { value: "dark", label: "Dark mode", icon: Moon },
  ]

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(pill, "flex w-11 flex-col items-center gap-1 p-1", className)}
    >
      <DockGroup axis="y" className="gap-1">
      {options.map(({ value, label, icon: Icon }) => {
        const active = mounted && resolvedTheme === value
        return (
          <DockItem key={value}>
          <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition-colors",
              active ? "bg-panel text-ink" : "text-ink-muted hover:text-ink"
            )}
          >
            <Icon className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
          </DockItem>
        )
      })}
      </DockGroup>
    </div>
  )
}

function RailButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <DockItem>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>
    </DockItem>
  )
}

function LeftRail({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname()
  return (
    <aside className="sticky top-6 hidden h-[calc(100dvh-10.5rem)] min-h-[460px] w-11 shrink-0 flex-col justify-between lg:flex">
      <ThemePill />

      <nav aria-label="Sections" className={cn(pill, "flex w-11 flex-col items-center gap-1 p-1")}>
        <LayoutGroup id="rail-nav">
          <DockGroup axis="y" className="gap-1">
          {RAIL_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href, pathname)
            return (
              <RailButton key={href} label={label}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex size-9 items-center justify-center rounded-full transition-colors",
                    active ? "text-primary-foreground" : "text-ink-secondary hover:text-ink"
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="rail-pill"
                      transition={pillSpring}
                      className="absolute inset-0 rounded-full bg-primary"
                    />
                  ) : null}
                  <Icon className="relative size-4" strokeWidth={1.5} aria-hidden />
                </Link>
              </RailButton>
            )
          })}
          </DockGroup>
        </LayoutGroup>
      </nav>

      <div className={cn(pill, "flex w-11 flex-col items-center gap-1 p-1")}>
        <DockGroup axis="y" className="gap-1">
        <RailButton label="Help">
          <button
            type="button"
            aria-label="Help"
            className="inline-flex size-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:text-ink"
          >
            <CircleHelp className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        </RailButton>
        <Popover>
          <RailButton label="Settings">
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Settings"
                className="inline-flex size-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:text-ink"
              >
                <Settings className="size-4" strokeWidth={1.5} aria-hidden />
              </button>
            </PopoverTrigger>
          </RailButton>
          <PopoverContent side="right" align="end" sideOffset={12} className="w-64">
            <SettingsPanel onLogout={onLogout} />
          </PopoverContent>
        </Popover>
        </DockGroup>
      </div>
    </aside>
  )
}

/** The rail collapses into this below 1024px. */
function MobileMenu({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const row =
    "flex h-11 items-center gap-3 rounded-full px-4 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className={cn(pill, "inline-flex size-12 shrink-0 items-center justify-center text-ink lg:hidden")}
      >
        <Menu className="size-[18px]" strokeWidth={1.5} aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-1 p-4 pt-14">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <nav aria-label="Sections" className="flex flex-col gap-1">
          {RAIL_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href, pathname)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(row, active ? "bg-primary text-primary-foreground" : "text-ink hover:bg-surface")}
              >
                <Icon strokeWidth={1.5} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <button
            type="button"
            className={cn(row, "text-ink hover:bg-surface")}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun strokeWidth={1.5} aria-hidden /> : <Moon strokeWidth={1.5} aria-hidden />}
            {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button type="button" className={cn(row, "text-ink hover:bg-surface")}>
            <CircleHelp strokeWidth={1.5} aria-hidden />
            Help
          </button>
          <div className="mt-2 rounded-panel bg-surface p-4">
            <SettingsPanel onLogout={onLogout} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AppShell({ children, onLogout }: { children: ReactNode; onLogout?: () => void }) {
  return (
    <div className="min-h-dvh bg-shell">
      <div className="min-h-dvh p-4 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MobileMenu onLogout={onLogout} />
            <Logo />
          </div>
          <TabNav />
          <div className="flex items-center gap-3">
            <div className={cn(pill, "hidden h-12 items-center gap-0.5 px-1.5 md:flex")}>
              <DockGroup className="gap-0.5">
                <DockItem><CircleIconButton icon={Search} label="Search" /></DockItem>
                <DockItem><CircleIconButton icon={Bell} label="Notifications" dot /></DockItem>
                <DockItem><CircleIconButton icon={CircleHelp} label="Help" /></DockItem>
              </DockGroup>
            </div>
            <UserMenu onLogout={onLogout} />
          </div>
        </header>
        <div className="mt-6 flex items-start gap-6">
          <LeftRail onLogout={onLogout} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
