"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import {
  Download,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  Save,
  Trash2,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/site/copy-button";
import { ToolPage } from "@/components/site/tool-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  /** Le tirage qui a produit cette couleur : une couleur verrouillée garde le sien. */
  revision: number;
}

interface SavedPalette {
  id: string;
  name: string;
  colors: Color[];
  createdAt: Date;
}

type PaletteType =
  | "monochromatic"
  | "analogous"
  | "complementary"
  | "triadic"
  | "tetradic"
  | "random";

interface PaletteSettings {
  baseColor: string;
  paletteType: PaletteType;
  colorCount: number;
}

const PALETTE_TYPES: { value: PaletteType; label: string; hint: string }[] = [
  {
    value: "monochromatic",
    label: "Monochromatique",
    hint: "Des variations d'une même teinte.",
  },
  {
    value: "analogous",
    label: "Analogue",
    hint: "Des couleurs voisines sur le cercle chromatique.",
  },
  {
    value: "complementary",
    label: "Complémentaire",
    hint: "Des couleurs opposées sur le cercle chromatique.",
  },
  {
    value: "triadic",
    label: "Triadique",
    hint: "Trois couleurs équidistantes sur le cercle chromatique.",
  },
  {
    value: "tetradic",
    label: "Tétradique",
    hint: "Quatre couleurs formant un rectangle sur le cercle chromatique.",
  },
  {
    value: "random",
    label: "Aléatoire",
    hint: "Un tirage libre, qui ne suit pas la couleur de base.",
  },
];

const DEFAULT_SETTINGS: PaletteSettings = {
  baseColor: "#3b82f6",
  paletteType: "analogous",
  colorCount: 5,
};

/** Rend `#rrggbb` en minuscules, ou `null` si la saisie n'est pas (encore) valide. */
function normalizeHex(value: string): string | null {
  const match = /^#?([a-f\d]{6})$/i.exec(value.trim());
  return match ? `#${match[1].toLowerCase()}` : null;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/** Ramène une teinte entre 0 et 360 : les décalages négatifs s'affichaient tels quels. */
function wrapHue(hue: number) {
  return ((hue % 360) + 360) % 360;
}

/**
 * Calcule la palette. Fonction pure, appelée au moment du geste : une palette
 * rechargée n'est plus écrasée par un effet, et verrouiller une couleur ne
 * relance pas de tirage aléatoire sur les autres.
 */
function computeColors(
  { baseColor, paletteType, colorCount }: PaletteSettings,
  previous: Color[],
  locked: ReadonlySet<number>,
  revision: number
): Color[] {
  const baseRgb = hexToRgb(baseColor);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const colors: Color[] = [];

  for (let i = 0; i < colorCount; i++) {
    if (locked.has(i) && previous[i]) {
      colors.push(previous[i]);
      continue;
    }

    const hsl = { ...baseHsl };

    switch (paletteType) {
      case "monochromatic":
        hsl.s = Math.max(10, Math.min(90, baseHsl.s + (i - 2) * 15));
        hsl.l = Math.max(10, Math.min(90, baseHsl.l + (i - 2) * 15));
        break;
      case "analogous":
        hsl.h = wrapHue(baseHsl.h + (i - 2) * 30);
        break;
      case "complementary":
        if (i > 0) hsl.h = wrapHue(baseHsl.h + 180 + (i - 1) * 30);
        break;
      case "triadic":
        hsl.h = wrapHue(baseHsl.h + i * 120);
        break;
      case "tetradic":
        hsl.h = wrapHue(baseHsl.h + i * 90);
        break;
      case "random":
        hsl.h = Math.random() * 360;
        hsl.s = Math.random() * 60 + 20;
        hsl.l = Math.random() * 40 + 30;
        break;
    }

    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    colors.push({ hex: rgbToHex(rgb.r, rgb.g, rgb.b), rgb, hsl, revision });
  }

  return colors;
}

export default function ColorPalette() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hexDraft, setHexDraft] = useState(DEFAULT_SETTINGS.baseColor);
  const [lockedColors, setLockedColors] = useState<Set<number>>(new Set());
  const [revision, setRevision] = useState(0);
  // Les réglages par défaut sont déterministes : la palette d'exemple est là dès
  // le rendu serveur, sans écran vide ni décalage à l'hydratation.
  const [colors, setColors] = useState(() =>
    computeColors(DEFAULT_SETTINGS, [], new Set(), 0)
  );
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [paletteName, setPaletteName] = useState("");

  const selectedType =
    PALETTE_TYPES.find(({ value }) => value === settings.paletteType) ??
    PALETTE_TYPES[0];
  const hexIsValid = normalizeHex(hexDraft) !== null;

  const applySettings = (changes: Partial<PaletteSettings>) => {
    const next = { ...settings, ...changes };
    setSettings(next);
    setColors(computeColors(next, colors, lockedColors, revision));
  };

  const updateBaseColor = (value: string) => {
    setHexDraft(value);
    const hex = normalizeHex(value);
    if (hex) applySettings({ baseColor: hex });
  };

  const regenerate = () => {
    const next = revision + 1;
    setRevision(next);
    setColors(computeColors(settings, colors, lockedColors, next));
  };

  const toggleLock = (index: number) => {
    const next = new Set(lockedColors);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setLockedColors(next);
  };

  const savePalette = (event: FormEvent) => {
    event.preventDefault();
    const name = paletteName.trim();
    if (!name) return;

    setSavedPalettes((previous) => [
      {
        id: Date.now().toString(),
        name,
        colors: [...colors],
        createdAt: new Date(),
      },
      ...previous,
    ]);
    setPaletteName("");
    setSaveDialogOpen(false);
    toast.success("Palette sauvegardée.");
  };

  const loadPalette = (palette: SavedPalette) => {
    const baseColor = palette.colors[0]?.hex ?? settings.baseColor;
    setColors(palette.colors);
    setSettings({ ...settings, baseColor, colorCount: palette.colors.length });
    setHexDraft(baseColor);
    setLockedColors(new Set());
    toast.success(`Palette « ${palette.name} » chargée.`);
  };

  const deletePalette = (id: string) => {
    setSavedPalettes((previous) =>
      previous.filter((palette) => palette.id !== id)
    );
  };

  const exportPalette = () => {
    const declarations = colors
      .map((color, index) => `  --color-${index + 1}: ${color.hex};`)
      .join("\n");

    // Sans sélecteur, le fichier n'était pas une feuille de style valide.
    const blob = new Blob([`:root {\n${declarations}\n}\n`], {
      type: "text/css",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "palette.css";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Palette exportée dans palette.css.");
  };

  return (
    <ToolPage>
      <Card className="@container gap-5 p-5">
        <ul
          aria-label="Palette générée"
          className="grid gap-2 @3xl:grid-cols-[repeat(var(--swatch-count),minmax(0,1fr))] @3xl:gap-1.5"
          style={{ "--swatch-count": colors.length } as CSSProperties}
        >
          {colors.map((color, index) => {
            const locked = lockedColors.has(index);
            return (
              <li
                key={index}
                className="flex min-w-0 items-center gap-2 @3xl:flex-col @3xl:items-stretch"
              >
                <div
                  // La clé ne change qu'au clic sur « Générer » : les couleurs tirées
                  // se remplacent à vue, les verrouillées ne bougent pas, et faire
                  // glisser le sélecteur de couleur ne provoque aucun clignotement.
                  key={color.revision}
                  aria-hidden="true"
                  className="asc-animate-fade border-border h-14 min-w-0 flex-1 rounded-md border @3xl:h-64 @3xl:flex-none"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-fg shrink-0 text-center font-mono text-xs">
                  {color.hex}
                </span>
                <div className="flex shrink-0 flex-wrap justify-center gap-1">
                  <Button
                    variant={locked ? "soft" : "ghost"}
                    size="icon"
                    aria-pressed={locked}
                    aria-label={
                      locked
                        ? `Déverrouiller ${color.hex}`
                        : `Verrouiller ${color.hex}`
                    }
                    title={locked ? "Déverrouiller" : "Verrouiller"}
                    onClick={() => toggleLock(index)}
                  >
                    {locked ? (
                      <Lock aria-hidden="true" />
                    ) : (
                      <Unlock aria-hidden="true" />
                    )}
                  </Button>
                  <CopyButton
                    value={color.hex}
                    iconOnly
                    variant="ghost"
                    size="icon"
                    label={`Copier ${color.hex}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={regenerate}>
            <RefreshCw aria-hidden="true" />
            Générer
          </Button>
          <Button variant="secondary" onClick={() => setSaveDialogOpen(true)}>
            <Save aria-hidden="true" />
            Sauvegarder
          </Button>
          <Button variant="secondary" onClick={exportPalette}>
            <Download aria-hidden="true" />
            Exporter en CSS
          </Button>
          <Button
            variant="ghost"
            className="ms-auto"
            aria-pressed={showDetails}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
            Valeurs
          </Button>
        </div>

        {showDetails && (
          <ul className="asc-animate-step-in border-border grid gap-x-6 gap-y-3 border-t pt-4 @xl:grid-cols-2 @4xl:grid-cols-3">
            {colors.map((color, index) => (
              <li key={index} className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="border-border size-10 shrink-0 rounded-md border"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="flex min-w-0 flex-col font-mono text-xs leading-relaxed">
                  <span className="text-fg text-sm">{color.hex}</span>
                  <span className="text-fg-muted">
                    RGB&nbsp;: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                  </span>
                  <span className="text-fg-muted">
                    HSL&nbsp;: {Math.round(color.hsl.h)}°,{" "}
                    {Math.round(color.hsl.s)}&nbsp;%,{" "}
                    {Math.round(color.hsl.l)}&nbsp;%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <section aria-label="Réglages" className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="base-color">Couleur de base</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                aria-label="Choisir la couleur de base"
                value={settings.baseColor}
                onChange={(event) => updateBaseColor(event.target.value)}
                className="w-14 shrink-0 cursor-pointer p-1"
              />
              <Input
                id="base-color"
                value={hexDraft}
                onChange={(event) => updateBaseColor(event.target.value)}
                aria-invalid={!hexIsValid}
                aria-describedby="base-color-hint"
                spellCheck={false}
                className="font-mono"
              />
            </div>
            <p
              id="base-color-hint"
              className={
                hexIsValid
                  ? "text-fg-muted text-[0.8125rem] leading-snug"
                  : "text-danger text-[0.8125rem] leading-snug"
              }
            >
              {hexIsValid
                ? "Toute la palette part de cette couleur."
                : "Saisis six chiffres hexadécimaux, par exemple #3b82f6."}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="palette-type">Type de palette</Label>
            <Select
              value={settings.paletteType}
              onValueChange={(value) =>
                applySettings({ paletteType: value as PaletteType })
              }
            >
              <SelectTrigger id="palette-type" className="w-full">
                <SelectValue>{selectedType.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PALETTE_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-fg-muted text-[0.8125rem] leading-snug">
              {selectedType.hint}
            </p>
          </div>
        </div>

        <div className="border-border flex flex-col gap-3 border-t pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="color-count">Nombre de couleurs</Label>
            <span className="text-fg font-mono text-sm tabular-nums">
              {settings.colorCount}
            </span>
          </div>
          <Slider
            id="color-count"
            aria-label="Nombre de couleurs"
            min={3}
            max={12}
            step={1}
            value={[settings.colorCount]}
            onValueChange={([colorCount]) => applySettings({ colorCount })}
          />
        </div>
      </section>

      {savedPalettes.length > 0 && (
        <section
          aria-labelledby="saved-palettes"
          className="asc-animate-step-in border-border flex flex-col gap-1 border-t pt-6"
        >
          <h2 id="saved-palettes" className="text-fg text-sm font-medium">
            Palettes sauvegardées
          </h2>
          <p className="text-fg-muted text-[0.8125rem] leading-snug">
            Elles restent le temps de cette visite&nbsp;: exporte celles que tu
            veux garder.
          </p>
          <ul className="divide-border mt-2 flex flex-col divide-y">
            {savedPalettes.map((palette) => (
              <li
                key={palette.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
              >
                <div className="flex min-w-0 flex-1 basis-40 flex-col">
                  <span
                    className="text-fg truncate text-sm font-medium"
                    title={palette.name}
                  >
                    {palette.name}
                  </span>
                  <span className="text-fg-subtle text-xs">
                    {palette.colors.length}&nbsp;couleurs,{" "}
                    {palette.createdAt.toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="border-border flex h-8 w-full overflow-hidden rounded-md border sm:w-56"
                >
                  {palette.colors.map((color, index) => (
                    <span
                      key={index}
                      className="min-w-0 flex-1"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="outline" onClick={() => loadPalette(palette)}>
                    Charger
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Supprimer ${palette.name}`}
                    title="Supprimer"
                    onClick={() => deletePalette(palette.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <form onSubmit={savePalette} className="flex min-w-0 flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Sauvegarder la palette</DialogTitle>
              <DialogDescription>
                Donne-lui un nom pour la retrouver sous les réglages.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="palette-name">Nom de la palette</Label>
              <Input
                id="palette-name"
                value={paletteName}
                onChange={(event) => setPaletteName(event.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={!paletteName.trim()}>
                Sauvegarder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ToolPage>
  );
}
