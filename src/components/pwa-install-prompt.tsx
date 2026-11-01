"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { JustToolsMark } from "@/components/brand/just-tools-lockup";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISSED_KEY = "pwa-prompt-dismissed";
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 3000;

/** Vrai si l'invite a été refusée il y a moins de sept jours. */
function wasDismissedRecently() {
  try {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) return false;
    const limit = Date.now() - DISMISS_DAYS * 24 * 60 * 60 * 1000;
    if (new Date(dismissed).getTime() > limit) return true;
    localStorage.removeItem(DISMISSED_KEY);
  } catch {
    // Stockage indisponible : on propose, au pire une fois de trop.
  }
  return false;
}

function isInstalled() {
  const legacyStandalone = (window.navigator as { standalone?: boolean })
    .standalone;
  return (
    legacyStandalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

/**
 * L'invite d'installation, discrète et refusable. Elle attend que le navigateur
 * déclare l'installation possible, et se tait une semaine si on la ferme.
 */
export function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      if (isInstalled() || wasDismissedRecently()) return;
      timer = setTimeout(
        () => setInstallEvent(event as BeforeInstallPromptEvent),
        SHOW_DELAY_MS
      );
    };
    const onInstalled = () => setInstallEvent(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent) return null;

  const dismiss = () => {
    setInstallEvent(null);
    try {
      localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    } catch {
      // Sans stockage, l'invite reviendra à la prochaine visite.
    }
  };

  const install = async () => {
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <aside
      aria-label="Installer Just Tools"
      className="asc-animate-rise border-border bg-elevated shadow-pop rounded-card fixed right-4 bottom-4 left-4 z-(--z-overlay) flex flex-col gap-3 border p-4 sm:left-auto sm:w-80"
    >
      <div className="flex items-start gap-3">
        <JustToolsMark size={32} title="" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-fg text-sm font-semibold">Installer Just Tools</p>
          <p className="text-fg-muted text-[0.8125rem] leading-snug">
            Retrouve tes outils en un clic, dans leur propre fenêtre.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="text-fg-subtle hover:bg-surface hover:text-fg -me-1.5 -mt-1.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-sm"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={dismiss}>
          Plus tard
        </Button>
        <Button size="sm" onClick={install}>
          <Download aria-hidden="true" />
          Installer
        </Button>
      </div>
    </aside>
  );
}
