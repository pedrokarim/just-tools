"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  RotateCcw,
  Palette,
  Download,
  Eye,
  EyeOff,
  Settings,
  Sparkles,
  Lock,
  Unlock,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name?: string;
}

interface Palette {
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

export default function ColorPalette() {
  const [baseColor, setBaseColor] = useState("#3B82F6");
  const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
  const [colorCount, setColorCount] = useState(5);
  const [generatedColors, setGeneratedColors] = useState<Color[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [lockedColors, setLockedColors] = useState<Set<number>>(new Set());

  // Conversion de couleurs
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

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
  };

  const hslToRgb = (h: number, s: number, l: number) => {
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
  };

  const generatePalette = useCallback(() => {
    const baseRgb = hexToRgb(baseColor);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    const colors: Color[] = [];

    for (let i = 0; i < colorCount; i++) {
      if (lockedColors.has(i) && generatedColors[i]) {
        colors.push(generatedColors[i]);
        continue;
      }

      let newHsl = { ...baseHsl };

      switch (paletteType) {
        case "monochromatic":
          newHsl.s = Math.max(10, Math.min(90, baseHsl.s + (i - 2) * 15));
          newHsl.l = Math.max(10, Math.min(90, baseHsl.l + (i - 2) * 15));
          break;
        case "analogous":
          newHsl.h = (baseHsl.h + (i - 2) * 30) % 360;
          break;
        case "complementary":
          if (i === 0) {
            newHsl = baseHsl;
          } else {
            newHsl.h = (baseHsl.h + 180 + (i - 1) * 30) % 360;
          }
          break;
        case "triadic":
          newHsl.h = (baseHsl.h + i * 120) % 360;
          break;
        case "tetradic":
          newHsl.h = (baseHsl.h + i * 90) % 360;
          break;
        case "random":
          newHsl.h = Math.random() * 360;
          newHsl.s = Math.random() * 60 + 20;
          newHsl.l = Math.random() * 40 + 30;
          break;
      }

      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);

      colors.push({
        hex: newHex,
        rgb: newRgb,
        hsl: newHsl,
      });
    }

    setGeneratedColors(colors);
  }, [baseColor, paletteType, colorCount, lockedColors]);

  const toggleLock = (index: number) => {
    const newLocked = new Set(lockedColors);
    if (newLocked.has(index)) {
      newLocked.delete(index);
    } else {
      newLocked.add(index);
    }
    setLockedColors(newLocked);
  };

  const copyColor = (color: Color) => {
    navigator.clipboard.writeText(color.hex);
    toast.success(`Couleur ${color.hex} copiée !`);
  };

  const savePalette = () => {
    const name = prompt("Nom de la palette :");
    if (name && generatedColors.length > 0) {
      const newPalette: Palette = {
        id: Date.now().toString(),
        name,
        colors: [...generatedColors],
        createdAt: new Date(),
      };
      setSavedPalettes((prev) => [newPalette, ...prev]);
      toast.success("Palette sauvegardée !");
    }
  };

  const loadPalette = (palette: Palette) => {
    setGeneratedColors(palette.colors);
    setColorCount(palette.colors.length);
    if (palette.colors.length > 0) {
      setBaseColor(palette.colors[0].hex);
    }
    toast.success(`Palette "${palette.name}" chargée !`);
  };

  const deletePalette = (id: string) => {
    setSavedPalettes((prev) => prev.filter((p) => p.id !== id));
    toast.success("Palette supprimée !");
  };

  const exportPalette = () => {
    if (generatedColors.length === 0) return;

    const css = generatedColors
      .map((color, i) => `--color-${i + 1}: ${color.hex};`)
      .join("\n");

    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Palette exportée !");
  };

  useEffect(() => {
    generatePalette();
  }, [baseColor, paletteType, colorCount, lockedColors]);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="w-full space-y-6">

        {/* Contrôles */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Paramètres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Couleur de base */}
              <div className="space-y-2">
                <Label htmlFor="base-color" className="text-sm font-medium">
                  Couleur de base
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="base-color"
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* Type de palette */}
              <div className="space-y-2">
                <Label htmlFor="palette-type" className="text-sm font-medium">
                  Type de palette
                </Label>
                <select
                  id="palette-type"
                  value={paletteType}
                  onChange={(e) =>
                    setPaletteType(e.target.value as PaletteType)
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="monochromatic">Monochromatique</option>
                  <option value="analogous">Analogue</option>
                  <option value="complementary">Complémentaire</option>
                  <option value="triadic">Triadique</option>
                  <option value="tetradic">Tétradique</option>
                  <option value="random">Aléatoire</option>
                </select>
              </div>

              {/* Nombre de couleurs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="color-count" className="text-sm font-medium">
                    Nombre de couleurs
                  </Label>
                  <Badge variant="outline">{colorCount}</Badge>
                </div>
                <Slider
                  id="color-count"
                  min={3}
                  max={12}
                  step={1}
                  value={[colorCount]}
                  onValueChange={([value]) => setColorCount(value)}
                  className="w-full"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Actions</Label>
                <div className="flex space-x-2">
                  <Button
                    onClick={generatePalette}
                    size="sm"
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer
                  </Button>
                  <Button
                    onClick={savePalette}
                    variant="outline"
                    size="sm"
                    disabled={generatedColors.length === 0}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Palette générée */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Palette générée</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPalette}
                  disabled={generatedColors.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedColors.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-500">
                <div className="text-center">
                  <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Générez une palette pour commencer</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Aperçu des couleurs */}
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                  {generatedColors.map((color, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-lg shadow-md cursor-pointer overflow-hidden"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyColor(color)}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-1 right-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-white/20 hover:bg-white/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(index);
                          }}
                        >
                          {lockedColors.has(index) ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Unlock className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="text-xs font-mono text-white drop-shadow-lg">
                          {color.hex}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Détails des couleurs */}
                {showDetails && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Détails des couleurs</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generatedColors.map((color, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div
                              className="w-8 h-8 rounded border border-slate-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div>
                              <div className="font-mono text-sm font-medium">
                                {color.hex}
                              </div>
                              <div className="text-xs text-slate-500">
                                Couleur {index + 1}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-slate-500">RGB:</span>{" "}
                              {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                            </div>
                            <div>
                              <span className="text-slate-500">HSL:</span>{" "}
                              {Math.round(color.hsl.h)}°,{" "}
                              {Math.round(color.hsl.s)}%,{" "}
                              {Math.round(color.hsl.l)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Palettes sauvegardées */}
        {savedPalettes.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Palettes sauvegardées</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPalettes.map((palette) => (
                  <div
                    key={palette.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{palette.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePalette(palette.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex space-x-1 mb-3">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded border border-slate-300"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{palette.colors.length} couleurs</span>
                      <span>{palette.createdAt.toLocaleDateString()}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => loadPalette(palette)}
                    >
                      Charger
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Types de palettes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Harmoniques</h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li>
                    <strong>Monochromatique:</strong> Variations d'une même
                    teinte
                  </li>
                  <li>
                    <strong>Analogue:</strong> Couleurs adjacentes sur le cercle
                    chromatique
                  </li>
                  <li>
                    <strong>Complémentaire:</strong> Couleurs opposées sur le
                    cercle chromatique
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Avancées</h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li>
                    <strong>Triadique:</strong> Trois couleurs équidistantes
                  </li>
                  <li>
                    <strong>Tétradique:</strong> Quatre couleurs formant un
                    rectangle
                  </li>
                  <li>
                    <strong>Aléatoire:</strong> Génération complètement
                    aléatoire
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
