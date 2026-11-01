"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { renderPattern } from "@/components/pattern-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  migratePreviewSettingsAtom,
  patternEditorAtom,
} from "@/lib/pattern-store";

const DEFAULT_REPEAT_COUNT = 4;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const [editorState, setEditorState] = useAtom(patternEditorAtom);
  const [, migrateSettings] = useAtom(migratePreviewSettingsAtom);
  // Un état plutôt qu'un `ref` : la fenêtre passe par un portail et son canvas
  // se monte après l'effet d'ouverture, qui ne se relancerait pas tout seul.
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [displayWidth, setDisplayWidth] = useState<number>();

  const repeatCount = editorState.previewRepeatCount || DEFAULT_REPEAT_COUNT;
  const zoom = editorState.previewZoom || MIN_ZOOM;

  // Migration automatique des paramètres d'aperçu
  useEffect(() => {
    if (isOpen) {
      migrateSettings();
    }
  }, [isOpen, migrateSettings]);

  useEffect(() => {
    if (!canvas) return;
    renderPattern(canvas, editorState, repeatCount);
    // Le zoom agit sur la largeur et non sur `scale` : c'est elle qui donne sa
    // taille à la zone de défilement.
    // La largeur n'est connue qu'une fois le motif dessiné dans le canvas.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayWidth(canvas.width * zoom);
  }, [canvas, editorState, repeatCount, zoom]);

  const handleExport = () => {
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `pattern-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleZoomIn = () => {
    setEditorState((prev) => ({
      ...prev,
      previewZoom: Math.min((prev.previewZoom || MIN_ZOOM) + ZOOM_STEP, MAX_ZOOM),
    }));
  };

  const handleZoomOut = () => {
    setEditorState((prev) => ({
      ...prev,
      previewZoom: Math.max((prev.previewZoom || MIN_ZOOM) - ZOOM_STEP, MIN_ZOOM),
    }));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-border shrink-0 border-b px-5 py-4 pe-14">
          <DialogTitle>Aperçu du motif</DialogTitle>
          <DialogDescription>
            Le motif répété, tel qu&apos;il sera exporté.
          </DialogDescription>
        </DialogHeader>

        <div className="border-border flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 border-b px-5 py-3">
          <div className="flex min-w-48 flex-1 items-center gap-3">
            <Label htmlFor="preview-repeat" className="shrink-0">
              Répétitions
            </Label>
            <Slider
              id="preview-repeat"
              aria-label="Répétitions"
              min={2}
              max={16}
              step={1}
              value={[repeatCount]}
              onValueChange={([previewRepeatCount]) =>
                setEditorState((prev) => ({ ...prev, previewRepeatCount }))
              }
              className="min-w-0 flex-1 sm:max-w-xs"
            />
            <span className="text-fg shrink-0 font-mono text-sm tabular-nums">
              {repeatCount}×{repeatCount}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dézoomer"
              title="Dézoomer"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOut aria-hidden="true" />
            </Button>
            <span className="text-fg-muted w-12 text-center font-mono text-xs tabular-nums">
              {Math.round(zoom * 100)}&nbsp;%
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zoomer"
              title="Zoomer"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn aria-hidden="true" />
            </Button>
          </div>

          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download aria-hidden="true" />
            Exporter
          </Button>
        </div>

        <div className="bg-surface flex min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {/* `m-auto` centre tant que le motif tient, sans le couper une fois
              qu'il déborde, ce que ferait `justify-center`. */}
          <canvas
            ref={setCanvas}
            style={{ width: displayWidth }}
            role="img"
            aria-label="Motif répété"
            className="border-border rounded-field m-auto block h-auto max-w-none shrink-0 border"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
