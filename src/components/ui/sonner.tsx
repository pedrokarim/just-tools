"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

/**
 * Les notifications, dans la matière des surfaces flottantes d'Ascencia ID. Les
 * états se lisent à l'icône de sonner et aux teintes douces du système.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "system" } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
      style={
        {
          "--normal-bg": "var(--asc-elevated)",
          "--normal-text": "var(--asc-fg)",
          "--normal-border": "var(--asc-border)",
          "--success-bg": "var(--asc-elevated)",
          "--success-text": "var(--asc-success-soft-fg)",
          "--success-border": "var(--asc-success)",
          "--error-bg": "var(--asc-elevated)",
          "--error-text": "var(--asc-danger-soft-fg)",
          "--error-border": "var(--asc-danger)",
          "--warning-bg": "var(--asc-elevated)",
          "--warning-text": "var(--asc-warning-soft-fg)",
          "--warning-border": "var(--asc-warning)",
          "--info-bg": "var(--asc-elevated)",
          "--info-text": "var(--asc-fg)",
          "--info-border": "var(--asc-border-strong)",
          "--border-radius": "var(--radius-card)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
