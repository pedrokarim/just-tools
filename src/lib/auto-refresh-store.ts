import { atom } from "jotai";

// Store pour l'auto-refresh
export const autoRefreshEnabledAtom = atom<boolean>(false);
export const autoRefreshIntervalAtom = atom<number>(30); // 30 secondes par défaut

// Options d'intervalle disponibles (en secondes)
export const refreshIntervals = [
  { value: 10, label: "10 secondes" },
  { value: 30, label: "30 secondes" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
];

// Store pour forcer le refresh manuel
export const forceRefreshAtom = atom<number>(0);
