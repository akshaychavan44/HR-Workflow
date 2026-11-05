import type { LucideIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn("skeleton-shimmer rounded-lg", className)} {...props} />
}

export function StatTileSkeleton() {
  return (
    <div className="flex min-h-[148px] flex-col justify-between rounded-panel bg-panel p-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-20 bg-surface" />
        <Skeleton className="size-7 rounded-full" />
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-[22px] w-24 rounded-full" />
      </div>
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 rounded-card bg-surface p-6", className)}>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="flex gap-3 pt-1">
        <Skeleton className="h-11 w-28 rounded-full" />
        <Skeleton className="h-11 w-28 rounded-full" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      <Skeleton className="h-11 w-full rounded-panel" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-6 px-4 py-3.5">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  message,
  action,
  className,
}: {
  icon: LucideIcon
  message: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 px-6 py-12 text-center", className)}>
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-panel text-ink-secondary">
        <Icon className="size-[22px]" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="text-sm text-ink-secondary">{message}</p>
      {action}
    </div>
  )
}
