import type { Transition, Variants } from "framer-motion"

export const hoverSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
}

/** Used by every animated pill: nav tabs, rail icons, segmented controls. */
export const pillSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 36,
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

/**
 * Cards rise 8px and resolve from a light blur, as in the reference video.
 * The filter is dropped afterwards so text doesn't stay in a filtered layer.
 */
export const rise: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
    transitionEnd: { filter: "none" },
  },
}
