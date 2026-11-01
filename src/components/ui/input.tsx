import * as React from "react"

import { CONTROL_SHELL } from "@/lib/control"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        CONTROL_SHELL,
        "flex h-11 w-full min-w-0 px-3.5 text-sm",
        "placeholder:text-fg-subtle aria-invalid:border-danger",
        "file:text-fg file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
