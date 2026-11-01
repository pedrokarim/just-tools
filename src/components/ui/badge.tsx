import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Le badge d'Ascencia ID : une pastille, teintée mais jamais pleine. */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary-soft text-primary-soft-fg",
        secondary: "border-border bg-surface text-fg-muted",
        destructive: "border-danger/25 bg-danger-soft text-danger-soft-fg",
        outline: "border-border-strong text-fg [a&]:hover:bg-surface",
        accent: "border-accent/25 bg-accent-soft text-accent-soft-fg",
        success: "border-success/25 bg-success-soft text-success-soft-fg",
        warning: "border-warning/30 bg-warning-soft text-warning-soft-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
