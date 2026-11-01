"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { CopyButton } from "@/components/site/copy-button";
import { ToolPage } from "@/components/site/tool-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  buildCharset,
  describeStrength,
  estimateEntropy,
  generatePassword,
  type PasswordOptions,
  type StrengthLevel,
} from "@/lib/password";
import { cn } from "@/lib/utils";

const CHARACTER_TYPES = [
  { key: "includeUppercase", label: "Majuscules", hint: "A à Z" },
  { key: "includeLowercase", label: "Minuscules", hint: "a à z" },
  { key: "includeNumbers", label: "Chiffres", hint: "0 à 9" },
  { key: "includeSymbols", label: "Symboles", hint: "!@#$%&*" },
] as const;

const EXCLUSIONS = [
  {
    key: "excludeSimilar",
    label: "Exclure les caractères similaires",
    hint: "l, 1, I, O et 0, faciles à confondre à la lecture.",
  },
  {
    key: "excludeAmbiguous",
    label: "Exclure les caractères ambigus",
    hint: "Les accolades, crochets et barres, qui posent problème dans certains champs.",
  },
] as const;

const STRENGTH_STYLES: Record<StrengthLevel, { bar: string; text: string }> = {
  weak: { bar: "bg-danger", text: "text-danger" },
  fair: { bar: "bg-warning", text: "text-warning" },
  strong: { bar: "bg-success", text: "text-success" },
  excellent: { bar: "bg-success", text: "text-success" },
};

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
};

export default function PasswordGenerator() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(true);

  const update = useCallback(
    (changes: Partial<PasswordOptions>) =>
      setOptions((previous) => ({ ...previous, ...changes })),
    []
  );

  // Le mot de passe suit les options : il n'y a jamais d'écran vide à remplir, et
  // ce qui est affiché correspond toujours à ce qui est réglé.
  useEffect(() => {
    setPassword(generatePassword(options));
  }, [options]);

  const empty = buildCharset(options).length === 0;
  const strength = useMemo(
    () => describeStrength(estimateEntropy(options)),
    [options]
  );
  const bits = Math.round(estimateEntropy(options));
  const styles = STRENGTH_STYLES[strength.level];

  return (
    <ToolPage className="max-w-3xl">
      <Card className="gap-4 p-5">
        <p
          // La clé rejoue l'apparition à chaque tirage : le nouveau mot de passe
          // se voit, y compris quand il ressemble au précédent.
          key={password}
          aria-live="polite"
          className={cn(
            "asc-animate-fade text-fg min-h-16 font-mono text-xl leading-snug break-all md:text-2xl",
            !revealed && "[-webkit-text-security:disc]"
          )}
        >
          {empty ? (
            <span className="text-fg-subtle font-sans text-base">
              Choisis au moins un type de caractères.
            </span>
          ) : (
            password || " "
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <CopyButton value={password} disabled={!password} />
          <Button
            variant="secondary"
            onClick={() => setPassword(generatePassword(options))}
            disabled={empty}
          >
            <RefreshCw aria-hidden="true" />
            Générer
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ms-auto"
            aria-label={revealed ? "Masquer" : "Afficher"}
            aria-pressed={!revealed}
            title={revealed ? "Masquer" : "Afficher"}
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </Button>
        </div>

        <div className="border-border flex flex-col gap-2 border-t pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className={cn("text-sm font-semibold", styles.text)}>
              {strength.label}
            </span>
            <span className="text-fg-subtle text-xs tabular-nums">
              {bits}&nbsp;bits d&apos;entropie
            </span>
          </div>
          <div className="bg-border h-1.5 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full origin-left rounded-full transition-[scale,background-color] duration-(--animate-duration-card) ease-(--ease-rise)",
                styles.bar
              )}
              style={{ scale: `${strength.ratio} 1` }}
            />
          </div>
          <p className="text-fg-muted text-sm">{strength.description}</p>
        </div>
      </Card>

      <section aria-label="Réglages" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="length">Longueur</Label>
            <span className="text-fg font-mono text-sm tabular-nums">
              {options.length}
            </span>
          </div>
          <Slider
            id="length"
            aria-label="Longueur"
            min={4}
            max={64}
            step={1}
            value={[options.length]}
            onValueChange={([length]) => update({ length })}
          />
        </div>

        <fieldset className="flex flex-col gap-1">
          <legend className="text-fg mb-2 text-sm font-medium">
            Types de caractères
          </legend>
          <div className="grid gap-x-6 sm:grid-cols-2">
            {CHARACTER_TYPES.map(({ key, label, hint }) => (
              <label
                key={key}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm"
              >
                <Checkbox
                  checked={options[key]}
                  onCheckedChange={(checked) =>
                    update({ [key]: checked === true })
                  }
                />
                <span className="text-fg">{label}</span>
                <span className="text-fg-subtle">{hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-border flex flex-col gap-1 border-t pt-5">
          <legend className="sr-only">Exclusions</legend>
          {EXCLUSIONS.map(({ key, label, hint }) => (
            <label
              key={key}
              className="flex min-h-11 cursor-pointer items-start gap-2.5 py-2 text-sm"
            >
              <span className="flex h-5 items-center">
                <Checkbox
                  checked={options[key]}
                  onCheckedChange={(checked) =>
                    update({ [key]: checked === true })
                  }
                />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-fg">{label}</span>
                <span className="text-fg-muted text-[0.8125rem] leading-snug">
                  {hint}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      </section>
    </ToolPage>
  );
}
