"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X, Smartphone, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkInstallation = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isInstalled = (window.navigator as any).standalone || standalone;
      setIsStandalone(isInstalled);
      setIsInstalled(isInstalled);
    };

    checkInstallation();

    // Vérifier si le prompt a été fermé récemment (7 jours)
    const checkDismissed = () => {
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (dismissedDate > sevenDaysAgo) {
          return false; // Ne pas afficher
        } else {
          // Supprimer l'ancienne entrée
          localStorage.removeItem("pwa-prompt-dismissed");
        }
      }
      return true; // Afficher
    };

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Afficher le prompt après un délai si pas déjà fermé
      setTimeout(() => {
        if (!isInstalled && !isStandalone && checkDismissed()) {
          setShowInstallPrompt(true);
          // Animation d'entrée
          setTimeout(() => setIsVisible(true), 100);
        }
      }, 3000); // 3 secondes après le chargement
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("Utilisateur a accepté l'installation");
      setIsInstalled(true);
    } else {
      console.log("Utilisateur a refusé l'installation");
    }

    setDeferredPrompt(null);
    handleDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowInstallPrompt(false);
      // Ne plus afficher pendant 7 jours
      localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString());
    }, 300);
  };

  // Ne pas afficher si déjà installé
  if (isInstalled || isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95"
      }`}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-sm w-80 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm">Installer Just Tools</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs">Application native</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Accès rapide depuis votre écran d'accueil
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-950/50 rounded-lg">
            <Monitor className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs">Fonctionne hors ligne</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Utilisez les outils même sans connexion
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Installation rapide
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Smartphone className="w-3 h-3 mr-1" />
              Interface native
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1 text-xs"
          >
            Plus tard
          </Button>
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Installer
          </Button>
        </div>
      </div>
    </div>
  );
}
