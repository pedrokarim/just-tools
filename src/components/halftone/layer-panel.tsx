"use client";

import { useCallback, useRef, useState } from "react";
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
import {
  Circle,
  CopyPlus,
  Diamond,
  Eye,
  EyeOff,
  GripVertical,
  Hexagon,
  Lock,
  Minus,
  Pencil,
  Plus,
  Square,
  Trash2,
  Unlock,
} from "lucide-react";
import { useHalftoneStore, type HalftoneLayer } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SelectField, SliderField } from "./panel-parts";

const BLEND_MODES: readonly {
  value: GlobalCompositeOperation;
  label: string;
}[] = [
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

const ROW_BUTTON =
  "text-fg-subtle hover:text-fg flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xs pointer-coarse:size-11";

/** Le champ de renommage, monté le temps de la saisie. */
function LayerNameInput({
  name,
  onSubmit,
  onCancel,
}: {
  name: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(name);
  // Échap retire le champ, ce qui le fait perdre le focus : ce blur n'est pas
  // une validation.
  const cancelled = useRef(false);

  return (
    <Input
      autoFocus
      aria-label="Nom du calque"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={(event) => event.target.select()}
      onBlur={() => {
        if (!cancelled.current) onSubmit(draft);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSubmit(draft);
        if (event.key === "Escape") {
          cancelled.current = true;
          onCancel();
        }
      }}
      className="h-8 min-w-0 flex-1 px-2 text-[0.8125rem] pointer-coarse:h-11"
    />
  );
}

// --- Composant d'un calque dans la liste (sortable) ---

function SortableLayerItem({
  layer,
  isActive,
  isRenaming,
  onStartRename,
  onStopRename,
}: {
  layer: HalftoneLayer;
  isActive: boolean;
  isRenaming: boolean;
  onStartRename: () => void;
  onStopRename: () => void;
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

  const handleRenameSubmit = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (trimmed && trimmed !== layer.name) {
        renameLayer(layer.id, trimmed);
      }
      onStopRename();
    },
    [layer.id, layer.name, renameLayer, onStopRename]
  );

  const ShapeIcon = SHAPE_ICONS[layer.settings.shape] ?? Circle;
  const canDelete = layers.length > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            "rounded-field flex min-h-10 min-w-0 items-center gap-0.5 px-1",
            isActive
              ? "bg-primary-soft text-primary-soft-fg"
              : "text-fg hover:bg-surface",
            isDragging && "relative z-10 opacity-50"
          )}
        >
          <button
            type="button"
            className={cn(ROW_BUTTON, "cursor-grab touch-none active:cursor-grabbing")}
            {...attributes}
            {...listeners}
            aria-label={`Déplacer ${layer.name}`}
          >
            <GripVertical size={14} aria-hidden="true" />
          </button>

          {isRenaming ? (
            <LayerNameInput
              name={layer.name}
              onSubmit={handleRenameSubmit}
              onCancel={onStopRename}
            />
          ) : (
            <button
              type="button"
              title={layer.name}
              aria-current={isActive ? "true" : undefined}
              onClick={() => selectLayer(layer.id)}
              onDoubleClick={() => {
                if (!layer.locked) onStartRename();
              }}
              className={cn(
                "flex min-h-8 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xs text-left",
                !layer.visible && "opacity-50"
              )}
            >
              <ShapeIcon size={14} className="shrink-0" aria-hidden="true" />
              {/* La couleur du calque : une donnée, affichée telle quelle. */}
              <span
                aria-hidden="true"
                className="border-border-strong size-3.5 shrink-0 rounded-xs border"
                style={{ backgroundColor: layer.settings.couleurs[0] }}
              />
              <span className="min-w-0 truncate text-[0.8125rem]">
                {layer.name}
              </span>
            </button>
          )}

          <button
            type="button"
            className={ROW_BUTTON}
            aria-label={
              layer.locked
                ? `Déverrouiller ${layer.name}`
                : `Verrouiller ${layer.name}`
            }
            aria-pressed={layer.locked}
            title={layer.locked ? "Déverrouiller" : "Verrouiller"}
            onClick={() => toggleLayerLock(layer.id)}
          >
            {layer.locked ? (
              <Lock size={14} aria-hidden="true" />
            ) : (
              <Unlock size={14} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className={ROW_BUTTON}
            aria-label={
              layer.visible ? `Masquer ${layer.name}` : `Afficher ${layer.name}`
            }
            aria-pressed={!layer.visible}
            title={layer.visible ? "Masquer" : "Afficher"}
            onClick={() => toggleLayerVisibility(layer.id)}
          >
            {layer.visible ? (
              <Eye size={14} aria-hidden="true" />
            ) : (
              <EyeOff size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </ContextMenuTrigger>

      {/* Après « Renommer », le focus doit rester dans le champ, pas revenir ici. */}
      <ContextMenuContent
        onCloseAutoFocus={(event) => {
          if (isRenaming) event.preventDefault();
        }}
      >
        <ContextMenuItem disabled={layer.locked} onClick={onStartRename}>
          <Pencil aria-hidden="true" />
          Renommer
        </ContextMenuItem>
        <ContextMenuItem onClick={() => duplicateLayer(layer.id)}>
          <CopyPlus aria-hidden="true" />
          Dupliquer
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          disabled={!canDelete}
          onClick={() => canDelete && deleteLayer(layer.id)}
        >
          <Trash2 aria-hidden="true" />
          Supprimer
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => toggleLayerVisibility(layer.id)}>
          {layer.visible ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
          {layer.visible ? "Masquer" : "Afficher"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => toggleLayerLock(layer.id)}>
          {layer.locked ? (
            <Unlock aria-hidden="true" />
          ) : (
            <Lock aria-hidden="true" />
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
    duplicateLayer,
    deleteLayer,
    reorderLayers,
    setLayerOpacity,
    setLayerBlendMode,
  } = useHalftoneStore();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const stopRename = useCallback(() => setRenamingId(null), []);

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
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-fg-muted min-w-0 text-sm tabular-nums">
            {layers.length}&nbsp;{layers.length > 1 ? "calques" : "calque"}
          </p>
          <Button variant="secondary" size="sm" onClick={addLayer}>
            <Plus aria-hidden="true" />
            Ajouter
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={reversedLayers.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              {reversedLayers.map((layer) => (
                <SortableLayerItem
                  key={layer.id}
                  layer={layer}
                  isActive={layer.id === activeLayerId}
                  isRenaming={layer.id === renamingId}
                  onStartRename={() => setRenamingId(layer.id)}
                  onStopRename={stopRename}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {activeLayer && (
        <div className="border-border flex min-w-0 flex-col gap-4 border-t pt-4">
          <SelectField
            label="Mode de fusion"
            value={activeLayer.blendMode}
            options={BLEND_MODES}
            onChange={(blendMode) =>
              setLayerBlendMode(activeLayer.id, blendMode)
            }
          />
          <SliderField
            label="Opacité du calque"
            unit="%"
            displayFactor={100}
            value={activeLayer.opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(opacity) => setLayerOpacity(activeLayer.id, opacity)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={activeLayer.locked}
              onClick={() => setRenamingId(activeLayer.id)}
            >
              <Pencil aria-hidden="true" />
              Renommer
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => duplicateLayer(activeLayer.id)}
            >
              <CopyPlus aria-hidden="true" />
              Dupliquer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={layers.length <= 1}
              onClick={() => deleteLayer(activeLayer.id)}
              className="text-danger hover:text-danger"
            >
              <Trash2 aria-hidden="true" />
              Supprimer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
