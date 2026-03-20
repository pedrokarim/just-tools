import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Shape =
  | "circle"
  | "square"
  | "diamond"
  | "hexagon"
  | "line"
  | "custom-svg";
export type Mapping = "linear" | "gamma" | "logarithmic" | "exponential";
export type ColorMode = "monochrome" | "channels" | "palette";

export type GlobalShape =
  | "circle"
  | "square"
  | "diamond"
  | "hexagon"
  | "triangle"
  | "star"
  | "heart"
  | "custom";
export type Direction =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center"
  | "radial";

export interface HalftoneSettings {
  // Forme des points individuels
  shape: Shape;

  // Forme globale de l'ensemble des points
  globalShape: GlobalShape;
  direction: Direction;

  // Position de l'effet
  effectPosition: {
    x: number; // -100 à 200 (pour sortir de l'image)
    y: number; // -100 à 200 (pour sortir de l'image)
  };

  // Paramètres de base
  angle: number;
  frequency: number;
  sizeMin: number;
  sizeMax: number;
  mapping: Mapping;
  gamma: number;
  threshold: number;
  modeCouleur: ColorMode;
  couleurs: string[];
  gradient?: {
    enabled: boolean;
    type: "linear" | "radial";
    stops: { offset: number; color: string }[];
  };
  opacity: number;
  blendMode: GlobalCompositeOperation | string;
  jitter: number;
  seed: number;
  useMask: boolean;
  mask?: ImageBitmap | HTMLCanvasElement;

  // Contrôle de l'application
  autoApply: boolean;
}

// --- Layer system ---

export interface HalftoneLayer {
  id: string;
  name: string;
  settings: HalftoneSettings;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0-1, opacité du calque entier (distinct de settings.opacity = opacité des points)
  blendMode: GlobalCompositeOperation;
}

export interface AppState {
  sourceImage?: HTMLImageElement | ImageBitmap;
  layers: HalftoneLayer[];
  activeLayerId: string | null;
  presets: Record<string, HalftoneLayer[]>;
  isProcessing: boolean;
  previewSize: { width: number; height: number };
}

export interface HalftoneStore extends AppState {
  // Image
  setSourceImage: (image: HTMLImageElement | ImageBitmap) => void;
  clearSourceImage: () => void;
  setProcessing: (processing: boolean) => void;
  setPreviewSize: (size: { width: number; height: number }) => void;

  // Layer CRUD
  addLayer: () => void;
  duplicateLayer: (id: string) => void;
  deleteLayer: (id: string) => void;
  selectLayer: (id: string) => void;

  // Layer properties
  renameLayer: (id: string, name: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, blendMode: GlobalCompositeOperation) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;

  // Active layer settings (pont vers controls-panel)
  updateActiveLayerSettings: (settings: Partial<HalftoneSettings>) => void;

  // Presets
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
  resetSettings: () => void;
}

export const defaultSettings: HalftoneSettings = {
  shape: "circle",
  globalShape: "circle",
  direction: "center",
  effectPosition: { x: 50, y: 50 },
  angle: 0,
  frequency: 80,
  sizeMin: 3,
  sizeMax: 15,
  mapping: "linear",
  gamma: 1,
  threshold: 0.5,
  modeCouleur: "monochrome",
  couleurs: ["#000000", "#ffffff"],
  gradient: {
    enabled: false,
    type: "linear",
    stops: [
      { offset: 0, color: "#000000" },
      { offset: 1, color: "#ffffff" },
    ],
  },
  opacity: 0.9,
  blendMode: "source-over",
  jitter: 0.1,
  seed: 0,
  useMask: false,
  autoApply: true,
};

let layerCounter = 1;

export function createDefaultLayer(name?: string): HalftoneLayer {
  return {
    id: crypto.randomUUID(),
    name: name ?? `Calque ${layerCounter++}`,
    settings: { ...defaultSettings },
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: "source-over",
  };
}

const initialLayer = createDefaultLayer("Calque 1");

export const useHalftoneStore = create<HalftoneStore>()(
  persist(
    (set, get) => ({
      sourceImage: undefined,
      layers: [initialLayer],
      activeLayerId: initialLayer.id,
      presets: {},
      isProcessing: false,
      previewSize: { width: 800, height: 600 },

      // --- Image ---
      setSourceImage: (image) => set({ sourceImage: image }),
      clearSourceImage: () => set({ sourceImage: undefined }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setPreviewSize: (size) => set({ previewSize: size }),

      // --- Layer CRUD ---
      addLayer: () => {
        const newLayer = createDefaultLayer();
        set((state) => ({
          layers: [...state.layers, newLayer],
          activeLayerId: newLayer.id,
        }));
      },

      duplicateLayer: (id) => {
        set((state) => {
          const source = state.layers.find((l) => l.id === id);
          if (!source) return state;
          const duplicate: HalftoneLayer = {
            ...source,
            id: crypto.randomUUID(),
            name: `${source.name} (copie)`,
            settings: { ...source.settings },
          };
          const idx = state.layers.findIndex((l) => l.id === id);
          const newLayers = [...state.layers];
          newLayers.splice(idx + 1, 0, duplicate);
          return { layers: newLayers, activeLayerId: duplicate.id };
        });
      },

      deleteLayer: (id) => {
        set((state) => {
          if (state.layers.length <= 1) return state; // Garder au moins 1 calque
          const newLayers = state.layers.filter((l) => l.id !== id);
          let newActiveId = state.activeLayerId;
          if (state.activeLayerId === id) {
            const oldIdx = state.layers.findIndex((l) => l.id === id);
            newActiveId =
              newLayers[Math.min(oldIdx, newLayers.length - 1)]?.id ?? null;
          }
          return { layers: newLayers, activeLayerId: newActiveId };
        });
      },

      selectLayer: (id) => set({ activeLayerId: id }),

      // --- Layer properties ---
      renameLayer: (id, name) => {
        set((state) => ({
          layers: state.layers.map((l) =>
            l.id === id ? { ...l, name } : l
          ),
        }));
      },

      toggleLayerVisibility: (id) => {
        set((state) => ({
          layers: state.layers.map((l) =>
            l.id === id ? { ...l, visible: !l.visible } : l
          ),
        }));
      },

      toggleLayerLock: (id) => {
        set((state) => ({
          layers: state.layers.map((l) =>
            l.id === id ? { ...l, locked: !l.locked } : l
          ),
        }));
      },

      setLayerOpacity: (id, opacity) => {
        set((state) => ({
          layers: state.layers.map((l) =>
            l.id === id ? { ...l, opacity } : l
          ),
        }));
      },

      setLayerBlendMode: (id, blendMode) => {
        set((state) => ({
          layers: state.layers.map((l) =>
            l.id === id ? { ...l, blendMode } : l
          ),
        }));
      },

      reorderLayers: (fromIndex, toIndex) => {
        set((state) => {
          const newLayers = [...state.layers];
          const [moved] = newLayers.splice(fromIndex, 1);
          newLayers.splice(toIndex, 0, moved);
          return { layers: newLayers };
        });
      },

      // --- Active layer settings bridge ---
      updateActiveLayerSettings: (newSettings) => {
        set((state) => {
          const activeLayer = state.layers.find(
            (l) => l.id === state.activeLayerId
          );
          if (!activeLayer || activeLayer.locked) return state;
          return {
            layers: state.layers.map((l) =>
              l.id === state.activeLayerId
                ? { ...l, settings: { ...l.settings, ...newSettings } }
                : l
            ),
          };
        });
      },

      // --- Presets ---
      savePreset: (name) =>
        set((state) => ({
          presets: {
            ...state.presets,
            [name]: state.layers.map((l) => ({
              ...l,
              settings: { ...l.settings },
            })),
          },
        })),

      loadPreset: (name) =>
        set((state) => {
          const preset = state.presets[name];
          if (!preset) return state;
          return {
            layers: preset.map((l) => ({
              ...l,
              id: crypto.randomUUID(),
              settings: { ...l.settings },
            })),
            activeLayerId: null,
          };
        }),

      deletePreset: (name) =>
        set((state) => {
          const newPresets = { ...state.presets };
          delete newPresets[name];
          return { presets: newPresets };
        }),

      resetSettings: () => {
        layerCounter = 1;
        const fresh = createDefaultLayer("Calque 1");
        set({
          layers: [fresh],
          activeLayerId: fresh.id,
        });
      },
    }),
    {
      name: "halftone-store",
      version: 2,
      partialize: (state) => ({
        layers: state.layers.map((l) => ({
          ...l,
          settings: { ...l.settings, mask: undefined },
        })),
        activeLayerId: state.activeLayerId,
        presets: state.presets,
      }),
      migrate: (persisted: unknown, version: number) => {
        if (version < 2) {
          // Migration v1 -> v2 : single settings -> layers
          const old = persisted as {
            settings?: HalftoneSettings;
            presets?: Record<string, HalftoneSettings>;
          };
          const migratedLayer: HalftoneLayer = {
            id: crypto.randomUUID(),
            name: "Calque 1",
            settings: old.settings ?? { ...defaultSettings },
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: "source-over",
          };
          const migratedPresets: Record<string, HalftoneLayer[]> = {};
          if (old.presets) {
            for (const [name, s] of Object.entries(old.presets)) {
              migratedPresets[name] = [
                {
                  id: crypto.randomUUID(),
                  name: "Calque 1",
                  settings: s,
                  visible: true,
                  locked: false,
                  opacity: 1,
                  blendMode: "source-over",
                },
              ];
            }
          }
          return {
            layers: [migratedLayer],
            activeLayerId: migratedLayer.id,
            presets: migratedPresets,
          };
        }
        return persisted;
      },
    }
  )
);

// --- Hook pont pour controls-panel ---
export function useActiveLayerSettings() {
  const layers = useHalftoneStore((s) => s.layers);
  const activeLayerId = useHalftoneStore((s) => s.activeLayerId);
  const updateActiveLayerSettings = useHalftoneStore(
    (s) => s.updateActiveLayerSettings
  );

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return {
    settings: activeLayer?.settings ?? defaultSettings,
    updateSettings: updateActiveLayerSettings,
    isLocked: activeLayer?.locked ?? false,
    activeLayer: activeLayer ?? null,
  };
}
