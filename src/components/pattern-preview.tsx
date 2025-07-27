"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { patternEditorAtom } from "@/lib/pattern-store";

interface PatternPreviewProps {
  className?: string;
  repeatCount?: number;
  cellSize?: number;
}

export function PatternPreview({
  className = "",
  repeatCount = 4,
  cellSize = 8,
}: PatternPreviewProps) {
  const [editorState] = useAtom(patternEditorAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const patternSize = editorState.gridSize * cellSize;
    const totalSize = patternSize * repeatCount;

    canvas.width = totalSize;
    canvas.height = totalSize;

    // Dessiner le motif répété
    for (let i = 0; i < repeatCount; i++) {
      for (let j = 0; j < repeatCount; j++) {
        // Dessiner chaque cellule du motif
        for (let row = 0; row < editorState.gridSize; row++) {
          for (let col = 0; col < editorState.gridSize; col++) {
            const x = i * patternSize + col * cellSize;
            const y = j * patternSize + row * cellSize;

            ctx.fillStyle = editorState.cells[row][col]
              ? editorState.foregroundColor
              : editorState.backgroundColor;
            ctx.fillRect(x, y, cellSize, cellSize);

            // Ajouter une bordure subtile
            ctx.strokeStyle = "#e5e7eb";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, cellSize, cellSize);
          }
        }
      }
    }
  }, [
    editorState.cells,
    editorState.backgroundColor,
    editorState.foregroundColor,
    editorState.gridSize,
    cellSize,
    repeatCount,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`border border-slate-300 dark:border-slate-600 rounded-lg ${className}`}
    />
  );
}
