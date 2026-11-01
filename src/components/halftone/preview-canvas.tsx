"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useHalftoneStore, useActiveLayerSettings } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import { ShapeResizeOverlay } from "./shape-resize-overlay";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
/** La marge gardée entre le canevas et le bord de la scène. */
const STAGE_PADDING = 32;

const TOOLBAR_ICON = "pointer-coarse:size-11";

interface PreviewCanvasProps {
  isProcessing: boolean;
  /** Les actions de l'atelier, posées dans la barre de la scène. */
  actions?: ReactNode;
}

export const PreviewCanvas = forwardRef<HTMLCanvasElement, PreviewCanvasProps>(
  ({ isProcessing, actions }, ref) => {
    const { sourceImage, previewSize, setPreviewSize } = useHalftoneStore();
    const { settings, updateSettings } = useActiveLayerSettings();
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [fitScale, setFitScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isCanvasHovering, setIsCanvasHovering] = useState(false);

    // Gestion du zoom
    const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, MAX_ZOOM));
    const handleZoomOut = () =>
      setZoom((prev) => Math.max(prev / 1.2, MIN_ZOOM));
    const handleResetView = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    // Gestion du pan
    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
      if (isDragging) {
        setPan({
          x: event.clientX - dragStart.x,
          y: event.clientY - dragStart.y,
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    // Le zoom à la molette exige un écouteur natif : React branche `wheel` en
    // passif, et la page défilerait en même temps que le canevas grossit.
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * delta)));
      };

      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }, [sourceImage]);

    // Ajuster la taille du canvas quand l'image change, sur les deux axes
    useEffect(() => {
      if (sourceImage && containerRef.current) {
        const container = containerRef.current;
        const maxWidth = container.clientWidth - STAGE_PADDING;
        const maxHeight = container.clientHeight - STAGE_PADDING;

        const aspectRatio = sourceImage.width / sourceImage.height;
        const width = Math.min(
          sourceImage.width,
          maxWidth,
          maxHeight * aspectRatio
        );

        setPreviewSize({
          width: Math.round(width),
          height: Math.round(width / aspectRatio),
        });
      }
    }, [sourceImage, setPreviewSize]);

    // Redimensionner le canvas l'effacerait et imposerait un nouveau rendu. Quand
    // la scène rétrécit, c'est donc l'affichage qui s'adapte, pas ses pixels. Le
    // canevas garde sa taille exacte : la poignée de forme se cale dessus, et
    // c'est ce facteur qui remplace un `max-width` en CSS.
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const measure = () => {
        setFitScale(
          Math.min(
            1,
            (container.clientWidth - STAGE_PADDING) / previewSize.width,
            (container.clientHeight - STAGE_PADDING) / previewSize.height
          )
        );
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(container);
      return () => observer.disconnect();
    }, [sourceImage, previewSize.width, previewSize.height]);

    if (!sourceImage) {
      return null;
    }

    const displayScale = zoom * fitScale;

    return (
      <>
        <div className="border-border flex min-w-0 flex-wrap items-center gap-2 border-b p-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {actions}
          </div>

          <div
            role="group"
            aria-label="Zoom"
            className="ms-auto flex shrink-0 items-center gap-0.5"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom arrière"
              title="Zoom arrière"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className={TOOLBAR_ICON}
            >
              <ZoomOut aria-hidden="true" />
            </Button>
            <span className="text-fg-muted w-13 text-center font-mono text-xs tabular-nums">
              {Math.round(zoom * 100)}&nbsp;%
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom avant"
              title="Zoom avant"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className={TOOLBAR_ICON}
            >
              <ZoomIn aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Recentrer la vue"
              title="Recentrer la vue"
              onClick={handleResetView}
              className={TOOLBAR_ICON}
            >
              <RotateCcw aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="bg-surface relative flex h-[min(60dvh,34rem)] min-w-0 items-center justify-center overflow-hidden select-none xl:h-auto xl:min-h-0 xl:flex-1"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            // Zoomé, le doigt déplace le canevas ; sinon il fait défiler la page.
            touchAction: zoom > 1 ? "none" : "auto",
          }}
        >
          <div
            className="shrink-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${displayScale})`,
              transformOrigin: "center center",
            }}
          >
            <div
              className="relative inline-block align-top"
              onMouseEnter={() => setIsCanvasHovering(true)}
              onMouseLeave={() => setIsCanvasHovering(false)}
            >
              <canvas
                ref={ref}
                width={previewSize.width}
                height={previewSize.height}
                className="block max-w-none rounded-xs"
              />
              {settings.globalShape !== "custom" && (
                <ShapeResizeOverlay
                  canvasWidth={previewSize.width}
                  canvasHeight={previewSize.height}
                  settings={settings}
                  zoom={displayScale}
                  isHovering={isCanvasHovering}
                  onScaleChange={(scale) =>
                    updateSettings({ globalShapeScale: scale })
                  }
                  onPositionChange={(pos) =>
                    updateSettings({ effectPosition: pos })
                  }
                />
              )}
            </div>
          </div>

          <div className="bg-elevated border-border text-fg-muted pointer-events-none absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-2 rounded-sm border px-2 py-1 text-xs tabular-nums">
            {isProcessing && (
              <>
                <Loader2
                  size={14}
                  className="asc-animate-spin shrink-0"
                  aria-hidden="true"
                />
                <span>Traitement…</span>
              </>
            )}
            <span className="whitespace-nowrap">
              {previewSize.width}&nbsp;×&nbsp;{previewSize.height}&nbsp;px
            </span>
          </div>
        </div>
      </>
    );
  }
);

PreviewCanvas.displayName = "PreviewCanvas";
