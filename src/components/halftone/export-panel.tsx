"use client";

import { useState } from "react";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { HalftoneExporter, type ExportOptions } from "@/lib/halftone-export";
import { useHalftoneStore } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OptionGrid, SelectField, SliderField, type OptionItem } from "./panel-parts";

type ExportFormat = ExportOptions["format"];

const FORMATS: readonly OptionItem<ExportFormat>[] = [
  { value: "png", label: "PNG", icon: FileImage },
  { value: "jpg", label: "JPG", icon: FileImage },
  { value: "svg", label: "SVG", icon: FileText },
];

const FORMAT_HINTS: Record<ExportFormat, string> = {
  png: "Qualité maximale, transparence possible.",
  jpg: "Fichier plus léger, sans transparence.",
  svg: "Vectoriel, s'agrandit sans perte, poids variable.",
};

const RESOLUTIONS = [
  { value: "1", label: "1× (taille d'origine)" },
  { value: "2", label: "2× (haute résolution)" },
  { value: "3", label: "3× (très haute résolution)" },
] as const;

const DEFAULT_JPG_QUALITY = 0.9;

interface ExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function ExportPanel({ canvasRef }: ExportPanelProps) {
  const { sourceImage, layers } = useHalftoneStore();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "png",
    resolution: 1,
    transparent: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!sourceImage || !canvasRef.current) {
      toast.error("Charge d'abord une image à exporter.");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await HalftoneExporter.export(
        sourceImage,
        layers,
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

      toast.success(`Image exportée en ${exportOptions.format.toUpperCase()}.`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("L'export a échoué. Réessaie avec une résolution plus basse.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-col gap-1.5">
        <OptionGrid
          label="Format"
          options={FORMATS}
          value={exportOptions.format}
          onChange={(format) =>
            setExportOptions((previous) => ({ ...previous, format }))
          }
          className="grid-cols-[repeat(3,minmax(0,1fr))]"
        />
        <p className="text-fg-muted text-xs leading-snug">
          {FORMAT_HINTS[exportOptions.format]}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <SelectField
          label="Résolution"
          value={String(exportOptions.resolution) as "1" | "2" | "3"}
          options={RESOLUTIONS}
          onChange={(resolution) =>
            setExportOptions((previous) => ({
              ...previous,
              resolution: Number(resolution) as ExportOptions["resolution"],
            }))
          }
        />
        {sourceImage && (
          <p className="text-fg-muted text-xs tabular-nums">
            Taille finale&nbsp;: {sourceImage.width * exportOptions.resolution}
            &nbsp;×&nbsp;{sourceImage.height * exportOptions.resolution}&nbsp;px
          </p>
        )}
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
        <Checkbox
          checked={exportOptions.transparent}
          onCheckedChange={(checked) =>
            setExportOptions((previous) => ({
              ...previous,
              transparent: checked === true,
            }))
          }
        />
        <span className="text-fg">Fond transparent</span>
      </label>

      {exportOptions.format === "jpg" && (
        <SliderField
          label="Qualité JPG"
          unit="%"
          displayFactor={100}
          value={exportOptions.quality || DEFAULT_JPG_QUALITY}
          min={0.1}
          max={1}
          step={0.01}
          onChange={(quality) =>
            setExportOptions((previous) => ({ ...previous, quality }))
          }
        />
      )}

      <div className="border-border flex flex-col gap-2 border-t pt-5">
        <Button
          onClick={handleExport}
          disabled={!sourceImage || isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="asc-animate-spin" aria-hidden="true" />
              Export en cours…
            </>
          ) : (
            <>
              <Download aria-hidden="true" />
              Exporter l&apos;image
            </>
          )}
        </Button>
        {!sourceImage && (
          <p className="text-fg-muted text-xs leading-snug">
            Charge une image pour pouvoir l&apos;exporter.
          </p>
        )}
      </div>
    </div>
  );
}
