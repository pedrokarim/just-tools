"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const CONFIRMATION_MS = 1600;

/**
 * Le bouton de copie, partagé par tous les outils.
 *
 * La confirmation se fait sur place : l'icône devient une coche et le libellé
 * change, là où l'œil regarde déjà. Un toast n'apparaît qu'en cas d'échec, seul
 * cas où il y a quelque chose à apprendre.
 */
export function CopyButton({
  value,
  label = "Copier",
  copiedLabel = "Copié",
  iconOnly = false,
  ...props
}: {
  /** Le texte à copier, ou une fonction qui le calcule au moment du clic. */
  value: string | (() => string);
  label?: string;
  copiedLabel?: string;
  iconOnly?: boolean;
} & Omit<ComponentProps<typeof Button>, "value" | "onClick" | "children">) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        typeof value === "function" ? value() : value
      );
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS);
    } catch {
      toast.error("Copie impossible. Sélectionne le texte à la main.");
    }
  };

  const Icon = copied ? Check : Copy;

  return (
    <Button
      {...props}
      onClick={copy}
      aria-label={iconOnly ? (copied ? copiedLabel : label) : undefined}
      title={iconOnly ? label : undefined}
    >
      <Icon key={String(copied)} className="asc-animate-fade" aria-hidden="true" />
      {!iconOnly && <span aria-live="polite">{copied ? copiedLabel : label}</span>}
    </Button>
  );
}
