import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  autoRefreshEnabledAtom,
  autoRefreshIntervalAtom,
  forceRefreshAtom,
} from "@/lib/auto-refresh-store";

export function useAutoRefresh(callback: () => void) {
  const [autoRefreshEnabled] = useAtom(autoRefreshEnabledAtom);
  const [autoRefreshInterval] = useAtom(autoRefreshIntervalAtom);
  const [forceRefresh] = useAtom(forceRefreshAtom);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Nettoyer l'intervalle précédent
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Si l'auto-refresh est activé, créer un nouvel intervalle
    if (autoRefreshEnabled) {
      intervalRef.current = setInterval(() => {
        console.log(
          `🔄 Auto-refresh: Actualisation des données (${autoRefreshInterval}s)`
        );
        callback();
      }, autoRefreshInterval * 1000);
    }

    // Nettoyer l'intervalle quand le composant se démonte
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, autoRefreshInterval, callback]);

  // Forcer le refresh quand forceRefresh change
  useEffect(() => {
    if (forceRefresh > 0) {
      console.log("🔄 Force refresh: Actualisation manuelle des données");
      callback();
    }
  }, [forceRefresh, callback]);

  return {
    isEnabled: autoRefreshEnabled,
    interval: autoRefreshInterval,
  };
}
