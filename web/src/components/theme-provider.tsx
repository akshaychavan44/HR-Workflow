"use client"

import { MotionConfig } from "framer-motion"
import { ThemeProvider as NextThemes } from "next-themes"
import type { ReactNode } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </MotionConfig>
    </NextThemes>
  )
}
