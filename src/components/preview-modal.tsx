"use client";

import { useAtom } from "jotai";
import {
  patternEditorAtom,
  migratePreviewSettingsAtom,
} from "@/lib/pattern-store";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { X, Download, ZoomIn, ZoomOut, Grid } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const [editorState, setEditorState] = useAtom(patternEditorAtom);
  const [, migrateSettings] = useAtom(migratePreviewSettingsAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Migration automatique des paramètres d'aperçu
  useEffect(() => {
    if (isOpen) {
      migrateSettings();
    }
  }, [isOpen, migrateSettings]);

  // Générer l'aperçu du motif
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const repeatCount = editorState.previewRepeatCount || 4;

    if (editorState.gridMode === "pixel") {
      // Mode pixels - calcul basé sur les cellules
      const cellSize = 20;
      const patternSize = editorState.gridSize * cellSize;
      const totalSize = patternSize * repeatCount;

      canvas.width = totalSize;
      canvas.height = totalSize;

      // Remplir l'arrière-plan
      ctx.fillStyle = editorState.backgroundColor;
      ctx.fillRect(0, 0, totalSize, totalSize);

      // Dessiner seulement les cellules actives
      for (let i = 0; i < repeatCount; i++) {
        for (let j = 0; j < repeatCount; j++) {
          // Dessiner chaque cellule du motif
          for (let row = 0; row < editorState.gridSize; row++) {
            for (let col = 0; col < editorState.gridSize; col++) {
              if (editorState.cells[row][col]) {
                const x = i * patternSize + col * cellSize;
                const y = j * patternSize + row * cellSize;

                ctx.fillStyle = editorState.foregroundColor;
                ctx.fillRect(x, y, cellSize, cellSize);
              }
            }
          }
        }
      }
    } else {
      // Mode points - calcul basé sur l'espacement des points
      const spacing = 40;
      const offset = spacing / 2;

      // Générer les points pour calculer les positions
      const points: Array<{ x: number; y: number; id: string }> = [];
      for (let row = 0; row < editorState.gridSize; row++) {
        for (let col = 0; col < editorState.gridSize; col++) {
          points.push({
            x: col * spacing + offset,
            y: row * spacing + offset,
            id: `${row}-${col}`,
          });
        }
      }

      // Calculer la taille du motif - carré complet sans offset
      const patternWidth = (editorState.gridSize - 1) * spacing;
      const patternHeight = (editorState.gridSize - 1) * spacing;
      const totalSize = Math.max(patternWidth, patternHeight) * repeatCount;

      canvas.width = totalSize;
      canvas.height = totalSize;

      // Remplir l'arrière-plan
      ctx.fillStyle = editorState.backgroundColor;
      ctx.fillRect(0, 0, totalSize, totalSize);

      // Dessiner les répétitions
      for (let i = 0; i < repeatCount; i++) {
        for (let j = 0; j < repeatCount; j++) {
          const baseX = i * patternWidth;
          const baseY = j * patternHeight;

          // Dessiner les lignes d'abord (en arrière-plan)
          editorState.lines.forEach((line) => {
            const fromPoint = points.find((p) => p.id === line.from);
            const toPoint = points.find((p) => p.id === line.to);

            if (fromPoint && toPoint) {
              ctx.strokeStyle = editorState.foregroundColor;
              ctx.lineWidth = 3;
              ctx.lineCap = "round";

              ctx.beginPath();
              ctx.moveTo(
                baseX + fromPoint.x - offset,
                baseY + fromPoint.y - offset
              );
              ctx.lineTo(
                baseX + toPoint.x - offset,
                baseY + toPoint.y - offset
              );
              ctx.stroke();
            }
          });

          // Ne pas dessiner les points - seulement les lignes
        }
      }
    }
  }, [editorState, isOpen]);

  const handleExport = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = `pattern-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleZoomIn = () => {
    setEditorState((prev) => ({
      ...prev,
      previewZoom: Math.min((prev.previewZoom || 0.5) + 0.2, 3),
    }));
  };

  const handleZoomOut = () => {
    setEditorState((prev) => ({
      ...prev,
      previewZoom: Math.max((prev.previewZoom || 0.5) - 0.2, 0.5),
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Aperçu du Motif</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={(editorState.previewZoom || 0.5) <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-500 min-w-[60px] text-center">
                  {Math.round((editorState.previewZoom || 0.5) * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={(editorState.previewZoom || 0.5) >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Grid className="h-4 w-4 text-slate-500" />
                  <Label className="text-sm font-medium">Répétitions</Label>
                </div>
                <div className="flex-1 max-w-xs">
                  <Slider
                    value={[editorState.previewRepeatCount || 4]}
                    onValueChange={(value) =>
                      setEditorState((prev) => ({
                        ...prev,
                        previewRepeatCount: value[0],
                      }))
                    }
                    min={2}
                    max={16}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-slate-500 min-w-[40px] text-center">
                  {editorState.previewRepeatCount || 4}×
                  {editorState.previewRepeatCount || 4}
                </span>
              </div>
            </div>
            <CardContent className="p-0">
              <div
                className="overflow-auto max-h-[70vh] bg-slate-100 dark:bg-slate-900"
                style={{ padding: "32px" }}
              >
                <div className="flex justify-center items-center min-h-full">
                  <div
                    style={{
                      transform: `scale(${editorState.previewZoom || 0.5})`,
                      transformOrigin: "center",
                    }}
                    className="transition-transform duration-200"
                  >
                    <canvas
                      ref={canvasRef}
                      className="border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
