"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import { useAtom } from "jotai";
import {
  Circle,
  Download,
  Eraser,
  Eye,
  FilePlus,
  Grid,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Redo2,
  RotateCcw,
  Save,
  Settings,
  Square,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { PatternPreview, renderPattern } from "@/components/pattern-preview";
import { PointsGrid } from "@/components/points-grid";
import { PreviewModal } from "@/components/preview-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  clearGridAtom,
  deletePatternAtom,
  loadPatternAtom,
  patternEditorAtom,
  redoAtom,
  resetConfigurationAtom,
  savedPatternsAtom,
  savePatternAtom,
  selectedPatternAtom,
  setEditModeAtom,
  setGridModeAtom,
  setGridSizeAtom,
  toggleCellWithHistoryAtom,
  undoAtom,
  updatePatternAtom,
  type GridMode,
  type Pattern,
} from "@/lib/pattern-store";
import { cn } from "@/lib/utils";

/** La clé de `patternEditorAtom` : son absence signale une toute première visite. */
const EDITOR_STORAGE_KEY = "just-tools-editor-state";
const EXPORT_REPEAT_COUNT = 8;
const EXAMPLE_GRID_SIZE = 16;
const EXAMPLE_TILE_SIZE = 8;
const EXAMPLE_BACKGROUND = "#fff7ed";
const EXAMPLE_FOREGROUND = "#c2410c";

const GRID_MODES = [
  { value: "pixel", label: "Pixels", icon: Square },
  { value: "points", label: "Points", icon: Circle },
] as const;

/** Un treillis de losanges, qui montre d'emblée ce que donne un motif répété. */
function buildExampleCells() {
  const center = (EXAMPLE_TILE_SIZE - 1) / 2;
  return Array.from({ length: EXAMPLE_GRID_SIZE }, (_, row) =>
    Array.from({ length: EXAMPLE_GRID_SIZE }, (_, col) => {
      const distance =
        Math.abs((row % EXAMPLE_TILE_SIZE) - center) +
        Math.abs((col % EXAMPLE_TILE_SIZE) - center);
      return distance === 3 || distance === 7;
    })
  );
}

/** La grille de pixels, dessinée à la souris comme au doigt. */
function PixelGrid() {
  const [editorState] = useAtom(patternEditorAtom);
  const [, toggleCell] = useAtom(toggleCellWithHistoryAtom);
  // Un tracé garde la valeur de sa première cellule : repasser sur une cellule
  // ne l'inverse pas, et le tracé ne produit pas de damier.
  const stroke = useRef<{ value: boolean; lastCell: string } | null>(null);

  const { cells, backgroundColor, foregroundColor, showGrid, editMode } =
    editorState;
  const size = cells.length;
  const tracks = `repeat(${size}, minmax(0, 1fr))`;

  const locateCell = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * size);
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * size);
    return row >= 0 && row < size && col >= 0 && col < size
      ? { row, col, id: `${row}-${col}` }
      : null;
  };

  const paint = (row: number, col: number, value: boolean) => {
    if (cells[row]?.[col] !== value) toggleCell(row, col);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const cell = locateCell(event);
    if (!cell || event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const value = editMode === "delete" ? false : !cells[cell.row]?.[cell.col];
    stroke.current = { value, lastCell: cell.id };
    paint(cell.row, cell.col, value);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!stroke.current) return;
    const cell = locateCell(event);
    if (!cell || cell.id === stroke.current.lastCell) return;

    stroke.current.lastCell = cell.id;
    paint(cell.row, cell.col, stroke.current.value);
  };

  const endStroke = () => {
    stroke.current = null;
  };

  return (
    <div
      role="img"
      aria-label="Grille de pixels du motif"
      className="grid size-full cursor-crosshair touch-none select-none"
      style={{ gridTemplateColumns: tracks, gridTemplateRows: tracks }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
    >
      {cells.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(showGrid && "border-border-strong/50 border-e border-b")}
            style={{
              backgroundColor: cell ? foregroundColor : backgroundColor,
            }}
          />
        ))
      )}
    </div>
  );
}

export default function PatternEditor() {
  const [editorState, setEditorState] = useAtom(patternEditorAtom);
  const [savedPatterns] = useAtom(savedPatternsAtom);
  const [selectedPattern, setSelectedPattern] = useAtom(selectedPatternAtom);
  const [, setGridSize] = useAtom(setGridSizeAtom);
  const [, clearGrid] = useAtom(clearGridAtom);
  const [, savePattern] = useAtom(savePatternAtom);
  const [, loadPattern] = useAtom(loadPatternAtom);
  const [, deletePattern] = useAtom(deletePatternAtom);
  const [, updatePattern] = useAtom(updatePatternAtom);
  const [, undo] = useAtom(undoAtom);
  const [, redo] = useAtom(redoAtom);
  const [, setGridMode] = useAtom(setGridModeAtom);
  const [, setEditMode] = useAtom(setEditModeAtom);
  const [, resetConfiguration] = useAtom(resetConfigurationAtom);

  const [patternName, setPatternName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPanel, setShowPanel] = useState(true);

  // À la toute première visite, l'éditeur s'ouvre sur un motif plutôt que sur une
  // grille blanche. Un visiteur qui a déjà un état enregistré n'est pas touché.
  useEffect(() => {
    try {
      if (localStorage.getItem(EDITOR_STORAGE_KEY) !== null) return;
    } catch {
      return;
    }

    const cells = buildExampleCells();
    setEditorState((prev) => ({
      ...prev,
      cells,
      backgroundColor: EXAMPLE_BACKGROUND,
      foregroundColor: EXAMPLE_FOREGROUND,
      history: [{ cells, selectedPoints: [], lines: [] }],
      historyIndex: 0,
    }));
  }, [setEditorState]);

  const handleModeChange = (mode: GridMode) => {
    if (mode === editorState.gridMode) return;
    setGridMode(mode);
    toast.info(
      mode === "pixel"
        ? "Grille en pixels : dessin et historique remis à zéro."
        : "Grille en points : dessin et historique remis à zéro."
    );
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();

    if (selectedPattern) {
      updatePattern(selectedPattern.id);
      toast.success("Motif mis à jour.");
    } else {
      const name = patternName.trim();
      if (!name) {
        toast.error("Donne un nom à ton motif pour le sauvegarder.");
        return;
      }
      savePattern(name);
      toast.success("Motif sauvegardé.");
    }

    setPatternName("");
    setShowSaveDialog(false);
    setSelectedPattern(null);
  };

  const closeSaveDialog = () => {
    setShowSaveDialog(false);
    setPatternName("");
  };

  const handleDelete = (patternId: string) => {
    deletePattern(patternId);
    if (selectedPattern?.id === patternId) {
      setSelectedPattern(null);
    }
  };

  // Le motif repart de zéro : il ne doit plus écraser celui qui était chargé.
  const handleNew = () => {
    clearGrid();
    setSelectedPattern(null);
  };

  const handleReset = () => {
    resetConfiguration();
    setSelectedPattern(null);
  };

  const handleExport = () => {
    try {
      const canvas = document.createElement("canvas");
      renderPattern(canvas, editorState, EXPORT_REPEAT_COUNT);

      const link = document.createElement("a");
      link.download = `pattern-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success("Motif exporté.");
    } catch {
      toast.error("L'export a échoué. Réessaie avec une grille plus petite.");
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="border-border flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b px-3 py-2 lg:px-4">
        <div role="group" aria-label="Historique" className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Annuler"
            title="Annuler"
            onClick={() => undo()}
            disabled={editorState.historyIndex === 0}
          >
            <Undo2 aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Rétablir"
            title="Rétablir"
            onClick={() => redo()}
            disabled={
              editorState.historyIndex === editorState.history.length - 1
            }
          >
            <Redo2 aria-hidden="true" />
          </Button>
        </div>

        <div role="group" aria-label="Outil" className="flex items-center gap-1">
          <Button
            variant={editorState.editMode === "draw" ? "soft" : "ghost"}
            size="sm"
            aria-pressed={editorState.editMode === "draw"}
            onClick={() => setEditMode("draw")}
          >
            <Pencil aria-hidden="true" />
            <span className="max-sm:sr-only">Dessiner</span>
          </Button>
          <Button
            variant={editorState.editMode === "delete" ? "soft" : "ghost"}
            size="sm"
            aria-pressed={editorState.editMode === "delete"}
            onClick={() => setEditMode("delete")}
          >
            <Eraser aria-hidden="true" />
            <span className="max-sm:sr-only">Supprimer</span>
          </Button>
          <Button
            variant={editorState.showGrid ? "soft" : "ghost"}
            size="sm"
            aria-pressed={editorState.showGrid}
            onClick={() =>
              setEditorState((prev) => ({ ...prev, showGrid: !prev.showGrid }))
            }
          >
            <Grid aria-hidden="true" />
            <span className="max-sm:sr-only">Grille</span>
          </Button>
        </div>

        <div className="ms-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
          >
            <Eye aria-hidden="true" />
            <span className="max-sm:sr-only">Aperçu</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download aria-hidden="true" />
            <span className="max-sm:sr-only">Exporter</span>
          </Button>
          <Button size="sm" onClick={() => setShowSaveDialog(true)}>
            <Save aria-hidden="true" />
            <span className="max-sm:sr-only">Sauvegarder</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Plus d'actions"
                title="Plus d'actions"
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => clearGrid()}>
                <RotateCcw aria-hidden="true" />
                Effacer le dessin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNew}>
                <FilePlus aria-hidden="true" />
                Nouveau motif
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReset}>
                <Settings aria-hidden="true" />
                Réinitialiser la configuration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-expanded={showPanel}
            aria-label={showPanel ? "Masquer le panneau" : "Afficher le panneau"}
            title={showPanel ? "Masquer le panneau" : "Afficher le panneau"}
            onClick={() => setShowPanel(!showPanel)}
          >
            {showPanel ? (
              <PanelRightClose aria-hidden="true" />
            ) : (
              <PanelRightOpen aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <div className="bg-surface relative min-h-0 min-w-0 flex-1">
          {/* Un conteneur de taille : le carré de dessin prend le plus petit des
              deux axes, et tient donc dans la zone quelle que soit sa forme. */}
          <div className="absolute inset-3 flex items-center justify-center [container-type:size] lg:inset-6">
            <div className="border-border rounded-field size-[min(100cqw,100cqh)] max-h-[44rem] max-w-[44rem] overflow-hidden border">
              {editorState.gridMode === "pixel" ? <PixelGrid /> : <PointsGrid />}
            </div>
          </div>
        </div>

        {showPanel && (
          <aside
            aria-label="Réglages du motif"
            className="border-border divide-border flex max-h-[38dvh] min-w-0 shrink-0 flex-col divide-y overflow-y-auto border-t lg:max-h-none lg:w-80 lg:border-s lg:border-t-0"
          >
            <section
              aria-labelledby="pattern-preview-title"
              className="flex flex-col gap-2 p-4"
            >
              <h2
                id="pattern-preview-title"
                className="text-fg text-sm font-medium"
              >
                Aperçu répété
              </h2>
              <button
                type="button"
                aria-label="Agrandir l'aperçu"
                title="Agrandir l'aperçu"
                onClick={() => setShowPreviewModal(true)}
                className="border-border hover:border-border-strong rounded-field block w-full cursor-zoom-in overflow-hidden border transition-colors duration-(--animate-duration-fast) max-lg:max-w-32"
              >
                <PatternPreview />
              </button>
            </section>

            <section aria-label="Réglages" className="flex flex-col gap-5 p-4">
              <div className="flex flex-col gap-2">
                <span id="grid-mode-label" className="text-fg text-sm font-medium">
                  Type de grille
                </span>
                <div
                  role="group"
                  aria-labelledby="grid-mode-label"
                  className="grid grid-cols-2 gap-2"
                >
                  {GRID_MODES.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={
                        editorState.gridMode === value ? "soft" : "outline"
                      }
                      aria-pressed={editorState.gridMode === value}
                      onClick={() => handleModeChange(value)}
                    >
                      <Icon aria-hidden="true" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor="grid-size">Taille</Label>
                  <span className="text-fg font-mono text-sm tabular-nums">
                    {editorState.gridSize}×{editorState.gridSize}
                  </span>
                </div>
                <Slider
                  id="grid-size"
                  aria-label="Taille de la grille"
                  min={8}
                  max={32}
                  step={4}
                  value={[editorState.gridSize]}
                  onValueChange={([value]) => setGridSize(value)}
                />
                <p className="text-fg-muted text-[0.8125rem] leading-snug">
                  Changer de grille ou de taille efface le dessin.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <Label htmlFor="bg-color">Arrière-plan</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={editorState.backgroundColor}
                    onChange={(event) =>
                      setEditorState((prev) => ({
                        ...prev,
                        backgroundColor: event.target.value,
                      }))
                    }
                    className="cursor-pointer p-1"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <Label htmlFor="fg-color">Motif</Label>
                  <Input
                    id="fg-color"
                    type="color"
                    value={editorState.foregroundColor}
                    onChange={(event) =>
                      setEditorState((prev) => ({
                        ...prev,
                        foregroundColor: event.target.value,
                      }))
                    }
                    className="cursor-pointer p-1"
                  />
                </div>
              </div>
            </section>

            <section
              aria-labelledby="saved-patterns-title"
              className="flex min-w-0 flex-col gap-2 p-4"
            >
              <h2
                id="saved-patterns-title"
                className="text-fg text-sm font-medium"
              >
                Motifs sauvegardés
              </h2>
              {savedPatterns.length === 0 ? (
                <p className="text-fg-muted text-[0.8125rem] leading-snug">
                  Aucun motif pour l&apos;instant. Sauvegarde celui-ci pour le
                  retrouver ici.
                </p>
              ) : (
                <ul className="flex min-w-0 flex-col gap-1">
                  {savedPatterns.map((pattern: Pattern) => {
                    const selected = selectedPattern?.id === pattern.id;
                    return (
                      <li key={pattern.id} className="flex min-w-0 items-center gap-1">
                        <button
                          type="button"
                          aria-current={selected ? "true" : undefined}
                          onClick={() => loadPattern(pattern)}
                          className={cn(
                            "rounded-field flex min-h-11 min-w-0 flex-1 cursor-pointer flex-col justify-center px-2.5 py-1.5 text-start transition-colors duration-(--animate-duration-fast)",
                            selected
                              ? "bg-primary-soft text-primary-soft-fg"
                              : "text-fg hover:bg-surface"
                          )}
                        >
                          <span
                            className="truncate text-sm font-medium"
                            title={pattern.name}
                          >
                            {pattern.name}
                          </span>
                          <span
                            className={cn(
                              "truncate text-xs",
                              !selected && "text-fg-subtle"
                            )}
                          >
                            {pattern.gridSize}×{pattern.gridSize},{" "}
                            {pattern.gridMode === "pixel" ? "pixels" : "points"},{" "}
                            {new Date(pattern.updatedAt).toLocaleDateString("fr-FR")}
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Supprimer ${pattern.name}`}
                          title="Supprimer"
                          onClick={() => handleDelete(pattern.id)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </aside>
        )}
      </div>

      <Dialog
        open={showSaveDialog}
        onOpenChange={(open) => {
          if (!open) closeSaveDialog();
        }}
      >
        <DialogContent>
          <form onSubmit={handleSave} className="flex min-w-0 flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                {selectedPattern
                  ? "Mettre à jour le motif"
                  : "Sauvegarder le motif"}
              </DialogTitle>
              <DialogDescription>
                {selectedPattern
                  ? `« ${selectedPattern.name} » reprendra l'état actuel de l'éditeur.`
                  : "Donne un nom à ton motif pour le retrouver dans le panneau."}
              </DialogDescription>
            </DialogHeader>
            {!selectedPattern && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="pattern-name">Nom du motif</Label>
                <Input
                  id="pattern-name"
                  value={patternName}
                  onChange={(event) => setPatternName(event.target.value)}
                  placeholder="Mon motif…"
                  autoFocus
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeSaveDialog}>
                Annuler
              </Button>
              <Button type="submit">
                {selectedPattern ? "Mettre à jour" : "Sauvegarder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />
    </div>
  );
}
