import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

import { Providers } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { APP_NAME } from "@/lib/brand"

import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Track open roles, screening results and candidates.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers>
          {children}
          <Toaster position="bottom-center" />
        </Providers>
      </body>
    </html>
  )
}
