"use client";

import { useState, useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  patternEditorAtom,
  savedPatternsAtom,
  selectedPatternAtom,
  setGridSizeAtom,
  toggleCellWithHistoryAtom,
  clearGridAtom,
  savePatternAtom,
  loadPatternAtom,
  deletePatternAtom,
  updatePatternAtom,
  undoAtom,
  redoAtom,
  setGridModeAtom,
  setEditModeAtom,
  resetConfigurationAtom,
  type Pattern,
  type GridMode,
  type EditMode,
} from "@/lib/pattern-store";
import {
  Save,
  Download,
  Trash2,
  RotateCcw,
  Grid,
  Eye,
  Palette,
  Plus,
  Loader2,
  Undo2,
  Redo2,
  Settings,
  FileText,
  FolderOpen,
  Square,
  Circle,
  Layers,
  Pencil,
  MousePointer,
  Scissors,
} from "lucide-react";
import { toast } from "sonner";
import { PointsGrid } from "@/components/points-grid";
import { PreviewModal } from "@/components/preview-modal";
import { motion, AnimatePresence } from "framer-motion";

export default function PatternEditor() {
  const [editorState, setEditorState] = useAtom(patternEditorAtom);
  const [savedPatterns] = useAtom(savedPatternsAtom);
  const [selectedPattern, setSelectedPattern] = useAtom(selectedPatternAtom);
  const [, setGridSize] = useAtom(setGridSizeAtom);
  const [, toggleCell] = useAtom(toggleCellWithHistoryAtom);
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
  const [isExporting, setIsExporting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gestion du dessin
  const handleMouseDown = (row: number, col: number) => {
    setEditorState((prev) => ({ ...prev, isDrawing: true }));
    toggleCell(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (editorState.isDrawing) {
      toggleCell(row, col);
    }
  };

  const handleMouseUp = () => {
    setEditorState((prev) => ({ ...prev, isDrawing: false }));
  };

  // Sauvegarder un motif
  const handleSave = () => {
    if (!patternName.trim()) {
      toast.error("Veuillez entrer un nom pour le motif");
      return;
    }

    if (selectedPattern) {
      updatePattern(selectedPattern.id);
      toast.success("Motif mis à jour !");
    } else {
      savePattern(patternName);
      toast.success("Motif sauvegardé !");
    }

    setPatternName("");
    setShowSaveDialog(false);
    setSelectedPattern(null);
  };

  // Charger un motif
  const handleLoad = (pattern: Pattern) => {
    loadPattern(pattern);
    setSelectedPattern(pattern);
    toast.success(`Motif "${pattern.name}" chargé !`);
  };

  // Supprimer un motif
  const handleDelete = (patternId: string) => {
    deletePattern(patternId);
    if (selectedPattern?.id === patternId) {
      setSelectedPattern(null);
    }
    toast.success("Motif supprimé !");
  };

  // Exporter le motif
  const handleExport = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Créer un canvas temporaire pour le motif répété
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      const cellSize = 20;
      const patternSize = editorState.gridSize * cellSize;
      const repeatCount = 8; // 8x8 répétitions
      const totalSize = patternSize * repeatCount;

      tempCanvas.width = totalSize;
      tempCanvas.height = totalSize;

      // Dessiner le motif répété
      for (let i = 0; i < repeatCount; i++) {
        for (let j = 0; j < repeatCount; j++) {
          // Dessiner chaque cellule du motif
          for (let row = 0; row < editorState.gridSize; row++) {
            for (let col = 0; col < editorState.gridSize; col++) {
              const x = i * patternSize + col * cellSize;
              const y = j * patternSize + row * cellSize;

              tempCtx.fillStyle = editorState.cells[row][col]
                ? editorState.foregroundColor
                : editorState.backgroundColor;
              tempCtx.fillRect(x, y, cellSize, cellSize);

              // Ajouter une bordure subtile
              tempCtx.strokeStyle = "#e5e7eb";
              tempCtx.lineWidth = 0.5;
              tempCtx.strokeRect(x, y, cellSize, cellSize);
            }
          }
        }
      }

      // Créer le lien de téléchargement
      const link = document.createElement("a");
      link.download = `pattern-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL();
      link.click();

      toast.success("Motif exporté avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  // Mettre à jour la prévisualisation
  useEffect(() => {
    if (!canvasRef.current || editorState.gridMode === "points") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = editorState.previewScale;
    const canvasSize = editorState.gridSize * cellSize;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Dessiner le motif
    for (let row = 0; row < editorState.gridSize; row++) {
      for (let col = 0; col < editorState.gridSize; col++) {
        const x = col * cellSize;
        const y = row * cellSize;

        ctx.fillStyle = editorState.cells[row][col]
          ? editorState.foregroundColor
          : editorState.backgroundColor;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Ajouter la grille si activée
        if (editorState.showGrid) {
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }
  }, [
    editorState.cells,
    editorState.backgroundColor,
    editorState.foregroundColor,
    editorState.showGrid,
    editorState.previewScale,
    editorState.gridMode,
  ]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Barre d'outils principale */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Separator orientation="vertical" className="h-6" />

            {/* Fichier */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Fichier
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Export..." : "Exporter"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => clearGrid()}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nouveau
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => resetConfiguration()}>
                  <Settings className="h-4 w-4 mr-2" />
                  Reset Configuration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            {/* Édition */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => undo()}
                disabled={editorState.historyIndex === 0}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => redo()}
                disabled={
                  editorState.historyIndex === editorState.history.length - 1
                }
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Mode de grille */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {editorState.gridMode === "pixel" ? (
                    <Square className="h-4 w-4 mr-2" />
                  ) : (
                    <Circle className="h-4 w-4 mr-2" />
                  )}
                  {editorState.gridMode === "pixel" ? "Pixels" : "Points"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    const oldMode = editorState.gridMode;
                    setGridMode("pixel");
                    if (oldMode !== "pixel") {
                      toast.info(
                        "Mode Pixels activé - Historique réinitialisé"
                      );
                    }
                  }}
                  className={
                    editorState.gridMode === "pixel"
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }
                >
                  <Square className="h-4 w-4 mr-2" />
                  Mode Pixels
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const oldMode = editorState.gridMode;
                    setGridMode("points");
                    if (oldMode !== "points") {
                      toast.info(
                        "Mode Points activé - Historique réinitialisé"
                      );
                    }
                  }}
                  className={
                    editorState.gridMode === "points"
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Mode Points
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Zone de travail */}
        <div className="flex-1 flex flex-col">
          {/* Barre d'outils secondaire */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="grid-size" className="text-sm">
                  Grille:
                </Label>
                <Slider
                  id="grid-size"
                  min={8}
                  max={32}
                  step={4}
                  value={[editorState.gridSize]}
                  onValueChange={([value]) => setGridSize(value)}
                  className="w-24"
                />
                <span className="text-sm text-slate-500 w-8">
                  {editorState.gridSize}x{editorState.gridSize}
                </span>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center space-x-2">
                <Label htmlFor="bg-color" className="text-sm">
                  Arrière-plan:
                </Label>
                <Input
                  id="bg-color"
                  type="color"
                  value={editorState.backgroundColor}
                  onChange={(e) =>
                    setEditorState((prev) => ({
                      ...prev,
                      backgroundColor: e.target.value,
                    }))
                  }
                  className="w-12 h-8"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="fg-color" className="text-sm">
                  Motif:
                </Label>
                <Input
                  id="fg-color"
                  type="color"
                  value={editorState.foregroundColor}
                  onChange={(e) =>
                    setEditorState((prev) => ({
                      ...prev,
                      foregroundColor: e.target.value,
                    }))
                  }
                  className="w-12 h-8"
                />
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Outils d'édition */}
              <div className="flex items-center space-x-1">
                <Button
                  variant={
                    editorState.editMode === "draw" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setEditMode("draw")}
                  className="flex items-center space-x-1"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="text-xs">Dessiner</span>
                </Button>
                <Button
                  variant={
                    editorState.editMode === "delete" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setEditMode("delete")}
                  className="flex items-center space-x-1"
                >
                  <Scissors className="h-4 w-4" />
                  <span className="text-xs">Supprimer</span>
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Button
                variant={editorState.showGrid ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setEditorState((prev) => ({
                    ...prev,
                    showGrid: !prev.showGrid,
                  }))
                }
              >
                <Grid className="h-4 w-4 mr-2" />
                Grille
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewModal(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>

              <Button variant="outline" size="sm" onClick={() => clearGrid()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            </div>
          </div>

          {/* Zone de dessin */}
          <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-800 relative">
            {/* Indicateur de mode */}
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="secondary" className="text-xs">
                {editorState.gridMode === "pixel" ? (
                  <>
                    <Square className="h-3 w-3 mr-1" />
                    Mode Pixels
                  </>
                ) : (
                  <>
                    <Circle className="h-3 w-3 mr-1" />
                    Mode Points
                  </>
                )}
              </Badge>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-2">
              {editorState.gridMode === "pixel" ? (
                <div
                  className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden"
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {editorState.cells.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {row.map((cell, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            cell
                              ? "bg-slate-900 dark:bg-slate-100"
                              : "bg-white dark:bg-slate-800"
                          } ${
                            editorState.showGrid
                              ? "border border-slate-200 dark:border-slate-700"
                              : ""
                          }`}
                          onMouseDown={() =>
                            handleMouseDown(rowIndex, colIndex)
                          }
                          onMouseEnter={() =>
                            handleMouseEnter(rowIndex, colIndex)
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <PointsGrid />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Motifs sauvegardés
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {savedPatterns.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Aucun motif sauvegardé
                      </p>
                    ) : (
                      savedPatterns.map((pattern, index) => (
                        <motion.div
                          key={pattern.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                            selectedPattern?.id === pattern.id
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                              : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                          }`}
                          onClick={() => handleLoad(pattern)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {pattern.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {pattern.gridSize}x{pattern.gridSize} •{" "}
                              {pattern.gridMode === "pixel"
                                ? "Pixels"
                                : "Points"}{" "}
                              •{" "}
                              {new Date(pattern.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(pattern.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialog de sauvegarde */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 shadow-xl">
            <CardHeader>
              <CardTitle>
                {selectedPattern
                  ? "Mettre à jour le motif"
                  : "Sauvegarder le motif"}
              </CardTitle>
              <CardDescription>
                {selectedPattern
                  ? "Le motif sera mis à jour avec les modifications actuelles"
                  : "Donnez un nom à votre motif pour le sauvegarder"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pattern-name">Nom du motif</Label>
                <Input
                  id="pattern-name"
                  value={patternName}
                  onChange={(e) => setPatternName(e.target.value)}
                  placeholder="Mon motif..."
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setPatternName("");
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  {selectedPattern ? "Mettre à jour" : "Sauvegarder"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal d'aperçu */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />
    </div>
  );
}
