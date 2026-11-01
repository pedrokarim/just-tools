"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { patternEditorAtom, type PatternEditorState } from "@/lib/pattern-store";
import { cn } from "@/lib/utils";

const CELL_SIZE = 20;
/** L'écart entre deux points de la grille, partagé avec `PointsGrid`. */
export const POINT_SPACING = 40;
/** Au-delà, certains navigateurs rendent un canvas vide sans prévenir. */
const MAX_CANVAS_SIZE = 8192;
const THUMBNAIL_MAX_SIZE = 1024;

type PatternSource = Pick<
  PatternEditorState,
  | "gridSize"
  | "gridMode"
  | "cells"
  | "lines"
  | "backgroundColor"
  | "foregroundColor"
>;

function parsePointId(id: string) {
  const [row, col] = id.split("-").map(Number);
  return { row, col };
}

/**
 * Dessine le motif répété sur un canvas, sans grille ni points : c'est l'image
 * finale. L'aperçu, sa fenêtre et les exports passent tous par ici, pour que ce
 * qu'on voit soit exactement ce qu'on télécharge.
 */
export function renderPattern(
  canvas: HTMLCanvasElement,
  {
    gridSize,
    gridMode,
    cells,
    lines,
    backgroundColor,
    foregroundColor,
  }: PatternSource,
  repeatCount: number,
  maxSize = MAX_CANVAS_SIZE
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const isPixelMode = gridMode === "pixel";
  // En mode points, le dernier rang d'une tuile est le premier de la suivante.
  const tileSteps = isPixelMode ? gridSize : gridSize - 1;
  const totalSteps = tileSteps * repeatCount;
  // Un pas entier : une cellule à cheval sur deux pixels laisserait des joints.
  const step = Math.min(
    isPixelMode ? CELL_SIZE : POINT_SPACING,
    Math.floor(maxSize / totalSteps)
  );
  const tileSize = step * tileSteps;
  const size = step * totalSteps;

  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = foregroundColor;
  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = Math.max(1, (3 * step) / POINT_SPACING);
  ctx.lineCap = "round";

  // Une ligne peut viser un point sorti de la grille après un changement de taille.
  const segments = lines
    .map(({ from, to }) => ({
      start: parsePointId(from),
      end: parsePointId(to),
    }))
    .filter(
      ({ start, end }) =>
        Math.max(start.row, start.col, end.row, end.col) < gridSize
    );

  for (let i = 0; i < repeatCount; i++) {
    for (let j = 0; j < repeatCount; j++) {
      const originX = i * tileSize;
      const originY = j * tileSize;

      if (isPixelMode) {
        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            if (cells[row]?.[col]) {
              ctx.fillRect(
                originX + col * step,
                originY + row * step,
                step,
                step
              );
            }
          }
        }
      } else {
        ctx.beginPath();
        segments.forEach(({ start, end }) => {
          ctx.moveTo(originX + start.col * step, originY + start.row * step);
          ctx.lineTo(originX + end.col * step, originY + end.row * step);
        });
        ctx.stroke();
      }
    }
  }
}

interface PatternPreviewProps {
  className?: string;
  repeatCount?: number;
}

/** Le motif en situation, répété, mis à jour à chaque trait. */
export function PatternPreview({
  className,
  repeatCount = 4,
}: PatternPreviewProps) {
  const [editorState] = useAtom(patternEditorAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    gridSize,
    gridMode,
    cells,
    lines,
    backgroundColor,
    foregroundColor,
  } = editorState;

  useEffect(() => {
    if (!canvasRef.current) return;
    renderPattern(
      canvasRef.current,
      { gridSize, gridMode, cells, lines, backgroundColor, foregroundColor },
      repeatCount,
      THUMBNAIL_MAX_SIZE
    );
  }, [
    gridSize,
    gridMode,
    cells,
    lines,
    backgroundColor,
    foregroundColor,
    repeatCount,
  ]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Aperçu du motif répété"
      className={cn("block aspect-square w-full max-w-full", className)}
    />
  );
}
