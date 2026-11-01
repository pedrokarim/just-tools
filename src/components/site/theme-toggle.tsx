"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Thème clair", Icon: Sun },
  { value: "dark", label: "Thème sombre", Icon: Moon },
  { value: "system", label: "Thème du système", Icon: Monitor },
] as const;

const subscribe = () => () => {};

/**
 * Sélecteur de thème à trois états, repris d'Ascencia ID.
 *
 * Trois et pas deux : un basculeur binaire fige le choix au premier clic, et on
 * ne retrouve jamais le suivi automatique du système.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // Le serveur ignore le thème choisi : aucune option ne s'allume avant
  // l'hydratation, sans quoi le premier rendu mentirait.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  return (
    <div
      role="radiogroup"
      aria-label="Thème"
      className={cn(
        "bg-surface border-border rounded-field inline-flex gap-0.5 border p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = hydrated && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-[calc(var(--radius-field)-3px)] transition-colors duration-(--animate-duration-fast)",
              active
                ? "bg-elevated text-fg shadow-sm"
                : "text-fg-subtle hover:text-fg"
            )}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
