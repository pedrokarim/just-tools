"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface LaunchParams {
  targetURL?: string;
  files?: unknown[];
}

declare global {
  interface Window {
    launchQueue?: {
      setConsumer: (consumer: (params: LaunchParams) => void) => void;
    };
  }
}

/**
 * Gère les lancements de la PWA installée.
 *
 * Le manifeste déclare `launch_handler.client_mode = "focus-existing"` : quand
 * l'application est déjà ouverte, un nouveau lancement (raccourci Windows,
 * client de raccourci clavier, lien) ne recharge pas la fenêtre — l'URL cible
 * arrive ici via `launchQueue`.
 *
 * C'est aussi ce qui rend la lecture automatique fiable : le document conservant
 * son interaction utilisateur passée, Chromium n'oppose pas sa politique
 * d'autoplay à `speechSynthesis.speak()`.
 */
export function LaunchHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !window.launchQueue) return;

    window.launchQueue.setConsumer((params) => {
      if (!params?.targetURL) return;

      let target: URL;
      try {
        target = new URL(params.targetURL);
      } catch {
        return;
      }

      if (target.origin !== window.location.origin) return;

      if (target.pathname !== window.location.pathname) {
        router.push(`${target.pathname}${target.search}${target.hash}`);
        return;
      }

      // Déjà sur la bonne page : transmettre les paramètres sans navigation.
      window.dispatchEvent(
        new CustomEvent("just-tools:launch", { detail: target.search })
      );
    });
  }, [router]);

  return null;
}
