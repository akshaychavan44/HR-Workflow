import type { ReactNode } from "react"

import { AppShell } from "@/components/shell/app-shell"

/** Every logged-in page. Login sits outside this group, so it has no shell. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
