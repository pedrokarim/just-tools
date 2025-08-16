"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fonction pour générer un fingerprint unique basé sur les caractéristiques du navigateur
function generateFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return "unknown";

  // Dessiner du texte pour générer un fingerprint unique
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillText("Fingerprint", 2, 2);

  // Combiner plusieurs caractéristiques pour un fingerprint plus unique
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || "unknown",
    (navigator as any).deviceMemory || "unknown",
    navigator.platform,
  ].join("|");

  // Créer un hash simple
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

// Fonction pour vérifier si une page doit être exclue du tracking
function shouldExcludePage(pathname: string): boolean {
  const excludedPaths = [
    // Pages admin
    "/admin",
    "/admin/login",
    "/admin/access-denied",
    "/admin/logins",
    // Pages API
    "/api",
    // Pages d'erreur
    "/404",
    "/500",
    // Autres pages sensibles
    "/_next",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json",
    "/sw.js",
  ];

  // Vérifier si le pathname commence par un des chemins exclus
  return excludedPaths.some((excludedPath) =>
    pathname.startsWith(excludedPath)
  );
}

// Fonction pour obtenir la géolocalisation (DÉSACTIVÉE TEMPORAIREMENT)
async function getLocationData(): Promise<{ country?: string; city?: string }> {
  // DÉSACTIVÉ - Retourner des valeurs par défaut
  return {
    country: "Unknown",
    city: "Unknown",
  };

  // TODO: Implémenter une meilleure API de géolocalisation
  // try {
  //   const response = await fetch("/api/geolocation");
  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }
  //   const data = await response.json();
  //   return {
  //     country: data.country,
  //     city: data.city,
  //   };
  // } catch (error) {
  //   console.error(
  //     "Erreur lors de la récupération de la géolocalisation:",
  //     error
  //   );
  //   return {};
  // }
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const recordPageView = async () => {
      try {
        // Vérifier si la page doit être exclue du tracking
        if (shouldExcludePage(pathname)) {
          console.log(`Page exclue du tracking: ${pathname}`);
          return;
        }

        // Générer le fingerprint
        const fingerprint = generateFingerprint();

        // Récupérer les données de géolocalisation (désactivée)
        const locationData = await getLocationData();

        // Préparer les données à envoyer
        const analyticsData = {
          pagePath: pathname,
          fingerprint,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          ...locationData,
        };

        // Envoyer les données à notre API
        const response = await fetch("/api/analytics/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(analyticsData),
        });

        if (!response.ok) {
          console.error("Erreur lors de l'enregistrement de la vue de page");
        }
      } catch (error) {
        console.error("Erreur lors du tracking analytics:", error);
      }
    };

    // Enregistrer la vue de page quand le pathname change
    if (pathname) {
      recordPageView();
    }
  }, [pathname]);

  // Ce composant ne rend rien visuellement
  return null;
}
