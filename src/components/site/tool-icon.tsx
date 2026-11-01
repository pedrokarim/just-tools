import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-7 rounded-sm [&>svg]:size-[14px]",
  md: "size-9 rounded-md [&>svg]:size-4",
  lg: "size-11 rounded-lg [&>svg]:size-5",
} as const;

/**
 * L'icône d'un outil : un galet de roche, l'icône en braise.
 *
 * Une seule couleur pour tous, là où chaque outil avait la sienne. Avec douze
 * outils, l'arc-en-ciel ne distinguait plus rien, et il n'y a rien à retenir
 * d'une couleur : c'est le nom et le dessin qui identifient l'outil.
 */
export function ToolIcon({
  icon,
  size = "md",
  className,
}: {
  icon: ReactNode;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "border-border bg-surface text-link flex shrink-0 items-center justify-center border",
        SIZES[size],
        className
      )}
    >
      {icon}
    </span>
  );
}
