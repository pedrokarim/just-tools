"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

interface LoadingCardProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  /** Le squelette, à la hauteur du contenu attendu : la page ne saute pas. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LoadingCard({
  title,
  description,
  isLoading = false,
  fallback,
  children,
  className,
}: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading
          ? (fallback ?? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          : children}
      </CardContent>
    </Card>
  );
}

const STAT_COLUMNS = {
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * Une rangée de chiffres, reprise de la console d'Ascencia ID : un seul cadre
 * divisé en cases, pas une carte par chiffre.
 *
 * Les filets sont portés par les cases et la grille déborde d'un pixel à droite
 * et en bas : le cadre masque ainsi le dernier filet quel que soit le nombre de
 * cases par ligne, ce qu'un `divide-*` ne sait pas faire sur une grille qui se
 * replie.
 */
export function StatGrid({
  columns = 4,
  className,
  children,
}: {
  columns?: keyof typeof STAT_COLUMNS;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-border bg-elevated rounded-card min-w-0 overflow-hidden border",
        className
      )}
    >
      <div
        className={cn(
          "*:border-border -me-px -mb-px grid min-w-0 *:border-e *:border-b",
          STAT_COLUMNS[columns]
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5 p-4", className)}>
      <div className="text-fg-muted text-[0.8125rem] leading-snug">{label}</div>
      <div className="font-display text-fg text-2xl leading-none font-bold tracking-tight tabular-nums">
        {value}
      </div>
      {hint && <div className="text-fg-subtle text-xs leading-snug">{hint}</div>}
    </div>
  );
}

// Composant spécialisé pour les statistiques avec compteur animé
interface StatCardProps {
  title: string;
  value: number;
  description?: string;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  isLoading = false,
  prefix,
  suffix,
  decimals = 0,
  className,
}: StatCardProps) {
  return (
    <Stat
      label={title}
      value={
        isLoading ? (
          <Skeleton className="h-6 w-20" />
        ) : (
          <AnimatedCounter
            value={value}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
          />
        )
      }
      hint={isLoading ? undefined : description}
      className={className}
    />
  );
}
