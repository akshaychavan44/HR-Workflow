import Link from "next/link"
import { Card, CardTitle, PillButton } from "@/components/kit"

export default function UploadPage() {
  return <Card lift={false} className="space-y-4"><CardTitle>Upload CVs</CardTitle><p className="text-sm text-ink-secondary">Choose a saved job first, then use its Upload CVs control. Each candidate will be linked to that role.</p><PillButton asChild><Link href="/jobs">Choose a job</Link></PillButton></Card>
}
