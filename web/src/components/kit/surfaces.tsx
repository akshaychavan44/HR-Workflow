"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { hoverSpring, rise, staggerParent } from "@/lib/motion"

/** Wrap a page's cards so they enter one after another, 50ms apart. */
export function Stagger({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className={className} {...props}>
      {children}
    </motion.div>
  )
}

export function Reveal({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={rise} className={className} {...props}>
      {children}
    </motion.div>
  )
}

type CardProps = HTMLMotionProps<"div"> & {
  /** Lifts on hover. Turn off for cards holding wide tables or dense forms. */
  lift?: boolean
}

export function Card({ lift = true, className, children, ...props }: CardProps) {
  return (
    <motion.div
      data-slot="kit-card"
      variants={rise}
      whileHover={lift ? { y: -4 } : undefined}
      transition={hoverSpring}
      className={cn("min-w-0 rounded-card bg-surface p-6 text-ink shadow-[var(--card-shadow)]", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("text-base font-medium tracking-tight text-ink", className)} {...props} />
}

export function CardSubtitle({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mt-1 text-[13px] text-ink-secondary", className)} {...props} />
}

export function InnerPanel({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("min-w-0 rounded-panel bg-panel p-4", className)} {...props} />
}

export function HeroCard({ lift = true, className, children, ...props }: CardProps) {
  return (
    <motion.div
      data-slot="kit-hero"
      variants={rise}
      whileHover={lift ? { y: -4 } : undefined}
      transition={hoverSpring}
      className={cn("hero-surface flex min-w-0 flex-col rounded-card p-6", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Translucent pill for status text on the orange hero. */
export function HeroPill({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full bg-white/20 px-3 text-xs font-medium text-white [&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <motion.header
      variants={rise}
      className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4"
    >
      <div className="min-w-0">
        <h1 className="text-[32px] leading-[1.15] font-medium tracking-[-0.02em] text-ink sm:text-[40px]">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-sm text-ink-secondary">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </motion.header>
  )
}
