import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Le bouton d'Ascencia ID, sous l'API shadcn que les outils appellent déjà.
 *
 * Le bouton primaire est une braise : dégradé vertical serré et ombre chaude.
 * C'est le seul dégradé du système, et cette rareté est ce qui attire l'œil.
 * Les tailles suivent `CONTROL` (`lib/control.ts`) : 44 px par défaut, la cible
 * tactile de WCAG 2.2, et 36 px réservés aux barres d'outils denses.
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-field text-sm font-semibold whitespace-nowrap select-none",
    "transition-[background,box-shadow,filter,border-color,color,scale] duration-(--animate-duration-fast) ease-(--ease-out-soft)",
    // Le bouton répond sous le doigt. Assez peu pour ne jamais gêner une action
    // répétée, assez pour que le clic soit senti.
    "active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "aria-invalid:border-danger",
  ],
  {
    variants: {
      variant: {
        default: [
          "text-on-primary bg-[linear-gradient(180deg,var(--color-ember-600),var(--color-ember-800))]",
          "shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--color-ember-600)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.16)]",
          "hover:brightness-110 active:brightness-95",
          // Désactivé, le primaire perd son dégradé au lieu de le diluer : à 50 %
          // d'opacité sur une carte claire, il se lit comme un défaut d'affichage.
          "disabled:bg-none disabled:bg-surface disabled:text-fg-subtle disabled:shadow-none disabled:opacity-100",
        ],
        destructive: "bg-danger text-on-danger hover:bg-danger-hover",
        outline:
          "border border-border-strong bg-transparent text-fg hover:bg-surface",
        secondary:
          "border border-border bg-elevated text-fg shadow-sm hover:border-border-strong hover:bg-surface",
        ghost: "bg-transparent text-fg-muted hover:bg-surface hover:text-fg",
        // Un liseré est indispensable : le fond doux et le sable de la page sont
        // trop proches, le bouton disparaissait.
        soft: "border border-primary/25 bg-primary-soft text-primary-soft-fg hover:brightness-[0.97]",
        accent: "bg-accent text-on-accent hover:bg-accent-hover",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-3.5 text-[0.8125rem] has-[>svg]:px-3",
        lg: "h-12 gap-2.5 px-6 text-[0.9375rem] has-[>svg]:px-5",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
