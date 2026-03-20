"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHalftoneStore } from "@/lib/halftone-store";
import { HalftoneEngine } from "@/lib/halftone-engine";
import { ImageDropzone } from "./image-dropzone";
import { PreviewCanvas } from "./preview-canvas";
import { ControlsPanel } from "./controls-panel";
import { ExportPanel } from "./export-panel";
import { PresetsBar } from "./presets-bar";
import { LayerPanel } from "./layer-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Image,
  Settings,
  Download,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export function HalftonePlayground() {
  const {
    sourceImage,
    layers,
    isProcessing,
    setProcessing,
    resetSettings,
    savePreset,
    clearSourceImage,
  } = useHalftoneStore();

  const [showControls, setShowControls] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
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
        toast.error("Erreur lors du rendu de l'image");
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

  // Sauvegarder un preset
  const handleSavePreset = () => {
    const name = prompt("Nom du preset:");
    if (name) {
      savePreset(name);
      toast.success(`Preset "${name}" sauvegardé`);
    }
  };

  // Réinitialiser les paramètres
  const handleReset = () => {
    if (confirm("Réinitialiser tous les paramètres ?")) {
      resetSettings();
      toast.success("Paramètres réinitialisés");
    }
  };

  // Appliquer l'effet manuellement
  const handleApplyEffect = () => {
    if (!sourceImage) {
      toast.error("Aucune image chargée");
      return;
    }
    renderHalftone();
    toast.success("Effet appliqué");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-background">
      {/* En-tête avec actions */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Image className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Effet de Trame
              </h1>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Ajoutez un effet de trame par-dessus vos images
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearSourceImage()}
              disabled={!sourceImage}
            >
              <Image className="h-4 w-4 mr-2" />
              Changer d'image
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleApplyEffect}
              disabled={!sourceImage}
            >
              <Eye className="h-4 w-4 mr-2" />
              Appliquer l'effet
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSavePreset}
              disabled={!sourceImage}
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>

            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>

            <Button
              variant={showLayers ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLayers(!showLayers)}
            >
              <Layers className="h-4 w-4 mr-2" />
              Calques
            </Button>

            <Button
              variant={showControls ? "default" : "outline"}
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Contrôles
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExport(!showExport)}
              disabled={!sourceImage}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Barre des presets */}
      <PresetsBar />

      {/* Contenu principal : 3 colonnes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panneau de calques (gauche) */}
        <AnimatePresence>
          {showLayers && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-card overflow-hidden"
            >
              <LayerPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone de prévisualisation (centre) */}
        <div className="flex-1 flex flex-col p-4">
          {!sourceImage ? (
            <ImageDropzone />
          ) : (
            <div className="flex-1 flex flex-col">
              <PreviewCanvas ref={canvasRef} isProcessing={isProcessing} />
            </div>
          )}
        </div>

        {/* Panneau latéral (droite) */}
        <AnimatePresence>
          {(showControls || showExport) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-card overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                {showControls && <ControlsPanel />}
                {showExport && <ExportPanel canvasRef={canvasRef} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicateur de traitement */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 right-4"
          >
            <Card className="shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Traitement en cours...
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
