"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminSection, PageHeader } from "@/components/admin/admin-page";

const ROW = "flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4";

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [databaseType, setDatabaseType] = useState<string>("Chargement…");

  useEffect(() => {
    // Récupérer le type de base de données depuis l'API
    fetch("/api/admin/database-info")
      .then((res) => res.json())
      .then((data) => setDatabaseType(data.type))
      .catch(() => setDatabaseType("Inconnu"));
  }, []);

  const handleClearAnalytics = async () => {
    if (
      !confirm(
        "Supprimer toutes les données analytics ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch("/api/analytics/clear", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Données analytics supprimées", {
          description: "Toutes les données analytics ont été supprimées.",
        });
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des analytics:", error);
      toast.error("Suppression impossible", {
        description:
          "Les données analytics n'ont pas été supprimées. Réessaie dans un instant.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportAnalytics = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/analytics/export");

      if (response.ok) {
        const data = await response.json();

        // Créer et télécharger le fichier JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Export réussi", {
          description: "Les données analytics ont été exportées.",
        });
      } else {
        throw new Error("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Erreur lors de l'export des analytics:", error);
      toast.error("Export impossible", {
        description:
          "Les données analytics n'ont pas été exportées. Réessaie dans un instant.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Paramètres"
        description="La configuration du site et les données qu'il collecte."
      />

      {/* Informations système */}
      <AdminSection title="Système">
        <dl className="border-border bg-elevated rounded-card divide-border divide-y border text-sm">
          {[
            { label: "Base de données", value: `${databaseType} avec Prisma` },
            { label: "Authentification", value: "Ascencia ID" },
            { label: "Framework", value: "Next.js 15 et React 19" },
            { label: "Environnement d'exécution", value: "Bun" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-0.5 px-5 py-3"
            >
              <dt className="text-fg-muted w-56 max-w-full shrink-0">{label}</dt>
              <dd className="text-fg min-w-0 flex-[1_1_10rem] break-words">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </AdminSection>

      {/* Gestion des analytics */}
      <AdminSection
        title="Données analytics"
        description="Les visites collectées par le site."
      >
        <div className="border-border bg-elevated rounded-card divide-border divide-y border">
          <div className={ROW}>
            <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-0.5">
              <h3 className="text-fg font-sans text-sm font-medium tracking-normal">
                Suivi des visites
              </h3>
              <p className="text-fg-muted text-sm leading-relaxed">
                Le site collecte automatiquement les données de visite sur toutes
                les pages.
              </p>
            </div>
            <Badge variant="success">Actif</Badge>
          </div>

          <div className={ROW}>
            <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-0.5">
              <h3 className="text-fg font-sans text-sm font-medium tracking-normal">
                Exporter les données
              </h3>
              <p className="text-fg-muted text-sm leading-relaxed">
                Télécharge toutes les données analytics au format JSON.
              </p>
            </div>
            <Button
              onClick={handleExportAnalytics}
              disabled={isExporting}
              variant="outline"
            >
              {isExporting ? (
                <Loader2 className="asc-animate-spin" aria-hidden />
              ) : (
                <Download aria-hidden />
              )}
              {isExporting ? "Export en cours…" : "Exporter"}
            </Button>
          </div>

          <div className={ROW}>
            <div className="flex min-w-0 flex-[1_1_16rem] flex-col items-start gap-1">
              <h3 className="text-fg font-sans text-sm font-medium tracking-normal">
                Supprimer les données
              </h3>
              <p className="text-fg-muted text-sm leading-relaxed">
                Supprime définitivement toutes les données analytics.
              </p>
              <Badge variant="warning">Action irréversible</Badge>
            </div>
            <Button
              onClick={handleClearAnalytics}
              disabled={isClearing}
              variant="destructive"
            >
              {isClearing ? (
                <Loader2 className="asc-animate-spin" aria-hidden />
              ) : (
                <Trash2 aria-hidden />
              )}
              {isClearing ? "Suppression…" : "Tout supprimer"}
            </Button>
          </div>
        </div>
      </AdminSection>
    </>
  );
}
