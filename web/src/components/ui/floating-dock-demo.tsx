import { FloatingDock } from "@/components/ui/floating-dock"
import { BriefcaseBusiness, LayoutGrid, Upload, Users } from "lucide-react"

const icon = "h-full w-full text-neutral-500 dark:text-neutral-300"

export default function FloatingDockDemo() {
  const links = [
    { title: "Overview", icon: <LayoutGrid className={icon} />, href: "#" },
    { title: "Jobs", icon: <BriefcaseBusiness className={icon} />, href: "#" },
    { title: "Candidates", icon: <Users className={icon} />, href: "#" },
    { title: "Upload", icon: <Upload className={icon} />, href: "#" },
  ]
  return (
    <div className="flex h-[35rem] w-full items-center justify-center">
      <FloatingDock mobileClassName="translate-y-20" items={links} />
    </div>
  )
}
