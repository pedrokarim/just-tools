"use client";

import { useState, useRef, useCallback } from "react";
import type { HalftoneSettings } from "@/lib/halftone-store";

interface ShapeResizeOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  settings: HalftoneSettings;
  zoom: number;
  isHovering: boolean;
  onScaleChange: (scale: number) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface DragState {
  type: "move" | "resize";
  handle?: HandleId;
  startX: number;
  startY: number;
  initialScale: number;
  initialPosition: { x: number; y: number };
}

const HANDLE_CURSORS: Record<HandleId, string> = {
  nw: "nwse-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  e: "ew-resize",
  se: "nwse-resize",
  s: "ns-resize",
  sw: "nesw-resize",
  w: "ew-resize",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function ShapeResizeOverlay({
  canvasWidth,
  canvasHeight,
  settings,
  zoom,
  isHovering,
  onScaleChange,
  onPositionChange,
}: ShapeResizeOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const scale = settings.globalShapeScale ?? 1.0;
  const cx = (settings.effectPosition.x / 100) * canvasWidth;
  const cy = (settings.effectPosition.y / 100) * canvasHeight;
  const halfW = (canvasWidth / 2) * scale;
  const halfH = (canvasHeight / 2) * scale;

  const left = cx - halfW;
  const top = cy - halfH;
  const boxW = halfW * 2;
  const boxH = halfH * 2;

  // Taille des handles compensée par le zoom
  const handleSize = 8 / zoom;
  const strokeWidth = 1 / zoom;
  const dashArray = `${4 / zoom} ${4 / zoom}`;

  const handles: { id: HandleId; x: number; y: number }[] = [
    { id: "nw", x: left, y: top },
    { id: "n", x: cx, y: top },
    { id: "ne", x: left + boxW, y: top },
    { id: "e", x: left + boxW, y: cy },
    { id: "se", x: left + boxW, y: top + boxH },
    { id: "s", x: cx, y: top + boxH },
    { id: "sw", x: left, y: top + boxH },
    { id: "w", x: left, y: cy },
  ];

  // Convertir coordonnées écran → canvas
  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * canvasWidth,
        y: ((clientY - rect.top) / rect.height) * canvasHeight,
      };
    },
    [canvasWidth, canvasHeight]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, type: "move" | "resize", handle?: HandleId) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);

      const pos = screenToCanvas(e.clientX, e.clientY);
      setDrag({
        type,
        handle,
        startX: pos.x,
        startY: pos.y,
        initialScale: scale,
        initialPosition: { ...settings.effectPosition },
      });
    },
    [screenToCanvas, scale, settings.effectPosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      e.stopPropagation();

      const pos = screenToCanvas(e.clientX, e.clientY);

      if (drag.type === "move") {
        const dx = pos.x - drag.startX;
        const dy = pos.y - drag.startY;
        onPositionChange({
          x: clamp(
            drag.initialPosition.x + (dx / canvasWidth) * 100,
            -100,
            200
          ),
          y: clamp(
            drag.initialPosition.y + (dy / canvasHeight) * 100,
            -100,
            200
          ),
        });
      } else if (drag.type === "resize" && drag.handle) {
        const centerX = (drag.initialPosition.x / 100) * canvasWidth;
        const centerY = (drag.initialPosition.y / 100) * canvasHeight;

        const distX = Math.abs(pos.x - centerX);
        const distY = Math.abs(pos.y - centerY);

        let newScale: number;
        if (drag.handle === "e" || drag.handle === "w") {
          newScale = distX / (canvasWidth / 2);
        } else if (drag.handle === "n" || drag.handle === "s") {
          newScale = distY / (canvasHeight / 2);
        } else {
          // Coins : prendre le max des deux axes
          newScale = Math.max(
            distX / (canvasWidth / 2),
            distY / (canvasHeight / 2)
          );
        }

        onScaleChange(clamp(newScale, 0.1, 3.0));
      }
    },
    [
      drag,
      screenToCanvas,
      canvasWidth,
      canvasHeight,
      onScaleChange,
      onPositionChange,
    ]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (drag) {
        (e.target as Element).releasePointerCapture(e.pointerId);
        setDrag(null);
      }
    },
    [drag]
  );

  const visible = isHovering || drag !== null;

  if (settings.globalShape === "custom") return null;

  return (
      <svg
        ref={svgRef}
        width={canvasWidth}
        height={canvasHeight}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      >
        {visible && (
          <g>
            {/* Bounding box pointillé */}
            <rect
              x={left}
              y={top}
              width={boxW}
              height={boxH}
              fill="none"
              stroke="rgba(59, 130, 246, 0.7)"
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
            />

            {/* Zone de move (intérieur du bounding box) */}
            <rect
              x={left}
              y={top}
              width={boxW}
              height={boxH}
              fill="transparent"
              style={{ pointerEvents: "all", cursor: "move" }}
              onPointerDown={(e) => handlePointerDown(e, "move")}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />

            {/* Handles de resize */}
            {handles.map((h) => (
              <rect
                key={h.id}
                x={h.x - handleSize / 2}
                y={h.y - handleSize / 2}
                width={handleSize}
                height={handleSize}
                fill="white"
                stroke="rgba(59, 130, 246, 0.9)"
                strokeWidth={strokeWidth}
                rx={1 / zoom}
                style={{
                  pointerEvents: "all",
                  cursor: HANDLE_CURSORS[h.id],
                }}
                onPointerDown={(e) => handlePointerDown(e, "resize", h.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
            ))}
          </g>
        )}
      </svg>
  );
}
