"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Le tableau de la console d'Ascencia ID : dense, encadré, en-têtes en petites
 * capitales à chasse fixe. Il porte sa bordure : on ne le pose pas dans une carte.
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    // `relative` : un libellé `sr-only` d'une cellule reste dans le conteneur qui
    // défile au lieu d'élargir la page. `overflow-y-hidden` : `overflow-x: auto`
    // seul rend aussi l'axe vertical défilant, et un pixel d'arrondi y fait
    // paraître une barre.
    <div
      data-slot="table-container"
      className="border-border bg-elevated rounded-card relative w-full overflow-x-auto overflow-y-hidden border"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-surface [&_tr]:border-b [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-surface border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-surface/60 data-[state=selected]:bg-primary-soft/50 border-b transition-colors duration-(--animate-duration-fast)",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        "text-fg-subtle px-4 py-2.5 text-left align-middle font-mono text-[0.6875rem] font-normal tracking-wider whitespace-nowrap uppercase [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "text-fg px-4 py-2.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-fg-muted mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
