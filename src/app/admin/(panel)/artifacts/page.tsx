"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminLoading } from "@/components/ui/loading";
import { Stat, StatGrid } from "@/components/ui/loading-card";
import {
  formatDateTime,
  formatInteger,
  PageHeader,
  RefreshButton } from "@/components/admin/admin-page";
import { cn } from "@/lib/utils";

interface CacheStats {
  artifactSetsCount: number;
  cacheValid: boolean;
  lastUpdated?: string;
}

export default function AdminArtifactsPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const fetchCacheStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/artifacts/cache");

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        } else {
          toast.error(
            result.error ||
              "Impossible de lire les statistiques. Réessaie dans un instant."
          );
        }
      } else if (response.status === 403) {
        toast.error(
          "Accès refusé : seuls les administrateurs peuvent ouvrir cette page."
        );
      } else {
        toast.error(
          "Impossible de lire les statistiques. Réessaie dans un instant."
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
      toast.error(
        "Impossible de lire les statistiques. Vérifie ta connexion, puis réessaie."
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshCache = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/admin/artifacts/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "refresh" }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.data.message);
        // Recharger les stats
        await fetchCacheStats();
      } else {
        toast.error(
          result.error ||
            "Le cache n'a pas pu être mis à jour. Réessaie dans un instant."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cache:", error);
      toast.error(
        "Le cache n'a pas pu être mis à jour. Réessaie dans un instant."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const initializeService = async () => {
    try {
      setInitializing(true);
      const response = await fetch("/api/admin/artifacts/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "init" }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.data.message);
        // Recharger les stats
        await fetchCacheStats();
      } else {
        toast.error(
          result.error ||
            "Le service n'a pas pu démarrer. Réessaie dans un instant."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      toast.error("Le service n'a pas pu démarrer. Réessaie dans un instant.");
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchCacheStats();
  }, []);

  return (
    <>
      <PageHeader
        title="Artefacts"
        description="Le cache des données d'artefacts de Genshin Impact."
        actions={
          <>
            <RefreshButton
              onClick={fetchCacheStats}
              busy={loading}
              disabled={refreshing}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={initializeService}
              disabled={initializing || loading}
            >
              <Database aria-hidden />
              {initializing ? "Initialisation…" : "Initialiser le service"}
            </Button>
            <Button
              size="sm"
              onClick={refreshCache}
              disabled={refreshing || loading}
            >
              <RefreshCw
                className={cn(refreshing && "asc-animate-spin")}
                aria-hidden
              />
              {refreshing ? "Mise à jour…" : "Actualiser le cache"}
            </Button>
          </>
        }
      />

      {loading ? (
        <AdminLoading message="Lecture du cache des artefacts…" />
      ) : (
        <>
          {/* Statistiques du cache */}
          <StatGrid columns={3}>
            <Stat
              label="Sets en cache"
              value={formatInteger(stats?.artifactSetsCount || 0)}
            />
            <Stat
              label="État du cache"
              value={
                <Badge variant={stats?.cacheValid ? "success" : "warning"}>
                  {stats?.cacheValid ? "Valide" : "Expiré"}
                </Badge>
              }
              hint="Valable 24&nbsp;heures"
            />
            <Stat
              label="Dernière mise à jour"
              value={
                <span className="text-base font-semibold">
                  {stats?.lastUpdated
                    ? formatDateTime(stats.lastUpdated)
                    : "Jamais"}
                </span>
              }
            />
          </StatGrid>

          {/* Informations sur le cache */}
          <section className="border-border grid min-w-0 grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <h2 className="font-display text-fg text-base font-semibold tracking-tight">
                Fonctionnement
              </h2>
              <ul className="text-fg-muted ms-5 list-disc space-y-1 text-sm leading-relaxed">
                <li>Les données sont lues depuis la base de données.</li>
                <li>Le cache reste valable pendant 24&nbsp;heures.</li>
                <li>
                  Sans données, le site se rabat automatiquement sur les sets
                  par défaut.
                </li>
                <li>
                  Le cache se met à jour tout seul quand une donnée demandée
                  n&apos;y figure pas.
                </li>
              </ul>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <h2 className="font-display text-fg text-base font-semibold tracking-tight">
                Actions
              </h2>
              <ul className="text-fg-muted ms-5 list-disc space-y-1 text-sm leading-relaxed">
                <li>
                  <strong className="text-fg font-medium">
                    Actualiser le cache
                  </strong>{" "}
                  force une mise à jour complète depuis l&apos;API. Tu n&apos;en
                  as besoin que pour devancer la mise à jour automatique.
                </li>
                <li>
                  <strong className="text-fg font-medium">
                    Initialiser le service
                  </strong>{" "}
                  configure le cache initial.
                </li>
                <li>
                  <strong className="text-fg font-medium">Actualiser</strong>{" "}
                  recharge les statistiques de cette page.
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </>
  );
}
