"use client";

import { useId, useState, type ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Les pièces communes aux écrans du panneau.
 *
 * Chaque page réécrivait son en-tête deux fois (chargement, puis contenu), son
 * bouton d'actualisation et ses dates. Ces écrans ne diffèrent que par leurs
 * données : la forme vit ici, une seule fois.
 */

const NARROW_NBSP = " ";

export function formatInteger(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function formatPercent(value: number, decimals = 1): string {
  const formatted = value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted}${NARROW_NBSP}%`;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** « France, Lyon » ; `null` quand le pays n'est pas connu. */
export function formatLocation(
  country?: string | null,
  city?: string | null
): string | null {
  if (!country) return null;
  return city ? `${country}, ${city}` : country;
}

/** Une date relative, avec la date exacte en infobulle. */
export function RelativeTime({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const date = new Date(value);
  return (
    <time
      dateTime={date.toISOString()}
      title={formatDateTime(value)}
      className={cn("whitespace-nowrap tabular-nums", className)}
    >
      {formatDistanceToNow(date, { addSuffix: true, locale: fr })}
    </time>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="font-display text-fg text-2xl leading-tight font-bold tracking-[-0.035em]">
          {title}
        </h1>
        {description && (
          <p className="text-fg-muted max-w-[70ch] text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {/* Les actions passent à la ligne plutôt que de pousser la page. */}
      {actions && (
        <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

/** Un bloc de page : un titre et son contenu, sans carte autour. */
export function AdminSection({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="font-display text-fg text-base leading-snug font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-fg-muted text-sm leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/** Une liste vide dit ce qu'elle contiendra, et pourquoi elle ne contient rien. */
export function EmptyState({
  title,
  description,
  framed = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Encadré, pour remplacer un tableau hors d'une carte. */
  framed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 px-6 py-10 text-center",
        framed && "border-border bg-elevated rounded-card border"
      )}
    >
      <p className="font-display text-fg text-[0.9375rem] font-semibold">
        {title}
      </p>
      {description && (
        <p className="text-fg-muted max-w-[46ch] text-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export function RefreshButton({
  onClick,
  busy = false,
  disabled = false,
}: {
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick()}
      disabled={busy || disabled}
      aria-busy={busy || undefined}
    >
      <RefreshCw className={cn(busy && "asc-animate-spin")} aria-hidden />
      {busy ? "Actualisation…" : "Actualiser"}
    </Button>
  );
}

/**
 * Une ligne de tableau qui se déplie, pour le détail qu'on ne lit qu'à la demande.
 *
 * Les dernières vues occupaient autrefois une sous-liste sous chaque ligne : sur
 * 25 visiteurs, la page faisait plusieurs écrans pour un détail rarement utile.
 * La dernière cellule est le bouton : `colSpan` compte donc les colonnes de la
 * table, bouton compris.
 */
export function ExpandableTableRow({
  children,
  detail,
  colSpan,
  toggleLabel,
}: {
  /** Les cellules de la ligne, sans la dernière. */
  children: ReactNode;
  /** `null` : rien à déplier, la cellule du bouton reste vide. */
  detail: ReactNode;
  colSpan: number;
  toggleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  return (
    <>
      <TableRow>
        {children}
        <TableCell className="w-11 py-1 text-end">
          {detail ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-expanded={open}
              aria-controls={open ? detailId : undefined}
              aria-label={toggleLabel}
              title={toggleLabel}
              onClick={() => setOpen((current) => !current)}
            >
              <ChevronDown
                className={cn(
                  "transition-transform duration-(--animate-duration-fast) ease-(--ease-rise)",
                  open && "rotate-180"
                )}
                aria-hidden
              />
            </Button>
          ) : null}
        </TableCell>
      </TableRow>
      {open && detail ? (
        <TableRow
          id={detailId}
          className="bg-surface/60 hover:bg-surface/60 asc-animate-fade"
        >
          <TableCell colSpan={colSpan} className="whitespace-normal">
            {detail}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

export interface RecentViewItem {
  id: number;
  /** Ce qui distingue la vue : le chemin, ou l'empreinte du visiteur. */
  label: ReactNode;
  ipAddress?: string;
  location: string | null;
  timestamp: string;
}

/** Le détail d'une ligne dépliée : les dernières vues, une par ligne. */
export function RecentViewList({
  heading,
  items,
}: {
  heading: string;
  items: RecentViewItem[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="text-fg-muted font-sans text-xs font-medium tracking-normal">
        {heading}
      </h3>
      <ul className="divide-border divide-y">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-1.5 text-[0.8125rem]"
          >
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-0.5">
              <span className="text-fg min-w-0 break-all">{item.label}</span>
              {item.ipAddress && (
                <span className="text-fg-muted font-mono text-xs tabular-nums">
                  {item.ipAddress}
                </span>
              )}
              {item.location && (
                <span className="text-fg-muted">{item.location}</span>
              )}
            </span>
            <RelativeTime value={item.timestamp} className="text-fg-subtle" />
          </li>
        ))}
      </ul>
    </div>
  );
}
