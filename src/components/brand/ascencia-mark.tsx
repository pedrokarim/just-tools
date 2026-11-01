import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * La marque d'Ascencia ID, reprise de `@ascencia/id-ui` : trois courbes de niveau
 * formant un sommet, et une braise au point culminant.
 *
 * Elle n'est pas le logo de Just Tools. Elle signe le site là où il dit de qui il
 * vient : mentions de copyright, à propos, pages légales.
 *
 * Le signe n'est pas redimensionné, il est simplifié : sous 40 px la courbe
 * intérieure se bouche, sous 24 px la médiane aussi. On retire une courbe à chaque
 * palier et on grossit la braise.
 */
const CURVES = {
  full: {
    paths: [
      "M5 41 C13 33 19 15 24 15 C29 15 35 33 43 41",
      "M13 41 C18 35 21 24 24 24 C27 24 30 35 35 41",
      "M19.5 41 C21.5 38 22.5 32.5 24 32.5 C25.5 32.5 26.5 38 28.5 41",
    ],
    width: 2.6,
    dot: { cy: 8.6, r: 3.4 },
  },
  medium: {
    paths: [
      "M4 42 C13 33 18.5 13.5 24 13.5 C29.5 13.5 35 33 44 42",
      "M14 42 C18.5 35 21 23.5 24 23.5 C27 23.5 29.5 35 34 42",
    ],
    width: 4.5,
    dot: { cy: 6.5, r: 4 },
  },
  minimal: {
    paths: ["M3 44 C13 34 18 15 24 15 C30 15 35 34 45 44"],
    width: 7,
    dot: { cy: 6, r: 5.5 },
  },
} as const;

function detailForSize(size: number): keyof typeof CURVES {
  if (size >= 40) return "full";
  if (size >= 24) return "medium";
  return "minimal";
}

export interface AscenciaMarkProps
  extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number;
  /** Titre accessible. `null` rend la marque décorative. */
  title?: string | null;
}

export function AscenciaMark({
  size = 40,
  title = "Ascencia ID",
  className,
  ...props
}: AscenciaMarkProps) {
  const { paths, width, dot } = CURVES[detailForSize(size)];
  const decorative = title === null;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      {...props}
    >
      {!decorative && <title>{title}</title>}
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="var(--asc-mark-rock)"
          strokeWidth={width}
          strokeLinecap="round"
        />
      ))}
      <circle cx={24} cy={dot.cy} r={dot.r} fill="var(--asc-mark-ember)" />
    </svg>
  );
}

/** Marque et logotype, alignés sur la ligne de base optique. */
export function AscenciaLockup({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      translate="no"
      className={cn("inline-flex items-center gap-2", className)}
    >
      <AscenciaMark size={size} title={null} />
      <span className="font-display text-fg text-[0.9375rem] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap">
        Ascencia <span className="text-primary font-normal">ID</span>
      </span>
    </span>
  );
}
