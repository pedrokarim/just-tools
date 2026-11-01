"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/** Le panneau est un inspecteur dense : 36 px à la souris, 44 px au doigt. */
const DENSE_FIELD = "h-9 pointer-coarse:h-11";

const FIELD_LABEL = "text-[0.8125rem] font-normal";

/**
 * Une section du panneau, séparée de la suivante par un trait. Un `<details>`
 * natif : il garde son état tout seul et n'anime aucune hauteur.
 */
export function PanelSection({
  title,
  summary,
  defaultOpen = true,
  children,
}: {
  title: string;
  /** La valeur courante, lisible section repliée. */
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-border min-w-0 border-t first:border-t-0"
    >
      <summary className="text-fg flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {summary && (
          <span className="text-fg-subtle min-w-0 truncate text-xs font-normal">
            {summary}
          </span>
        )}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="text-fg-subtle shrink-0 group-open:rotate-180"
        />
      </summary>
      <div className="flex min-w-0 flex-col gap-4 pt-1 pb-5">{children}</div>
    </details>
  );
}

/**
 * Un champ numérique borné. La saisie reste libre pendant la frappe, mais seule
 * une valeur dans les bornes atteint le rendu : une densité négative, par
 * exemple, ferait tourner la grille sans fin.
 */
export function NumberField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}: {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Input
      id={id}
      type="number"
      inputMode="decimal"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={draft ?? String(value)}
      onChange={(event) => {
        const raw = event.target.value;
        setDraft(raw);
        const next = Number(raw);
        if (raw !== "" && Number.isFinite(next) && next >= min && next <= max) {
          onChange(next);
        }
      }}
      onBlur={() => setDraft(null)}
      className={cn(
        DENSE_FIELD,
        "w-20 px-2 text-right font-mono text-[0.8125rem] tabular-nums",
        className
      )}
    />
  );
}

/** Le réglage type du panneau : un libellé, une valeur à saisir, un curseur. */
export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  displayFactor = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** Pour afficher en pourcentage une valeur stockée entre 0 et 1. */
  displayFactor?: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const toDisplay = (raw: number) =>
    Math.round(raw * displayFactor * 1000) / 1000;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className={cn(FIELD_LABEL, "min-w-0")}>
          {label}
        </Label>
        <span className="flex shrink-0 items-center gap-1">
          <NumberField
            id={id}
            label={label}
            value={toDisplay(value)}
            min={toDisplay(min)}
            max={toDisplay(max)}
            step={toDisplay(step)}
            onChange={(next) => onChange(next / displayFactor)}
          />
          <span aria-hidden="true" className="text-fg-subtle w-4 text-xs">
            {unit}
          </span>
        </span>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        className="py-1.5"
      />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </Label>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger
          id={id}
          size="sm"
          className="w-full pointer-coarse:data-[size=sm]:h-11"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export interface OptionItem<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

/**
 * Un choix exclusif en tuiles. Le choix courant est en `soft`, pas en primaire :
 * le primaire reste à l'unique action de la zone.
 */
export function OptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly OptionItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Le nombre de colonnes, en `minmax(0,1fr)`. */
  className?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-fg text-[0.8125rem] leading-snug">{label}</p>
      <div role="group" aria-label={label} className={cn("grid gap-1.5", className)}>
        {options.map((option) => {
          const Icon = option.icon;
          const selected = option.value === value;
          return (
            <Button
              key={option.value}
              variant={selected ? "soft" : "outline"}
              size="sm"
              aria-pressed={selected}
              title={option.label}
              onClick={() => onChange(option.value)}
              className="h-14 min-w-0 flex-col gap-1 px-1 text-xs font-medium has-[>svg]:px-1"
            >
              <Icon aria-hidden="true" />
              <span className="max-w-full truncate">{option.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/** La confirmation d'une action qu'on ne peut pas défaire. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
