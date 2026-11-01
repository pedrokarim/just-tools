"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { useAtom } from "jotai";
import { POINT_SPACING } from "@/components/pattern-preview";
import {
  addLineAtom,
  patternEditorAtom,
  removeLineAtom,
  type Line,
} from "@/lib/pattern-store";

/** Dessiné au double de sa taille logique, pour rester net une fois agrandi. */
const RENDER_SCALE = 2;
/** Assez large pour viser au doigt sur une grille de 32 points. */
const CLOSEST_POINT_RADIUS = 20;
const HOVER_POINT_RADIUS = 8;
/** La cible d'une ligne, en pixels à l'écran : elle ne rétrécit pas avec le canvas. */
const LINE_TARGET_RADIUS = 8;

interface Point {
  x: number;
  y: number;
  id: string;
}

interface CurrentLine {
  from: string;
  to: { x: number; y: number };
}

function isSameLine(a: Line, b: Line) {
  return (
    (a.from === b.from && a.to === b.to) || (a.from === b.to && a.to === b.from)
  );
}

function distanceBetween(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

export function PointsGrid() {
  const [editorState] = useAtom(patternEditorAtom);
  const [, addLine] = useAtom(addLineAtom);
  const [, removeLine] = useAtom(removeLineAtom);
  const [currentLine, setCurrentLine] = useState<CurrentLine | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [hoveredLine, setHoveredLine] = useState<Line | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { gridSize, lines, editMode, showGrid } = editorState;
  const { foregroundColor, backgroundColor } = editorState;
  const logicalSize = gridSize * POINT_SPACING;

  const points = useMemo(() => {
    const offset = POINT_SPACING / 2;
    const gridPoints: Point[] = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        gridPoints.push({
          x: col * POINT_SPACING + offset,
          y: row * POINT_SPACING + offset,
          id: `${row}-${col}`,
        });
      }
    }
    return gridPoints;
  }, [gridSize]);

  const pointsById = useMemo(
    () => new Map(points.map((point) => [point.id, point])),
    [points]
  );

  // Dessiner sur le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Ce que le canvas ajoute par-dessus le motif vient du système : ce sont des
    // aides à la saisie, pas la donnée de l'outil.
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue("--asc-primary").trim();
    const danger = styles.getPropertyValue("--asc-danger").trim();
    const gridDot = styles.getPropertyValue("--asc-border-strong").trim();

    canvas.width = logicalSize * RENDER_SCALE;
    canvas.height = logicalSize * RENDER_SCALE;
    ctx.scale(RENDER_SCALE, RENDER_SCALE);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, logicalSize, logicalSize);

    // Dessiner les lignes existantes du store
    lines.forEach((line) => {
      const fromPoint = pointsById.get(line.from);
      const toPoint = pointsById.get(line.to);
      if (!fromPoint || !toPoint) return;

      const isTargeted =
        editMode === "delete" &&
        hoveredLine !== null &&
        isSameLine(hoveredLine, line);

      ctx.strokeStyle = isTargeted ? danger : foregroundColor;
      ctx.lineWidth = isTargeted ? 4 : 2;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(fromPoint.x, fromPoint.y);
      ctx.lineTo(toPoint.x, toPoint.y);
      ctx.stroke();
    });

    const drawGuide = (fromX: number, fromY: number, toX: number, toY: number) => {
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.globalAlpha = 0.6;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    };

    // Dessiner la ligne en cours
    const startPoint = currentLine ? pointsById.get(currentLine.from) : undefined;
    if (currentLine && startPoint) {
      drawGuide(startPoint.x, startPoint.y, currentLine.to.x, currentLine.to.y);
    }

    // Dessiner les points de la grille seulement si la grille est visible
    points.forEach((point) => {
      const isConnected = lines.some(
        (line) => line.from === point.id || line.to === point.id
      );
      const isHovered = hoveredPointId === point.id;
      const isStartPoint = currentLine?.from === point.id;

      if (!showGrid && !isConnected && !isHovered && !isStartPoint) return;

      // Cercle de fond
      ctx.fillStyle = backgroundColor;
      ctx.strokeStyle = foregroundColor;
      ctx.lineWidth = 1;

      let radius = 4;
      if (isConnected) {
        radius = 5;
        ctx.fillStyle = foregroundColor; // Remplir avec la couleur du motif
        ctx.lineWidth = 2;
      } else if (isHovered) {
        radius = 5;
        ctx.strokeStyle = primary;
        ctx.lineWidth = 2;
      } else if (showGrid) {
        // Points de la grille : plus discrets
        radius = 3;
        ctx.strokeStyle = gridDot;
        ctx.globalAlpha = 0.6;
      }

      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;

      // La ligne se raccroche au point visé : il montre où elle tombera.
      if (isHovered && startPoint && startPoint.id !== point.id) {
        drawGuide(startPoint.x, startPoint.y, point.x, point.y);
      }
    });
  }, [
    logicalSize,
    foregroundColor,
    backgroundColor,
    lines,
    editMode,
    showGrid,
    points,
    pointsById,
    currentLine,
    hoveredPointId,
    hoveredLine,
  ]);

  const getPointWithin = useCallback(
    (x: number, y: number, radius: number): Point | null => {
      let closest: Point | null = null;
      let minDistance = radius;

      for (const point of points) {
        const distance = distanceBetween(point.x, point.y, x, y);
        if (distance <= minDistance) {
          minDistance = distance;
          closest = point;
        }
      }

      return closest;
    },
    [points]
  );

  // Fonction pour vérifier si on clique sur une ligne
  const getLineAtPosition = useCallback(
    (x: number, y: number, tolerance: number): Line | null => {
      for (const line of lines) {
        const fromPoint = pointsById.get(line.from);
        const toPoint = pointsById.get(line.to);
        if (!fromPoint || !toPoint) continue;

        // Calculer la distance du point au segment
        const A = x - fromPoint.x;
        const B = y - fromPoint.y;
        const C = toPoint.x - fromPoint.x;
        const D = toPoint.y - fromPoint.y;

        const lengthSquared = C * C + D * D;
        const projection =
          lengthSquared !== 0 ? (A * C + B * D) / lengthSquared : -1;
        const clamped = Math.max(0, Math.min(1, projection));

        const distance = distanceBetween(
          x,
          y,
          fromPoint.x + clamped * C,
          fromPoint.y + clamped * D
        );

        if (distance <= tolerance) return line;
      }
      return null;
    },
    [lines, pointsById]
  );

  /**
   * Passe des coordonnées écran à celles du canvas : il est affiché à la taille de
   * la zone de dessin, jamais à la sienne.
   */
  const locate = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = logicalSize / rect.width;
    return {
      x: (event.clientX - rect.left) * ratio,
      y: (event.clientY - rect.top) * ratio,
      lineTolerance: LINE_TARGET_RADIUS * ratio,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const { x, y, lineTolerance } = locate(event);

    if (editMode === "delete") {
      const clickedLine = getLineAtPosition(x, y, lineTolerance);
      if (clickedLine) {
        removeLine(clickedLine);
        setHoveredLine(null);
      }
      return;
    }

    // Mode dessin : un point proche démarre une ligne. Cliquer sur une ligne ne
    // fait rien, pour éviter toute suppression accidentelle.
    const point = getPointWithin(x, y, CLOSEST_POINT_RADIUS);
    if (point) {
      event.currentTarget.setPointerCapture(event.pointerId);
      setCurrentLine({ from: point.id, to: { x, y } });
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const { x, y, lineTolerance } = locate(event);

    if (currentLine) {
      setCurrentLine({ ...currentLine, to: { x, y } });
      setHoveredPointId(getPointWithin(x, y, CLOSEST_POINT_RADIUS)?.id ?? null);
      return;
    }

    setHoveredLine(getLineAtPosition(x, y, lineTolerance));
    setHoveredPointId(getPointWithin(x, y, HOVER_POINT_RADIUS)?.id ?? null);
  };

  const stopDrawing = () => {
    setCurrentLine(null);
    setHoveredPointId(null);
    setHoveredLine(null);
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!currentLine) return;

    const { x, y } = locate(event);
    const endPoint = getPointWithin(x, y, CLOSEST_POINT_RADIUS);

    if (endPoint && endPoint.id !== currentLine.from) {
      addLine({ from: currentLine.from, to: endPoint.id });
    }
    stopDrawing();
  };

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Grille de points, trace une ligne d'un point à un autre"
      className="block size-full cursor-crosshair touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={stopDrawing}
      onPointerLeave={stopDrawing}
    />
  );
}
