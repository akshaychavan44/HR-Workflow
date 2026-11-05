"use client"

import { Compass } from "lucide-react"
import Link from "next/link"

import { Card, EmptyState, PageHeader, PillButton, Stagger } from "@/components/kit"
import { AppShell } from "@/components/shell/app-shell"

export default function NotFound() {
  return (
    <AppShell>
      <Stagger className="space-y-6">
        <PageHeader title="Page not found" subtitle="This page doesn't exist, or hasn't been built yet." />
        <Card lift={false}>
          <EmptyState
            icon={Compass}
            message="There's nothing here."
            action={
              <PillButton asChild>
                <Link href="/">Back to Overview</Link>
              </PillButton>
            }
          />
        </Card>
      </Stagger>
    </AppShell>
  )
}
