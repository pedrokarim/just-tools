"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useHalftoneStore } from "@/lib/halftone-store";
import { HalftoneExporter, ExportOptions } from "@/lib/halftone-export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileImage,
  FileText,
  Settings,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function ExportPanel({ canvasRef }: ExportPanelProps) {
  const { sourceImage, settings } = useHalftoneStore();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "png",
    resolution: 1,
    transparent: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!sourceImage || !canvasRef.current) {
      toast.error("Aucune image à exporter");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await HalftoneExporter.export(
        sourceImage,
        settings,
        exportOptions
      );

      // Générer le nom de fichier
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `halftone-${timestamp}.${exportOptions.format}`;

      // Télécharger le fichier
      HalftoneExporter.downloadBlob(blob, filename);

      toast.success(`Image exportée en ${exportOptions.format.toUpperCase()}`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons = {
    png: FileImage,
    jpg: FileImage,
    svg: FileText,
  };

  const resolutionLabels = {
    1: "1x (Original)",
    2: "2x (Haute résolution)",
    3: "3x (Très haute résolution)",
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="sticky top-0 bg-white dark:bg-slate-800 pb-2 z-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export</span>
        </h2>
      </div>

      {/* Format d'export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <FileImage className="h-4 w-4" />
            <span>Format</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(["png", "jpg", "svg"] as const).map((format) => {
              const Icon = formatIcons[format];
              return (
                <Button
                  key={format}
                  variant={
                    exportOptions.format === format ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setExportOptions((prev) => ({ ...prev, format }))
                  }
                  className="flex flex-col items-center space-y-1 h-16"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs uppercase">{format}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Résolution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Résolution</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resolution" className="text-sm">
              Multiplicateur de résolution
            </Label>
            <select
              id="resolution"
              value={exportOptions.resolution}
              onChange={(e) =>
                setExportOptions((prev) => ({
                  ...prev,
                  resolution: Number(e.target.value) as 1 | 2 | 3,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm"
            >
              <option value={1}>{resolutionLabels[1]}</option>
              <option value={2}>{resolutionLabels[2]}</option>
              <option value={3}>{resolutionLabels[3]}</option>
            </select>
          </div>

          {sourceImage && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Taille finale: {sourceImage.width * exportOptions.resolution} ×{" "}
              {sourceImage.height * exportOptions.resolution} px
            </div>
          )}
        </CardContent>
      </Card>

      {/* Options avancées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fond transparent */}
          <div className="flex items-center justify-between">
            <Label htmlFor="transparent" className="text-sm">
              Fond transparent
            </Label>
            <input
              id="transparent"
              type="checkbox"
              checked={exportOptions.transparent}
              onChange={(e) =>
                setExportOptions((prev) => ({
                  ...prev,
                  transparent: e.target.checked,
                }))
              }
              className="rounded border-slate-300 dark:border-slate-600"
            />
          </div>

          {/* Qualité JPG */}
          {exportOptions.format === "jpg" && (
            <div className="space-y-2">
              <Label htmlFor="quality" className="text-sm">
                Qualité JPG
              </Label>
              <div className="flex items-center space-x-2">
                <input
                  id="quality"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={exportOptions.quality || 0.9}
                  onChange={(e) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      quality: Number(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <Input
                  value={Math.round((exportOptions.quality || 0.9) * 100)}
                  onChange={(e) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      quality: Number(e.target.value) / 100,
                    }))
                  }
                  className="w-16 text-center"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <Check className="h-3 w-3 text-green-500" />
              <span>PNG: Qualité maximale, support transparence</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-3 w-3 text-green-500" />
              <span>JPG: Taille réduite, pas de transparence</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-3 w-3 text-green-500" />
              <span>SVG: Vectoriel, évolutif, taille variable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton d'export */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-800 pt-2">
        <Button
          onClick={handleExport}
          disabled={!sourceImage || isExporting}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Export en cours...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exporter l'image
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
