"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useHalftoneStore } from "@/lib/halftone-store";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, ZoomIn, ZoomOut, RotateCcw, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PreviewCanvasProps {
  isProcessing: boolean;
}

export const PreviewCanvas = forwardRef<HTMLCanvasElement, PreviewCanvasProps>(
  ({ isProcessing }, ref) => {
    const { sourceImage, previewSize, setPreviewSize, clearSourceImage } =
      useHalftoneStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Gestion du zoom
    const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 5));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.1));
    const handleResetView = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    const handleRemoveImage = () => {
      if (confirm("Voulez-vous vraiment supprimer cette image ?")) {
        clearSourceImage();
        toast.success("Image supprimée");
      }
    };

    // Gestion du pan
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Gestion du zoom avec la molette
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)));
    };

    // Ajuster la taille du canvas quand l'image change
    useEffect(() => {
      if (sourceImage && containerRef.current) {
        const container = containerRef.current;
        const maxWidth = container.clientWidth - 32; // Padding
        const maxHeight = container.clientHeight - 32;

        const aspectRatio = sourceImage.width / sourceImage.height;
        let width, height;

        if (aspectRatio > 1) {
          width = Math.min(sourceImage.width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(sourceImage.height, maxHeight);
          width = height * aspectRatio;
        }

        setPreviewSize({
          width: Math.round(width),
          height: Math.round(height),
        });
      }
    }, [sourceImage, setPreviewSize]);

    if (!sourceImage) {
      return null;
    }

    return (
      <div className="h-full flex flex-col">
        {/* En-tête du canvas */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Prévisualisation
            </span>
            {isProcessing && (
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <div className="animate-spin rounded-full h-3 w-3 border border-slate-400 border-t-transparent" />
                <span>Traitement...</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.1}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>

            <span className="text-xs text-slate-500 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 5}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleResetView}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Zone de prévisualisation */}
        <div className="flex-1 overflow-hidden p-4">
          <div
            ref={containerRef}
            className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <motion.div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <canvas
                ref={ref}
                width={previewSize.width}
                height={previewSize.height}
                className="max-w-none shadow-lg rounded"
                style={{
                  cursor: isDragging ? "grabbing" : "grab",
                }}
              />
            </motion.div>

            {/* Overlay d'information */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {previewSize.width} × {previewSize.height}
            </div>

            {/* Bouton de suppression d'image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2"
            >
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="h-8 w-8 p-0 rounded-full shadow-lg"
                title="Supprimer l'image"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Indicateur de clic pour supprimer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded"
            >
              <div className="flex items-center space-x-1">
                <X className="h-3 w-3" />
                <span>Cliquez pour supprimer</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }
);

PreviewCanvas.displayName = "PreviewCanvas";
