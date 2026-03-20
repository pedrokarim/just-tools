"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useHalftoneStore, type HalftoneLayer } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Plus,
  Copy,
  Trash2,
  Circle,
  Square,
  Diamond,
  Hexagon,
  Minus,
  Layers,
} from "lucide-react";

const BLEND_MODES: { value: GlobalCompositeOperation; label: string }[] = [
  { value: "source-over", label: "Normal" },
  { value: "multiply", label: "Multiplier" },
  { value: "screen", label: "Écran" },
  { value: "overlay", label: "Incrustation" },
  { value: "darken", label: "Obscurcir" },
  { value: "lighten", label: "Éclaircir" },
  { value: "color-dodge", label: "Densité -" },
  { value: "color-burn", label: "Densité +" },
  { value: "hard-light", label: "Lumière crue" },
  { value: "soft-light", label: "Lumière tamisée" },
  { value: "difference", label: "Différence" },
  { value: "exclusion", label: "Exclusion" },
];

const SHAPE_ICONS: Record<string, typeof Circle> = {
  circle: Circle,
  square: Square,
  diamond: Diamond,
  hexagon: Hexagon,
  line: Minus,
};

// --- Composant d'un calque dans la liste (sortable) ---

function SortableLayerItem({
  layer,
  isActive,
}: {
  layer: HalftoneLayer;
  isActive: boolean;
}) {
  const {
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    renameLayer,
    duplicateLayer,
    deleteLayer,
    layers,
  } = useHalftoneStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id, disabled: layer.locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDoubleClick = useCallback(() => {
    if (layer.locked) return;
    setEditName(layer.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [layer.name, layer.locked]);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== layer.name) {
      renameLayer(layer.id, trimmed);
    }
    setIsEditing(false);
  }, [editName, layer.id, layer.name, renameLayer]);

  const ShapeIcon = SHAPE_ICONS[layer.settings.shape] ?? Circle;
  const canDelete = layers.length > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={`
            group flex items-center gap-1.5 px-2 py-1.5 cursor-pointer select-none
            border-b border-border/40 transition-colors
            ${isActive ? "bg-blue-500/10 dark:bg-blue-500/20 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent hover:bg-muted/50"}
            ${isDragging ? "opacity-50 z-50" : ""}
            ${!layer.visible ? "opacity-50" : ""}
          `}
          onClick={() => selectLayer(layer.id)}
        >
          {/* Drag handle */}
          <button
            className="touch-none text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {/* Icône forme */}
          <div
            className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
            style={{
              backgroundColor: layer.settings.couleurs[0] + "20",
            }}
          >
            <ShapeIcon
              className="h-3.5 w-3.5"
              style={{ color: layer.settings.couleurs[0] }}
            />
          </div>

          {/* Nom */}
          <div className="flex-1 min-w-0" onDoubleClick={handleDoubleClick}>
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="h-5 px-1 py-0 text-xs border-blue-500"
                autoFocus
              />
            ) : (
              <span className="text-xs truncate block">
                {layer.name}
              </span>
            )}
          </div>

          {/* Boutons visibilité & verrouillage */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerLock(layer.id);
              }}
            >
              {layer.locked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
            </button>
          </div>

          <button
            className={`p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground ${
              !layer.visible
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } transition-opacity`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLayerVisibility(layer.id);
            }}
          >
            {layer.visible ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </button>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => duplicateLayer(layer.id)}>
          <Copy className="h-3.5 w-3.5 mr-2" />
          Dupliquer
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => canDelete && deleteLayer(layer.id)}
          disabled={!canDelete}
          className={!canDelete ? "opacity-50" : "text-destructive"}
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Supprimer
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => toggleLayerVisibility(layer.id)}
        >
          {layer.visible ? (
            <EyeOff className="h-3.5 w-3.5 mr-2" />
          ) : (
            <Eye className="h-3.5 w-3.5 mr-2" />
          )}
          {layer.visible ? "Masquer" : "Afficher"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => toggleLayerLock(layer.id)}>
          {layer.locked ? (
            <Unlock className="h-3.5 w-3.5 mr-2" />
          ) : (
            <Lock className="h-3.5 w-3.5 mr-2" />
          )}
          {layer.locked ? "Déverrouiller" : "Verrouiller"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// --- Panneau de calques principal ---

export function LayerPanel() {
  const {
    layers,
    activeLayerId,
    addLayer,
    reorderLayers,
    setLayerOpacity,
    setLayerBlendMode,
  } = useHalftoneStore();

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderLayers(oldIndex, newIndex);
      }
    },
    [layers, reorderLayers]
  );

  // Liste inversée pour afficher les calques du haut (dernier) vers le bas (premier), comme Figma
  const reversedLayers = [...layers].reverse();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Calques</span>
          <span className="text-xs text-muted-foreground">
            ({layers.length})
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={addLayer}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Barre opacité / blend mode du calque actif */}
      {activeLayer && (
        <div className="px-3 py-2 border-b space-y-2">
          {/* Blend mode */}
          <div className="flex items-center gap-2">
            <select
              className="flex-1 h-7 text-xs bg-muted/50 border border-border rounded px-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
              value={activeLayer.blendMode}
              onChange={(e) =>
                setLayerBlendMode(
                  activeLayer.id,
                  e.target.value as GlobalCompositeOperation
                )
              }
            >
              {BLEND_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 min-w-[60px]">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {Math.round(activeLayer.opacity * 100)}%
              </span>
            </div>
          </div>
          {/* Opacity slider */}
          <Slider
            value={[activeLayer.opacity * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) =>
              setLayerOpacity(activeLayer.id, v / 100)
            }
            className="w-full"
          />
        </div>
      )}

      {/* Liste des calques */}
      <ScrollArea className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={reversedLayers.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence initial={false}>
              {reversedLayers.map((layer) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <SortableLayerItem
                    layer={layer}
                    isActive={layer.id === activeLayerId}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
}
