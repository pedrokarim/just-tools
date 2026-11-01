"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { HalftoneEngine } from "@/lib/halftone-engine";
import { useHalftoneStore } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlsPanel } from "./controls-panel";
import { ExportPanel } from "./export-panel";
import { ImageDropzone } from "./image-dropzone";
import { LayerPanel } from "./layer-panel";
import { ConfirmDialog } from "./panel-parts";
import { PresetsBar } from "./presets-bar";
import { PreviewCanvas } from "./preview-canvas";

// Les onglets restent montés : les options d'export et les sections repliées
// survivent à un aller-retour.
const PANEL_CONTENT = "min-w-0 data-[state=inactive]:hidden";

export function HalftonePlayground() {
  const {
    sourceImage,
    layers,
    isProcessing,
    setProcessing,
    resetSettings,
    clearSourceImage,
  } = useHalftoneStore();

  const [isResetting, setIsResetting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const renderTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Vérifier si autoApply est activé sur au moins un calque
  const autoApply = layers.some((l) => l.settings.autoApply);

  // Fonction de rendu multi-calques avec debounce
  const renderHalftone = useCallback(async () => {
    if (!sourceImage || !canvasRef.current) return;

    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(async () => {
      try {
        setProcessing(true);
        await HalftoneEngine.renderLayers(
          sourceImage,
          layers,
          canvasRef.current!
        );
      } catch (error) {
        console.error("Erreur lors du rendu:", error);
        toast.error("Le rendu a échoué. Réessaie avec une image plus petite.");
      } finally {
        setProcessing(false);
      }
    }, 100);
  }, [sourceImage, layers, setProcessing]);

  // Cleanup du timeout au unmount
  useEffect(() => {
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  // Rendu automatique
  useEffect(() => {
    if (autoApply) {
      renderHalftone();
    }
  }, [renderHalftone, autoApply]);

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
      {/* La scène suit le défilement du panneau : on voit l'effet en le réglant. */}
      <section
        aria-label="Aperçu de l'image"
        className="bg-card border-border rounded-card flex min-h-[min(60dvh,34rem)] min-w-0 flex-col overflow-hidden border xl:sticky xl:top-22 xl:h-[calc(100dvh-7rem)] xl:min-h-[30rem]"
      >
        {sourceImage ? (
          <PreviewCanvas
            ref={canvasRef}
            isProcessing={isProcessing}
            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => clearSourceImage()}
                >
                  <ImagePlus aria-hidden="true" />
                  Changer d&apos;image
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => renderHalftone()}
                >
                  <Play aria-hidden="true" />
                  Appliquer l&apos;effet
                </Button>
              </>
            }
          />
        ) : (
          <ImageDropzone />
        )}
      </section>

      <aside aria-label="Réglages de la trame" className="min-w-0">
        <Tabs defaultValue="settings" className="min-w-0">
          <TabsList className="w-full">
            <TabsTrigger value="settings">Réglages</TabsTrigger>
            <TabsTrigger value="layers">Calques</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" forceMount className={PANEL_CONTENT}>
            <PresetsBar />
            <ControlsPanel />
            <div className="border-border border-t pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setIsResetting(true)}
              >
                <RotateCcw aria-hidden="true" />
                Réinitialiser les calques et réglages
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="layers" forceMount className={PANEL_CONTENT}>
            <LayerPanel />
          </TabsContent>

          <TabsContent value="export" forceMount className={PANEL_CONTENT}>
            <ExportPanel canvasRef={canvasRef} />
          </TabsContent>
        </Tabs>
      </aside>

      <ConfirmDialog
        open={isResetting}
        onOpenChange={setIsResetting}
        title="Réinitialiser les réglages&nbsp;?"
        description="Tes calques et leurs réglages reviennent à l'état de départ. Tes préréglages enregistrés sont conservés."
        confirmLabel="Réinitialiser"
        onConfirm={() => {
          resetSettings();
          toast.success("Réglages réinitialisés.");
        }}
      />
    </div>
  );
}
