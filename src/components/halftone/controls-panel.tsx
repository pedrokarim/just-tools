"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Circle,
  Diamond,
  Heart,
  Hexagon,
  Minus,
  Orbit,
  Plus,
  Square,
  Star,
  Target,
  Triangle,
} from "lucide-react";
import {
  useActiveLayerSettings,
  type ColorMode,
  type Direction,
  type GlobalShape,
  type Mapping,
  type Shape,
} from "@/lib/halftone-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  NumberField,
  OptionGrid,
  PanelSection,
  SelectField,
  SliderField,
  type OptionItem,
} from "./panel-parts";

const GLOBAL_SHAPES: readonly OptionItem<GlobalShape>[] = [
  { value: "circle", label: "Cercle", icon: Circle },
  { value: "square", label: "Carré", icon: Square },
  { value: "diamond", label: "Losange", icon: Diamond },
  { value: "hexagon", label: "Hexagone", icon: Hexagon },
  { value: "triangle", label: "Triangle", icon: Triangle },
  { value: "star", label: "Étoile", icon: Star },
  { value: "heart", label: "Cœur", icon: Heart },
];

const DIRECTIONS: readonly OptionItem<Direction>[] = [
  { value: "top", label: "Haut", icon: ArrowUp },
  { value: "bottom", label: "Bas", icon: ArrowDown },
  { value: "left", label: "Gauche", icon: ArrowLeft },
  { value: "right", label: "Droite", icon: ArrowRight },
  { value: "center", label: "Centre", icon: Target },
  { value: "radial", label: "Radial", icon: Orbit },
];

const DOT_SHAPES: readonly OptionItem<Shape>[] = [
  { value: "circle", label: "Cercle", icon: Circle },
  { value: "square", label: "Carré", icon: Square },
  { value: "diamond", label: "Losange", icon: Diamond },
  { value: "hexagon", label: "Hexagone", icon: Hexagon },
  { value: "line", label: "Ligne", icon: Minus },
];

const COLOR_MODES: readonly { value: ColorMode; label: string }[] = [
  { value: "monochrome", label: "Monochrome" },
  { value: "channels", label: "Canaux RVB" },
  { value: "palette", label: "Palette" },
];

const MAPPINGS: readonly { value: Mapping; label: string }[] = [
  { value: "linear", label: "Linéaire" },
  { value: "gamma", label: "Gamma" },
  { value: "logarithmic", label: "Logarithmique" },
  { value: "exponential", label: "Exponentiel" },
];

function labelOf(
  options: readonly { value: string; label: string }[],
  value: string
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Une couleur : le nuancier du navigateur et son code, qui se répondent. */
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Input
        type="color"
        aria-label={`${label}, nuancier`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-9 shrink-0 cursor-pointer p-1 pointer-coarse:h-11 pointer-coarse:w-11"
      />
      <Input
        aria-label={`${label}, code hexadécimal`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-0 flex-1 px-2 font-mono text-xs pointer-coarse:h-11"
      />
    </div>
  );
}

export function ControlsPanel() {
  const { settings, updateSettings, isLocked, activeLayer } =
    useActiveLayerSettings();

  const replaceColor = (index: number, color: string) => {
    const colors = [...settings.couleurs];
    colors[index] = color;
    updateSettings({ couleurs: colors });
  };

  return (
    <div className="flex min-w-0 flex-col">
      <div className="border-border flex min-w-0 flex-col gap-1 border-t py-3">
        <div className="flex min-h-6 min-w-0 items-center justify-between gap-3">
          <p className="text-fg-muted min-w-0 truncate text-sm">
            Calque actif&nbsp;:{" "}
            <span className="text-fg font-medium" title={activeLayer?.name}>
              {activeLayer?.name ?? "aucun"}
            </span>
          </p>
          {isLocked && <Badge variant="warning">Verrouillé</Badge>}
        </div>
        {isLocked && (
          <p className="text-fg-muted text-xs leading-snug">
            Déverrouille-le dans l&apos;onglet Calques pour le régler.
          </p>
        )}
      </div>

      {/* `inert` retire aussi le clavier : un calque verrouillé n'est pas réglable. */}
      <div
        inert={isLocked}
        className={cn("flex min-w-0 flex-col", isLocked && "opacity-50")}
      >
        <div className="border-border flex flex-col gap-1 border-t pt-1 pb-3">
          <Switch
            label="Application automatique"
            checked={settings.autoApply}
            onChange={(event) =>
              updateSettings({ autoApply: event.target.checked })
            }
          />
          <p className="text-fg-muted text-xs leading-snug">
            L&apos;effet suit tes réglages en direct. Sur une grande image,
            coupe-la et utilise «&nbsp;Appliquer l&apos;effet&nbsp;».
          </p>
        </div>

        <PanelSection
          title="Forme globale"
          summary={labelOf(GLOBAL_SHAPES, settings.globalShape)}
        >
          <OptionGrid
            label="Forme de l'ensemble"
            options={GLOBAL_SHAPES}
            value={settings.globalShape}
            onChange={(globalShape) => updateSettings({ globalShape })}
            className="grid-cols-[repeat(4,minmax(0,1fr))]"
          />
          <OptionGrid
            label="Direction de l'effet"
            options={DIRECTIONS}
            value={settings.direction}
            onChange={(direction) => updateSettings({ direction })}
            className="grid-cols-[repeat(3,minmax(0,1fr))]"
          />
          <SliderField
            label="Position horizontale"
            unit="%"
            value={settings.effectPosition.x}
            min={-100}
            max={200}
            onChange={(x) =>
              updateSettings({
                effectPosition: { ...settings.effectPosition, x },
              })
            }
          />
          <SliderField
            label="Position verticale"
            unit="%"
            value={settings.effectPosition.y}
            min={-100}
            max={200}
            onChange={(y) =>
              updateSettings({
                effectPosition: { ...settings.effectPosition, y },
              })
            }
          />
          <p className="text-fg-muted -mt-2 text-xs leading-snug">
            De 0 à 100&nbsp;%, le centre reste dans l&apos;image. Au-delà,
            l&apos;effet en sort.
          </p>
          <SliderField
            label="Taille de la forme"
            unit="%"
            displayFactor={100}
            value={settings.globalShapeScale ?? 1}
            min={0.1}
            max={3}
            step={0.01}
            onChange={(globalShapeScale) => updateSettings({ globalShapeScale })}
          />
        </PanelSection>

        <PanelSection
          title="Forme de la trame"
          summary={labelOf(DOT_SHAPES, settings.shape)}
        >
          <OptionGrid
            label="Forme des points"
            options={DOT_SHAPES}
            value={settings.shape}
            onChange={(shape) => updateSettings({ shape })}
            className="grid-cols-[repeat(3,minmax(0,1fr))]"
          />
          <SliderField
            label="Angle de rotation"
            unit="°"
            value={settings.angle}
            min={0}
            max={180}
            onChange={(angle) => updateSettings({ angle })}
          />
        </PanelSection>

        <PanelSection title="Densité et taille">
          <SliderField
            label="Densité de la trame"
            value={settings.frequency}
            min={1}
            max={300}
            onChange={(frequency) => updateSettings({ frequency })}
          />
          <SliderField
            label="Taille minimale des points"
            unit="px"
            value={settings.sizeMin}
            min={1}
            max={50}
            onChange={(sizeMin) => updateSettings({ sizeMin })}
          />
          <SliderField
            label="Taille maximale des points"
            unit="px"
            value={settings.sizeMax}
            min={settings.sizeMin}
            max={100}
            onChange={(sizeMax) => updateSettings({ sizeMax })}
          />
        </PanelSection>

        <PanelSection
          title="Couleurs"
          summary={labelOf(COLOR_MODES, settings.modeCouleur)}
        >
          <SelectField
            label="Mode de couleur"
            value={settings.modeCouleur}
            options={COLOR_MODES}
            onChange={(modeCouleur) => updateSettings({ modeCouleur })}
          />

          {settings.modeCouleur === "monochrome" && (
            <ColorField
              label="Couleur de la trame"
              value={settings.couleurs[0]}
              onChange={(color) => replaceColor(0, color)}
            />
          )}

          {settings.modeCouleur === "palette" && (
            <div className="flex min-w-0 flex-col gap-2">
              <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
                {settings.couleurs.map((color, index) => (
                  <ColorField
                    key={index}
                    label={`Couleur ${index + 1}`}
                    value={color}
                    onChange={(next) => replaceColor(index, next)}
                  />
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() =>
                  updateSettings({
                    couleurs: [...settings.couleurs, "#000000"],
                  })
                }
              >
                <Plus aria-hidden="true" />
                Ajouter une couleur
              </Button>
            </div>
          )}

          <SliderField
            label="Intensité de la trame"
            unit="%"
            displayFactor={100}
            value={settings.opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(opacity) => updateSettings({ opacity })}
          />
        </PanelSection>

        <PanelSection
          title="Effets avancés"
          summary={labelOf(MAPPINGS, settings.mapping)}
          defaultOpen={false}
        >
          <SelectField
            label="Répartition de la trame"
            value={settings.mapping}
            options={MAPPINGS}
            onChange={(mapping) => updateSettings({ mapping })}
          />
          {settings.mapping === "gamma" && (
            <SliderField
              label="Valeur gamma"
              value={settings.gamma}
              min={0.1}
              max={5}
              step={0.1}
              onChange={(gamma) => updateSettings({ gamma })}
            />
          )}
          <SliderField
            label="Seuil"
            unit="%"
            displayFactor={100}
            value={settings.threshold}
            min={0}
            max={1}
            step={0.01}
            onChange={(threshold) => updateSettings({ threshold })}
          />
          <SliderField
            label="Variation aléatoire"
            unit="%"
            displayFactor={100}
            value={settings.jitter}
            min={0}
            max={1}
            step={0.01}
            onChange={(jitter) => updateSettings({ jitter })}
          />
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="halftone-seed"
              className="min-w-0 text-[0.8125rem] font-normal"
            >
              Graine aléatoire
            </Label>
            <NumberField
              id="halftone-seed"
              label="Graine aléatoire"
              value={settings.seed}
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              onChange={(seed) => updateSettings({ seed })}
              className="w-28"
            />
          </div>
        </PanelSection>
      </div>
    </div>
  );
}
