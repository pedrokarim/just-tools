"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHalftoneStore } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Palette,
  Circle,
  Square,
  Diamond,
  Hexagon,
  Minus,
  Droplets,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Target,
  Zap,
} from "lucide-react";

export function ControlsPanel() {
  const { settings, updateSettings } = useHalftoneStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["global-shape", "shape", "size", "color"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const shapeIcons = {
    circle: Circle,
    square: Square,
    diamond: Diamond,
    hexagon: Hexagon,
    line: Minus,
    "custom-svg": Settings,
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="sticky top-0 bg-white dark:bg-slate-800 pb-2 z-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Paramètres</span>
        </h2>
      </div>

      {/* Forme globale */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("global-shape")}
        >
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Compass className="h-4 w-4" />
              <span>Forme globale</span>
            </div>
            <Badge variant="outline">{settings.globalShape}</Badge>
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.has("global-shape") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                {/* Formes globales */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Forme de l'ensemble
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        "circle",
                        "square",
                        "diamond",
                        "hexagon",
                        "triangle",
                        "star",
                        "heart",
                      ] as const
                    ).map((shape) => {
                      const getIcon = (shape: string) => {
                        switch (shape) {
                          case "circle":
                            return Circle;
                          case "square":
                            return Square;
                          case "diamond":
                            return Diamond;
                          case "hexagon":
                            return Hexagon;
                          case "triangle":
                            return Target;
                          case "star":
                            return Sparkles;
                          case "heart":
                            return Layers;
                          default:
                            return Circle;
                        }
                      };
                      const Icon = getIcon(shape);
                      return (
                        <Button
                          key={shape}
                          variant={
                            settings.globalShape === shape
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => updateSettings({ globalShape: shape })}
                          className="flex flex-col items-center space-y-1 h-12"
                          title={shape}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="text-xs capitalize">{shape}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Direction */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Direction de l'effet
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        "top",
                        "bottom",
                        "left",
                        "right",
                        "center",
                        "radial",
                      ] as const
                    ).map((direction) => {
                      const getIcon = (direction: string) => {
                        switch (direction) {
                          case "top":
                            return ArrowUp;
                          case "bottom":
                            return ArrowDown;
                          case "left":
                            return ArrowLeft;
                          case "right":
                            return ArrowRight;
                          case "center":
                            return Target;
                          case "radial":
                            return Zap;
                          default:
                            return Target;
                        }
                      };
                      const Icon = getIcon(direction);
                      return (
                        <Button
                          key={direction}
                          variant={
                            settings.direction === direction
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => updateSettings({ direction })}
                          className="flex flex-col items-center space-y-1 h-12"
                          title={direction}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="text-xs capitalize">
                            {direction}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Position de l'effet */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Position de l'effet
                  </Label>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Position X</span>
                        <span>{settings.effectPosition.x}%</span>
                      </div>
                      <Slider
                        value={[settings.effectPosition.x]}
                        onValueChange={([value]) =>
                          updateSettings({
                            effectPosition: {
                              ...settings.effectPosition,
                              x: value,
                            },
                          })
                        }
                        min={-100}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>-100% (gauche)</span>
                        <span>200% (droite)</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Position Y</span>
                        <span>{settings.effectPosition.y}%</span>
                      </div>
                      <Slider
                        value={[settings.effectPosition.y]}
                        onValueChange={([value]) =>
                          updateSettings({
                            effectPosition: {
                              ...settings.effectPosition,
                              y: value,
                            },
                          })
                        }
                        min={-100}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>-100% (haut)</span>
                        <span>200% (bas)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto-application */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">
                      Application automatique
                    </Label>
                    <Button
                      variant={settings.autoApply ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateSettings({ autoApply: !settings.autoApply })
                      }
                      className="h-6 px-2"
                    >
                      {settings.autoApply ? "Activée" : "Désactivée"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Applique automatiquement l'effet quand vous modifiez les
                    paramètres (activée par défaut)
                  </p>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Forme */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("shape")}
        >
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Circle className="h-4 w-4" />
              <span>Forme de la trame</span>
            </div>
            <Badge variant="outline">{settings.shape}</Badge>
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.has("shape") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    ["circle", "square", "diamond", "hexagon", "line"] as const
                  ).map((shape) => {
                    const Icon = shapeIcons[shape];
                    return (
                      <Button
                        key={shape}
                        variant={
                          settings.shape === shape ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => updateSettings({ shape })}
                        className="flex flex-col items-center space-y-1 h-16"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs capitalize">{shape}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="angle" className="text-sm">
                    Angle de rotation (°)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="angle"
                      min={0}
                      max={180}
                      step={1}
                      value={[settings.angle]}
                      onValueChange={([value]) =>
                        updateSettings({ angle: value })
                      }
                      className="flex-1"
                    />
                    <Input
                      value={settings.angle}
                      onChange={(e) =>
                        updateSettings({ angle: Number(e.target.value) })
                      }
                      className="w-16 text-center"
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Taille et fréquence */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("size")}
        >
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Densité & Taille de la trame</span>
            </div>
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.has("size") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-sm">
                    Densité de la trame
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="frequency"
                      min={1}
                      max={300}
                      step={1}
                      value={[settings.frequency]}
                      onValueChange={([value]) =>
                        updateSettings({ frequency: value })
                      }
                      className="flex-1"
                    />
                    <Input
                      value={settings.frequency}
                      onChange={(e) =>
                        updateSettings({ frequency: Number(e.target.value) })
                      }
                      className="w-16 text-center"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sizeMin" className="text-sm">
                    Taille minimale des points (px)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="sizeMin"
                      min={1}
                      max={50}
                      step={1}
                      value={[settings.sizeMin]}
                      onValueChange={([value]) =>
                        updateSettings({ sizeMin: value })
                      }
                      className="flex-1"
                    />
                    <Input
                      value={settings.sizeMin}
                      onChange={(e) =>
                        updateSettings({ sizeMin: Number(e.target.value) })
                      }
                      className="w-16 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sizeMax" className="text-sm">
                    Taille maximale des points (px)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="sizeMax"
                      min={settings.sizeMin}
                      max={100}
                      step={1}
                      value={[settings.sizeMax]}
                      onValueChange={([value]) =>
                        updateSettings({ sizeMax: value })
                      }
                      className="flex-1"
                    />
                    <Input
                      value={settings.sizeMax}
                      onChange={(e) =>
                        updateSettings({ sizeMax: Number(e.target.value) })
                      }
                      className="w-16 text-center"
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Couleurs */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("color")}
        >
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Couleurs de la trame</span>
            </div>
            <Badge variant="outline">{settings.modeCouleur}</Badge>
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.has("color") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="colorMode" className="text-sm">
                    Mode de couleur de la trame
                  </Label>
                  <select
                    id="colorMode"
                    value={settings.modeCouleur}
                    onChange={(e) =>
                      updateSettings({ modeCouleur: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="monochrome">Monochrome</option>
                    <option value="channels">Canaux RGB</option>
                    <option value="palette">Palette</option>
                  </select>
                </div>

                {settings.modeCouleur === "monochrome" && (
                  <div className="space-y-2">
                    <Label htmlFor="monochromeColor" className="text-sm">
                      Couleur
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="monochromeColor"
                        type="color"
                        value={settings.couleurs[0]}
                        onChange={(e) =>
                          updateSettings({
                            couleurs: [e.target.value, settings.couleurs[1]],
                          })
                        }
                        className="w-12 h-8"
                      />
                      <Input
                        value={settings.couleurs[0]}
                        onChange={(e) =>
                          updateSettings({
                            couleurs: [e.target.value, settings.couleurs[1]],
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                {settings.modeCouleur === "palette" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Palette de couleurs</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {settings.couleurs.map((color, index) => (
                        <div key={index} className="space-y-1">
                          <Input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...settings.couleurs];
                              newColors[index] = e.target.value;
                              updateSettings({ couleurs: newColors });
                            }}
                            className="w-full h-8"
                          />
                          <Input
                            value={color}
                            onChange={(e) => {
                              const newColors = [...settings.couleurs];
                              newColors[index] = e.target.value;
                              updateSettings({ couleurs: newColors });
                            }}
                            className="w-full text-xs"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSettings({
                          couleurs: [...settings.couleurs, "#000000"],
                        })
                      }
                      className="w-full"
                    >
                      <Droplets className="h-3 w-3 mr-1" />
                      Ajouter une couleur
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="opacity" className="text-sm">
                    Intensité de la trame
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="opacity"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[settings.opacity]}
                      onValueChange={([value]) =>
                        updateSettings({ opacity: value })
                      }
                      className="flex-1"
                    />
                    <Input
                      value={Math.round(settings.opacity * 100)}
                      onChange={(e) =>
                        updateSettings({
                          opacity: Number(e.target.value) / 100,
                        })
                      }
                      className="w-16 text-center"
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Avancé */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("advanced")}
        >
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Effets avancés</span>
            </div>
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.has("advanced") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mapping" className="text-sm">
                    Répartition de la trame
                  </Label>
                  <select
                    id="mapping"
                    value={settings.mapping}
                    onChange={(e) =>
                      updateSettings({ mapping: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="linear">Linéaire</option>
                    <option value="gamma">Gamma</option>
                    <option value="logarithmic">Logarithmique</option>
                    <option value="exponential">Exponentiel</option>
                  </select>
                </div>

                {settings.mapping === "gamma" && (
                  <div className="space-y-2">
                    <Label htmlFor="gamma" className="text-sm">
                      Valeur gamma
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="gamma"
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={[settings.gamma]}
                        onValueChange={([value]) =>
                          updateSettings({ gamma: value })
                        }
                        className="flex-1"
                      />
                      <Input
                        value={settings.gamma}
                        onChange={(e) =>
                          updateSettings({ gamma: Number(e.target.value) })
                        }
                        className="w-16 text-center"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="threshold" className="text-sm">
                    Seuil
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="threshold"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[settings.threshold]}
                      onValueChange={([value]) =>
                        updateSettings({ threshold: value })
                      }
                      className="flex-1"
                    />
                    <Input
                      value={Math.round(settings.threshold * 100)}
                      onChange={(e) =>
                        updateSettings({
                          threshold: Number(e.target.value) / 100,
                        })
                      }
                      className="w-16 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jitter" className="text-sm">
                    Variation aléatoire de la trame
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="jitter"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[settings.jitter]}
                      onValueChange={([value]) =>
                        updateSettings({ jitter: value })
                      }
                      className="flex-1"
                    />
                    <Input
                      value={Math.round(settings.jitter * 100)}
                      onChange={(e) =>
                        updateSettings({ jitter: Number(e.target.value) / 100 })
                      }
                      className="w-16 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seed" className="text-sm">
                    Graine aléatoire
                  </Label>
                  <Input
                    id="seed"
                    type="number"
                    value={settings.seed}
                    onChange={(e) =>
                      updateSettings({ seed: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
