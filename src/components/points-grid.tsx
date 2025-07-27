"use client";

import { useAtom } from "jotai";
import {
  patternEditorAtom,
  toggleCellWithHistoryAtom,
  togglePointSelectionAtom,
  addLineAtom,
  removeLineAtom,
  Line,
} from "@/lib/pattern-store";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
  id: string;
  isSelected?: boolean;
  isHovered?: boolean;
}

interface AnimatedLine extends Line {
  isAnimating?: boolean;
  animationProgress?: number;
}

interface CurrentLine {
  from: string;
  to: { x: number; y: number };
  isDrawing: boolean;
}

export function PointsGrid() {
  const [editorState, setEditorState] = useAtom(patternEditorAtom);
  const [, toggleCell] = useAtom(toggleCellWithHistoryAtom);
  const [, togglePointSelection] = useAtom(togglePointSelectionAtom);
  const [, addLine] = useAtom(addLineAtom);
  const [, removeLine] = useAtom(removeLineAtom);
  const [points, setPoints] = useState<Point[]>([]);
  const [animatedLines, setAnimatedLines] = useState<AnimatedLine[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<CurrentLine | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [hoveredLine, setHoveredLine] = useState<Line | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Générer les points de la grille
  useEffect(() => {
    const newPoints: Point[] = [];
    const spacing = 40;
    const offset = spacing / 2;

    for (let row = 0; row < editorState.gridSize; row++) {
      for (let col = 0; col < editorState.gridSize; col++) {
        newPoints.push({
          x: col * spacing + offset,
          y: row * spacing + offset,
          id: `${row}-${col}`,
          isSelected: false,
          isHovered: false,
        });
      }
    }
    setPoints(newPoints);
  }, [editorState.gridSize]);

  // Synchroniser les lignes animées avec l'état du store
  useEffect(() => {
    // Filtrer les lignes animées pour ne garder que celles qui existent encore dans le store
    setAnimatedLines((prev) =>
      prev.filter((animatedLine) =>
        editorState.lines.some(
          (storeLine) =>
            (storeLine.from === animatedLine.from &&
              storeLine.to === animatedLine.to) ||
            (storeLine.from === animatedLine.to &&
              storeLine.to === animatedLine.from)
        )
      )
    );
  }, [editorState.lines]);

  // Animation loop
  useEffect(() => {
    let animationId: number | null = null;

    const animate = () => {
      setAnimatedLines((prevLines) =>
        prevLines.map((line) => {
          if (line.isAnimating && line.animationProgress !== undefined) {
            const newProgress = Math.min(line.animationProgress + 0.05, 1);
            return {
              ...line,
              animationProgress: newProgress,
              isAnimating: newProgress < 1,
            };
          }
          return line;
        })
      );

      animationId = requestAnimationFrame(animate);
    };

    if (animatedLines.some((line) => line.isAnimating)) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animatedLines]);

  // Dessiner sur le canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = editorState.gridSize * 40;
    canvas.width = size;
    canvas.height = size;

    // Effacer le canvas
    ctx.clearRect(0, 0, size, size);

    // Dessiner les lignes existantes du store
    editorState.lines.forEach((line) => {
      const fromPoint = points.find((p) => p.id === line.from);
      const toPoint = points.find((p) => p.id === line.to);

      if (fromPoint && toPoint) {
        // Vérifier si cette ligne est survolée
        const isHovered =
          hoveredLine &&
          ((hoveredLine.from === line.from && hoveredLine.to === line.to) ||
            (hoveredLine.from === line.to && hoveredLine.to === line.from));

        ctx.strokeStyle = isHovered ? "#ef4444" : editorState.foregroundColor; // Rouge si survolée
        ctx.lineWidth = isHovered ? 4 : 2;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(fromPoint.x, fromPoint.y);
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.stroke();
      }
    });

    // Dessiner les lignes animées
    animatedLines.forEach((line) => {
      const fromPoint = points.find((p) => p.id === line.from);
      const toPoint = points.find((p) => p.id === line.to);

      if (fromPoint && toPoint) {
        ctx.strokeStyle = editorState.foregroundColor;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        if (line.isAnimating && line.animationProgress !== undefined) {
          // Animation de la ligne
          const progress = line.animationProgress;
          const dx = toPoint.x - fromPoint.x;
          const dy = toPoint.y - fromPoint.y;
          const endX = fromPoint.x + dx * progress;
          const endY = fromPoint.y + dy * progress;

          ctx.beginPath();
          ctx.moveTo(fromPoint.x, fromPoint.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Effet de particules sur la ligne animée
          if (progress > 0.1) {
            ctx.fillStyle = editorState.foregroundColor;
            ctx.globalAlpha = 0.6;
            for (let i = 0; i < 3; i++) {
              const particleProgress = progress - i * 0.1;
              if (particleProgress > 0) {
                const particleX = fromPoint.x + dx * particleProgress;
                const particleY = fromPoint.y + dy * particleProgress;
                ctx.beginPath();
                ctx.arc(particleX, particleY, 2, 0, 2 * Math.PI);
                ctx.fill();
              }
            }
            ctx.globalAlpha = 1;
          }
        } else {
          // Ligne complète
          ctx.beginPath();
          ctx.moveTo(fromPoint.x, fromPoint.y);
          ctx.lineTo(toPoint.x, toPoint.y);
          ctx.stroke();
        }
      }
    });

    // Dessiner la ligne en cours
    if (isDrawing && currentLine) {
      const fromPoint = points.find((p) => p.id === currentLine.from);
      if (fromPoint) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.globalAlpha = 0.6;

        ctx.beginPath();
        ctx.moveTo(fromPoint.x, fromPoint.y);
        ctx.lineTo(currentLine.to.x, currentLine.to.y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    // Dessiner les points de la grille seulement si la grille est visible
    points.forEach((point) => {
      const isConnected = editorState.lines.some(
        (line) => line.from === point.id || line.to === point.id
      );
      const isHovered = point.isHovered;
      const shouldDraw =
        editorState.showGrid ||
        isConnected ||
        isHovered ||
        (isDrawing && currentLine?.from === point.id);

      if (!shouldDraw) return;

      // Cercle de fond
      ctx.fillStyle = editorState.backgroundColor;
      ctx.strokeStyle = editorState.foregroundColor;
      ctx.lineWidth = 1;

      // Animation de sélection
      let radius = 4;
      if (isConnected) {
        radius = 5;
        ctx.fillStyle = editorState.foregroundColor; // Remplir avec la couleur du motif
        ctx.strokeStyle = editorState.foregroundColor;
        ctx.lineWidth = 2;
      } else if (isHovered) {
        radius = 5;
        ctx.strokeStyle = "#3b82f6"; // Bleu pour le survol
        ctx.lineWidth = 2;
      } else if (editorState.showGrid) {
        // Points de la grille - plus discrets
        radius = 3;
        ctx.strokeStyle = "#d1d5db"; // Gris clair
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
      }

      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1; // Réinitialiser l'alpha

      // Effet de connexion pour le point survolé
      if (isHovered && isDrawing && currentLine) {
        const fromPoint = points.find((p) => p.id === currentLine.from);
        if (fromPoint && fromPoint.id !== point.id) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6;
          ctx.setLineDash([3, 3]);

          ctx.beginPath();
          ctx.moveTo(fromPoint.x, fromPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
      }
    });
  }, [
    editorState.gridSize,
    editorState.foregroundColor,
    editorState.backgroundColor,
    editorState.selectedPoints,
    editorState.lines,
    points,
    animatedLines,
    isDrawing,
    currentLine,
    hoveredLine,
  ]);

  const getPointAtPosition = useCallback(
    (x: number, y: number): Point | null => {
      const threshold = 8;
      return (
        points.find((point) => {
          const distance = Math.sqrt(
            Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
          );
          return distance <= threshold;
        }) || null
      );
    },
    [points]
  );

  const getClosestPoint = useCallback(
    (x: number, y: number): Point | null => {
      if (points.length === 0) return null;

      let closest = points[0];
      let minDistance = Math.sqrt(
        Math.pow(closest.x - x, 2) + Math.pow(closest.y - y, 2)
      );

      points.forEach((point) => {
        const distance = Math.sqrt(
          Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closest = point;
        }
      });

      // Zone de détection plus large pour les points (priorité sur les lignes)
      return minDistance <= 15 ? closest : null;
    },
    [points]
  );

  // Fonction pour vérifier si on clique sur une ligne
  const getLineAtPosition = useCallback(
    (x: number, y: number): Line | null => {
      const tolerance = 5; // Distance de tolérance réduite pour éviter les conflits avec les points

      for (const line of editorState.lines) {
        const fromPoint = points.find((p) => p.id === line.from);
        const toPoint = points.find((p) => p.id === line.to);

        if (fromPoint && toPoint) {
          // Calculer la distance du point à la ligne
          const A = x - fromPoint.x;
          const B = y - fromPoint.y;
          const C = toPoint.x - fromPoint.x;
          const D = toPoint.y - fromPoint.y;

          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          let param = -1;

          if (lenSq !== 0) param = dot / lenSq;

          let xx, yy;

          if (param < 0) {
            xx = fromPoint.x;
            yy = fromPoint.y;
          } else if (param > 1) {
            xx = toPoint.x;
            yy = toPoint.y;
          } else {
            xx = fromPoint.x + param * C;
            yy = fromPoint.y + param * D;
          }

          const dx = x - xx;
          const dy = y - yy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= tolerance) {
            return line;
          }
        }
      }
      return null;
    },
    [editorState.lines, points]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Vérifier le mode d'édition
    if (editorState.editMode === "delete") {
      // Mode suppression - vérifier si on clique sur une ligne
      const clickedLine = getLineAtPosition(x, y);
      if (clickedLine) {
        removeLine(clickedLine);
        setAnimatedLines((prev) =>
          prev.filter(
            (line) =>
              !(
                (line.from === clickedLine.from &&
                  line.to === clickedLine.to) ||
                (line.from === clickedLine.to && line.to === clickedLine.from)
              )
          )
        );
        setHoveredLine(null);
        return;
      }
    } else if (editorState.editMode === "draw") {
      // Mode dessin - PRIORITÉ AUX POINTS sur les lignes

      // D'abord vérifier si on clique sur un point
      const point = getClosestPoint(x, y);
      if (point) {
        // Commencer à dessiner une ligne depuis ce point
        setIsDrawing(true);
        setCurrentLine({
          from: point.id,
          to: { x, y },
          isDrawing: true,
        });

        // Ajouter le point de départ s'il n'est pas déjà dans les points sélectionnés
        if (!editorState.selectedPoints.includes(point.id)) {
          togglePointSelection(point.id);
        }
        return; // IMPORTANT: Sortir ici, ne pas vérifier les lignes
      }

      // Seulement si on n'a pas cliqué sur un point, vérifier les lignes
      const clickedLine = getLineAtPosition(x, y);
      if (clickedLine) {
        // Si on clique sur une ligne, on ne fait rien (pas de suppression accidentelle)
        return;
      }
    }
    // Mode select supprimé car pas nécessaire dans cette nouvelle logique
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing && currentLine && editorState.editMode === "draw") {
      setCurrentLine({
        ...currentLine,
        to: { x, y },
        isDrawing: true,
      });

      // Détection du point le plus proche
      const closestPoint = getClosestPoint(x, y);
      setHoveredPoint(closestPoint);

      // Mise à jour du survol des points
      setPoints((prev) =>
        prev.map((p) => ({
          ...p,
          isHovered: closestPoint?.id === p.id,
        }))
      );
    } else {
      // Survol normal - vérifier d'abord les lignes
      const hoveredLine = getLineAtPosition(x, y);
      setHoveredLine(hoveredLine);

      // Puis vérifier les points
      const hoveredPoint = getPointAtPosition(x, y);
      setPoints((prev) =>
        prev.map((p) => ({
          ...p,
          isHovered: hoveredPoint?.id === p.id,
        }))
      );
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentLine || editorState.editMode !== "draw") return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const endPoint = getClosestPoint(x, y);

    if (endPoint && endPoint.id !== currentLine.from) {
      const newLine: Line = {
        from: currentLine.from,
        to: endPoint.id,
      };

      // Ajouter la ligne au store
      addLine(newLine);

      // Ajouter la ligne animée pour l'effet visuel
      const animatedLine: AnimatedLine = {
        ...newLine,
        isAnimating: true,
        animationProgress: 0,
      };

      setAnimatedLines((prev) => [...prev, animatedLine]);

      // Ajouter automatiquement le point de destination aux points sélectionnés
      if (!editorState.selectedPoints.includes(endPoint.id)) {
        togglePointSelection(endPoint.id);
      }
    }

    setIsDrawing(false);
    setCurrentLine(null);
    setHoveredPoint(null);

    // Réinitialiser le survol
    setPoints((prev) =>
      prev.map((p) => ({
        ...p,
        isHovered: false,
      }))
    );
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    setCurrentLine(null);
    setHoveredPoint(null);
    setHoveredLine(null);

    setPoints((prev) =>
      prev.map((p) => ({
        ...p,
        isHovered: false,
      }))
    );
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        className="border border-slate-300 dark:border-slate-600 rounded-lg cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
