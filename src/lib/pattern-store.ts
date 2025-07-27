import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface Pattern {
  id: string;
  name: string;
  gridSize: number;
  cells: boolean[][];
  backgroundColor: string;
  foregroundColor: string;
  gridMode: GridMode;
  selectedPoints: string[];
  lines: Line[];
  createdAt: number;
  updatedAt: number;
}

export type GridMode = "pixel" | "points";
export type EditMode = "draw" | "delete";

export interface Line {
  from: string;
  to: string;
}

export interface HistoryState {
  cells: boolean[][];
  selectedPoints: string[];
  lines: Line[];
}

export interface PatternEditorState {
  gridSize: number;
  cells: boolean[][];
  backgroundColor: string;
  foregroundColor: string;
  isDrawing: boolean;
  showGrid: boolean;
  showPreview: boolean;
  previewScale: number;
  previewRepeatCount: number;
  previewZoom: number;
  gridMode: GridMode;
  editMode: EditMode;
  history: HistoryState[];
  historyIndex: number;
  maxHistory: number;
  selectedPoints: string[];
  lines: Line[];
}

// État de l'éditeur
export const patternEditorAtom = atomWithStorage<PatternEditorState>(
  "just-tools-editor-state",
  {
    gridSize: 16,
    cells: Array(16)
      .fill(null)
      .map(() => Array(16).fill(false)),
    backgroundColor: "#ffffff",
    foregroundColor: "#000000",
    isDrawing: false,
    showGrid: true,
    showPreview: true,
    previewScale: 3,
    previewRepeatCount: 4,
    previewZoom: 0.5,
    gridMode: "pixel",
    editMode: "draw",
    history: [
      {
        cells: Array(16)
          .fill(null)
          .map(() => Array(16).fill(false)),
        selectedPoints: [],
        lines: [],
      },
    ],
    historyIndex: 0,
    maxHistory: 50,
    selectedPoints: [],
    lines: [],
  }
);

// Atom pour forcer la migration des valeurs manquantes
export const migratePreviewSettingsAtom = atom(null, (get, set) => {
  const currentState = get(patternEditorAtom);

  // Vérifier si les nouvelles propriétés existent
  if (
    typeof currentState.previewRepeatCount === "undefined" ||
    typeof currentState.previewZoom === "undefined"
  ) {
    set(patternEditorAtom, {
      ...currentState,
      previewRepeatCount: 4,
      previewZoom: 0.5,
    });
  }
});

// Historique des motifs sauvegardés
export const savedPatternsAtom = atomWithStorage<Pattern[]>(
  "just-tools-patterns",
  []
);

// Motif actuellement sélectionné
export const selectedPatternAtom = atom<Pattern | null>(null);

// Actions pour l'éditeur
export const setGridSizeAtom = atom(null, (get, set, size: number) => {
  const currentState = get(patternEditorAtom);
  const newCells = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));
  set(patternEditorAtom, {
    ...currentState,
    gridSize: size,
    cells: newCells,
  });
});

export const toggleCellAtom = atom(
  null,
  (get, set, row: number, col: number) => {
    const currentState = get(patternEditorAtom);
    const newCells = currentState.cells.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? !cell : cell))
    );
    set(patternEditorAtom, {
      ...currentState,
      cells: newCells,
    });
  }
);

export const clearGridAtom = atom(null, (get, set) => {
  const currentState = get(patternEditorAtom);
  const newCells = Array(currentState.gridSize)
    .fill(null)
    .map(() => Array(currentState.gridSize).fill(false));

  // Créer un nouvel état d'historique
  const newHistoryState: HistoryState = {
    cells: newCells,
    selectedPoints: [],
    lines: [],
  };

  set(patternEditorAtom, {
    ...currentState,
    cells: newCells,
    selectedPoints: [],
    lines: [],
    history: [newHistoryState],
    historyIndex: 0,
    isDrawing: false,
  });
});

export const savePatternAtom = atom(null, (get, set, name: string) => {
  const currentState = get(patternEditorAtom);
  const savedPatterns = get(savedPatternsAtom);

  const newPattern: Pattern = {
    id: Date.now().toString(),
    name,
    gridSize: currentState.gridSize,
    cells: currentState.cells.map((row) => [...row]),
    backgroundColor: currentState.backgroundColor,
    foregroundColor: currentState.foregroundColor,
    gridMode: currentState.gridMode,
    selectedPoints: [...currentState.selectedPoints],
    lines: [...currentState.lines],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  set(savedPatternsAtom, [newPattern, ...savedPatterns]);
});

export const loadPatternAtom = atom(null, (get, set, pattern: Pattern) => {
  const initialCells = Array(pattern.gridSize)
    .fill(null)
    .map(() => Array(pattern.gridSize).fill(false));

  const initialHistoryState: HistoryState = {
    cells: initialCells,
    selectedPoints: [],
    lines: [],
  };

  set(patternEditorAtom, {
    gridSize: pattern.gridSize,
    cells: pattern.cells.map((row) => [...row]),
    backgroundColor: pattern.backgroundColor,
    foregroundColor: pattern.foregroundColor,
    isDrawing: false,
    showGrid: true,
    showPreview: true,
    previewScale: 3,
    previewRepeatCount: 4,
    previewZoom: 0.5,
    gridMode: pattern.gridMode || "pixel",
    editMode: "draw",
    history: [initialHistoryState],
    historyIndex: 0,
    maxHistory: 50,
    selectedPoints: pattern.selectedPoints || [],
    lines: pattern.lines || [],
  });
  set(selectedPatternAtom, pattern);
});

export const deletePatternAtom = atom(null, (get, set, patternId: string) => {
  const savedPatterns = get(savedPatternsAtom);
  const filteredPatterns = savedPatterns.filter((p) => p.id !== patternId);
  set(savedPatternsAtom, filteredPatterns);
});

export const updatePatternAtom = atom(null, (get, set, patternId: string) => {
  const currentState = get(patternEditorAtom);
  const savedPatterns = get(savedPatternsAtom);

  const updatedPatterns = savedPatterns.map((pattern) =>
    pattern.id === patternId
      ? {
          ...pattern,
          gridSize: currentState.gridSize,
          cells: currentState.cells.map((row) => [...row]),
          backgroundColor: currentState.backgroundColor,
          foregroundColor: currentState.foregroundColor,
          gridMode: currentState.gridMode,
          selectedPoints: [...currentState.selectedPoints],
          lines: [...currentState.lines],
          updatedAt: Date.now(),
        }
      : pattern
  );

  set(savedPatternsAtom, updatedPatterns);
});

// Fonctions Undo/Redo
export const addToHistoryAtom = atom(null, (get, set) => {
  const currentState = get(patternEditorAtom);
  const newHistoryState: HistoryState = {
    cells: currentState.cells.map((row) => [...row]),
    selectedPoints: [...currentState.selectedPoints],
    lines: [...currentState.lines],
  };

  // Supprimer l'historique après l'index actuel si on ajoute une nouvelle action
  const newHistory = currentState.history.slice(
    0,
    currentState.historyIndex + 1
  );
  newHistory.push(newHistoryState);

  // Limiter la taille de l'historique
  if (newHistory.length > currentState.maxHistory) {
    newHistory.shift();
  }

  set(patternEditorAtom, {
    ...currentState,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  });
});

export const undoAtom = atom(null, (get, set) => {
  const currentState = get(patternEditorAtom);
  if (currentState.historyIndex > 0) {
    const newIndex = currentState.historyIndex - 1;
    const historyState = currentState.history[newIndex];
    set(patternEditorAtom, {
      ...currentState,
      cells: historyState.cells.map((row) => [...row]),
      selectedPoints: [...historyState.selectedPoints],
      lines: [...historyState.lines],
      historyIndex: newIndex,
    });
  }
});

export const redoAtom = atom(null, (get, set) => {
  const currentState = get(patternEditorAtom);
  if (currentState.historyIndex < currentState.history.length - 1) {
    const newIndex = currentState.historyIndex + 1;
    const historyState = currentState.history[newIndex];
    set(patternEditorAtom, {
      ...currentState,
      cells: historyState.cells.map((row) => [...row]),
      selectedPoints: [...historyState.selectedPoints],
      lines: [...historyState.lines],
      historyIndex: newIndex,
    });
  }
});

// Changer le mode de grille
export const setGridModeAtom = atom(null, (get, set, mode: GridMode) => {
  const currentState = get(patternEditorAtom);

  // Si on change de mode, reset l'historique et l'état
  if (currentState.gridMode !== mode) {
    const gridSize = currentState.gridSize;
    const initialCells = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false));

    const initialHistoryState: HistoryState = {
      cells: initialCells,
      selectedPoints: [],
      lines: [],
    };

    set(patternEditorAtom, {
      ...currentState,
      gridMode: mode,
      editMode: "draw",
      cells: initialCells,
      selectedPoints: [],
      lines: [],
      history: [initialHistoryState],
      historyIndex: 0,
      isDrawing: false,
      previewRepeatCount: 4,
      previewZoom: 0.5,
    });
  }
});

// Mettre à jour toggleCell pour inclure l'historique
export const toggleCellWithHistoryAtom = atom(
  null,
  (get, set, row: number, col: number) => {
    const currentState = get(patternEditorAtom);
    const newCells = currentState.cells.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? !cell : cell))
    );

    // Créer un nouvel état d'historique
    const newHistoryState: HistoryState = {
      cells: newCells,
      selectedPoints: [...currentState.selectedPoints],
      lines: [...currentState.lines],
    };

    // Ajouter à l'historique
    const newHistory = currentState.history.slice(
      0,
      currentState.historyIndex + 1
    );
    newHistory.push(newHistoryState);

    if (newHistory.length > currentState.maxHistory) {
      newHistory.shift();
    }

    set(patternEditorAtom, {
      ...currentState,
      cells: newCells,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  }
);

// Gestion des points sélectionnés pour le mode points
export const togglePointSelectionAtom = atom(
  null,
  (get, set, pointId: string) => {
    const currentState = get(patternEditorAtom);
    const isSelected = currentState.selectedPoints.includes(pointId);

    const newSelectedPoints = isSelected
      ? currentState.selectedPoints.filter((id) => id !== pointId)
      : [...currentState.selectedPoints, pointId];

    // Créer un nouvel état d'historique
    const newHistoryState: HistoryState = {
      cells: currentState.cells.map((row) => [...row]),
      selectedPoints: newSelectedPoints,
      lines: [...currentState.lines],
    };

    // Ajouter à l'historique
    const newHistory = currentState.history.slice(
      0,
      currentState.historyIndex + 1
    );
    newHistory.push(newHistoryState);

    if (newHistory.length > currentState.maxHistory) {
      newHistory.shift();
    }

    set(patternEditorAtom, {
      ...currentState,
      selectedPoints: newSelectedPoints,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  }
);

export const clearSelectedPointsAtom = atom(null, (get, set) => {
  const currentState = get(patternEditorAtom);
  set(patternEditorAtom, {
    ...currentState,
    selectedPoints: [],
  });
});

// Gestion des lignes pour le mode points
export const addLineAtom = atom(null, (get, set, line: Line) => {
  const currentState = get(patternEditorAtom);
  const lineExists = currentState.lines.some(
    (l) =>
      (l.from === line.from && l.to === line.to) ||
      (l.from === line.to && l.to === line.from)
  );

  if (!lineExists) {
    const newLines = [...currentState.lines, line];

    // Créer un nouvel état d'historique
    const newHistoryState: HistoryState = {
      cells: currentState.cells.map((row) => [...row]),
      selectedPoints: [...currentState.selectedPoints],
      lines: newLines,
    };

    // Ajouter à l'historique
    const newHistory = currentState.history.slice(
      0,
      currentState.historyIndex + 1
    );
    newHistory.push(newHistoryState);

    if (newHistory.length > currentState.maxHistory) {
      newHistory.shift();
    }

    set(patternEditorAtom, {
      ...currentState,
      lines: newLines,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  }
});

export const clearLinesAtom = atom(null, (get, set) => {
  const currentState = get(patternEditorAtom);
  set(patternEditorAtom, {
    ...currentState,
    lines: [],
  });
});

// Supprimer une ligne spécifique
export const removeLineAtom = atom(null, (get, set, lineToRemove: Line) => {
  const currentState = get(patternEditorAtom);
  const newLines = currentState.lines.filter(
    (line) =>
      !(
        (line.from === lineToRemove.from && line.to === lineToRemove.to) ||
        (line.from === lineToRemove.to && line.to === lineToRemove.from)
      )
  );

  // Créer un nouvel état d'historique
  const newHistoryState: HistoryState = {
    cells: currentState.cells.map((row) => [...row]),
    selectedPoints: [...currentState.selectedPoints],
    lines: newLines,
  };

  // Ajouter à l'historique
  const newHistory = currentState.history.slice(
    0,
    currentState.historyIndex + 1
  );
  newHistory.push(newHistoryState);

  if (newHistory.length > currentState.maxHistory) {
    newHistory.shift();
  }

  set(patternEditorAtom, {
    ...currentState,
    lines: newLines,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  });
});

// Changer le mode d'édition
export const setEditModeAtom = atom(null, (get, set, mode: EditMode) => {
  const currentState = get(patternEditorAtom);
  set(patternEditorAtom, {
    ...currentState,
    editMode: mode,
  });
});

// Mettre à jour le nombre de répétitions de l'aperçu
export const setPreviewRepeatCountAtom = atom(
  null,
  (get, set, count: number) => {
    const currentState = get(patternEditorAtom);
    set(patternEditorAtom, {
      ...currentState,
      previewRepeatCount: count,
    });
  }
);

// Mettre à jour le zoom de l'aperçu
export const setPreviewZoomAtom = atom(null, (get, set, zoom: number) => {
  const currentState = get(patternEditorAtom);
  set(patternEditorAtom, {
    ...currentState,
    previewZoom: zoom,
  });
});

// Reset complet de la configuration
export const resetConfigurationAtom = atom(null, (get, set) => {
  const gridSize = 16;
  const initialCells = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(false));

  const initialHistoryState: HistoryState = {
    cells: initialCells,
    selectedPoints: [],
    lines: [],
  };

  set(patternEditorAtom, {
    gridSize: 16,
    cells: initialCells,
    backgroundColor: "#ffffff",
    foregroundColor: "#000000",
    isDrawing: false,
    showGrid: true,
    showPreview: true,
    previewScale: 3,
    previewRepeatCount: 4,
    previewZoom: 0.5,
    gridMode: "pixel",
    editMode: "draw",
    history: [initialHistoryState],
    historyIndex: 0,
    maxHistory: 50,
    selectedPoints: [],
    lines: [],
  });
});
