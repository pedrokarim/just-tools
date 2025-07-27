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

export interface AppState {
  sourceImage?: HTMLImageElement | ImageBitmap;
  settings: HalftoneSettings;
  presets: Record<string, HalftoneSettings>;
  isProcessing: boolean;
  previewSize: { width: number; height: number };
}

export interface HalftoneStore extends AppState {
  // Actions
  setSourceImage: (image: HTMLImageElement | ImageBitmap) => void;
  updateSettings: (settings: Partial<HalftoneSettings>) => void;
  resetSettings: () => void;
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
  setProcessing: (processing: boolean) => void;
  setPreviewSize: (size: { width: number; height: number }) => void;
}

const defaultSettings: HalftoneSettings = {
  // Forme des points individuels
  shape: "circle",

  // Forme globale de l'ensemble des points
  globalShape: "circle",
  direction: "center",

  // Position de l'effet
  effectPosition: {
    x: 50, // Centre horizontal
    y: 50, // Centre vertical
  },

  // Paramètres de base
  angle: 0,
  frequency: 80, // Plus dense par défaut
  sizeMin: 3, // Plus visible
  sizeMax: 15, // Plus équilibré
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
  opacity: 0.9, // Plus visible par défaut
  blendMode: "normal",
  jitter: 0.1, // Légère variation par défaut
  seed: 0,
  useMask: false,

  // Contrôle de l'application
  autoApply: true, // Application automatique activée par défaut
};

export const useHalftoneStore = create<HalftoneStore>()(
  persist(
    (set, get) => ({
      sourceImage: undefined,
      settings: defaultSettings,
      presets: {},
      isProcessing: false,
      previewSize: { width: 800, height: 600 },

      setSourceImage: (image) => set({ sourceImage: image }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetSettings: () => set({ settings: defaultSettings }),

      savePreset: (name) =>
        set((state) => ({
          presets: { ...state.presets, [name]: state.settings },
        })),

      loadPreset: (name) =>
        set((state) => ({
          settings: state.presets[name] || defaultSettings,
        })),

      deletePreset: (name) =>
        set((state) => {
          const newPresets = { ...state.presets };
          delete newPresets[name];
          return { presets: newPresets };
        }),

      setProcessing: (processing) => set({ isProcessing: processing }),

      setPreviewSize: (size) => set({ previewSize: size }),
    }),
    {
      name: "halftone-store",
      partialize: (state) => ({
        settings: state.settings,
        presets: state.presets,
      }),
    }
  )
);
