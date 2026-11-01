import * as React from "react"

import { CONTROL_SHELL } from "@/lib/control"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        CONTROL_SHELL,
        "flex field-sizing-content min-h-24 w-full px-3.5 py-2.5 text-sm leading-relaxed",
        "placeholder:text-fg-subtle aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
