"use client"

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { createContext, useContext, useRef, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * FloatingDock's cursor magnification for existing navbar controls. It scales
 * rather than resizes, so the 48px bar keeps its height and text labels work.
 */
type Axis = "x" | "y"

const DockContext = createContext<{ pointer: MotionValue<number>; axis: Axis } | null>(null)

const SPRING = { mass: 0.1, stiffness: 150, damping: 12 }

export function DockGroup({
  axis = "x",
  className,
  ...props
}: ComponentProps<"div"> & { axis?: Axis }) {
  const pointer = useMotionValue(Infinity)
  return (
    <DockContext.Provider value={{ pointer, axis }}>
      <div
        onMouseMove={(e) => pointer.set(axis === "x" ? e.clientX : e.clientY)}
        onMouseLeave={() => pointer.set(Infinity)}
        className={cn("flex items-center", axis === "y" && "flex-col", className)}
        {...props}
      />
    </DockContext.Provider>
  )
}

export function DockItem({
  children,
  maxScale = 1.25,
  range = 110,
}: {
  children: ReactNode
  maxScale?: number
  /** Cursor distance in px at which the effect fades out. */
  range?: number
}) {
  const dock = useContext(DockContext)
  if (!dock) throw new Error("DockItem must be inside DockGroup")

  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const distance = useTransform(dock.pointer, (at) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return Infinity
    return dock.axis === "x" ? at - box.x - box.width / 2 : at - box.y - box.height / 2
  })
  const target = useTransform(distance, [-range, 0, range], [1, reduced ? 1 : maxScale, 1])
  const scale = useSpring(target, SPRING)

  return (
    <motion.div ref={ref} style={{ scale }} className="relative hover:z-10">
      {children}
    </motion.div>
  )
}
