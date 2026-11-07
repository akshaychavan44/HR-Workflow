"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { MinusIcon, PlusIcon } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

export function NumberField({ id, className, ...props }: NumberFieldPrimitive.Root.Props) {
  const generatedId = React.useId()
  return <NumberFieldPrimitive.Root id={id ?? generatedId} data-slot="number-field" className={cn("flex w-full flex-col gap-2", className)} {...props} />
}

export function NumberFieldGroup({ className, ...props }: NumberFieldPrimitive.Group.Props) {
  return <NumberFieldPrimitive.Group data-slot="number-field-group" className={cn("flex h-11 w-full items-center rounded-field bg-panel text-ink transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-surface data-disabled:opacity-50", className)} {...props} />
}

const stepButton = "flex size-11 shrink-0 items-center justify-center rounded-field text-ink-secondary transition-colors hover:bg-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30 data-disabled:cursor-not-allowed data-disabled:opacity-30"

export function NumberFieldDecrement({ className, ...props }: NumberFieldPrimitive.Decrement.Props) {
  return <NumberFieldPrimitive.Decrement aria-label="Decrease value" data-slot="number-field-decrement" className={cn(stepButton, className)} {...props}><MinusIcon className="size-4" aria-hidden /></NumberFieldPrimitive.Decrement>
}

export function NumberFieldIncrement({ className, ...props }: NumberFieldPrimitive.Increment.Props) {
  return <NumberFieldPrimitive.Increment aria-label="Increase value" data-slot="number-field-increment" className={cn(stepButton, className)} {...props}><PlusIcon className="size-4" aria-hidden /></NumberFieldPrimitive.Increment>
}

export function NumberFieldInput({ className, ...props }: NumberFieldPrimitive.Input.Props) {
  return <NumberFieldPrimitive.Input data-slot="number-field-input" className={cn("h-11 w-full min-w-0 bg-transparent px-2 text-center text-base font-medium text-ink tabular-nums outline-none", className)} {...props} />
}

export { NumberFieldPrimitive }
export default NumberField
