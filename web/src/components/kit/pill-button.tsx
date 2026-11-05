import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

const pillButton = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-[transform,background-color,opacity] duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:opacity-85",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary),var(--foreground)_6%)]",
        /** The white pill on the orange hero, identical in both themes. */
        hero: "bg-white text-[#111111] hover:bg-white/90",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[13px]",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

type PillButtonProps = ComponentProps<"button"> &
  VariantProps<typeof pillButton> & {
    /** Render the child element (e.g. a Next `Link`) with button styling. */
    asChild?: boolean
  }

export function PillButton({
  variant,
  size,
  fullWidth,
  asChild = false,
  type,
  className,
  ...props
}: PillButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      type={asChild ? undefined : (type ?? "button")}
      className={cn(pillButton({ variant, size, fullWidth }), className)}
      {...props}
    />
  )
}
