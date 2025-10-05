"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Database, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

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
            result.error || "Erreur lors de la récupération des stats"
          );
        }
      } else if (response.status === 403) {
        toast.error(
          "Accès refusé : Seuls les administrateurs peuvent accéder à cette page"
        );
      } else {
        toast.error("Erreur lors de la récupération des statistiques");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
      toast.error("Erreur lors du chargement des statistiques");
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
        toast.error(result.error || "Erreur lors de la mise à jour du cache");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cache:", error);
      toast.error("Erreur lors de la mise à jour du cache");
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
        toast.error(result.error || "Erreur lors de l'initialisation");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      toast.error("Erreur lors de l'initialisation du service");
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchCacheStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Artefacts
          </h1>
          <p className="text-muted-foreground">
            Gestion du cache des données d'artefacts Genshin Impact
          </p>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Artefacts
          </h1>
          <p className="text-muted-foreground">
            Gestion du cache des données d'artefacts Genshin Impact
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCacheStats}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>

          <Separator orientation="vertical" className="h-6 bg-border" />

          <Button
            variant="default"
            size="sm"
            onClick={refreshCache}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 transition-colors ${
                refreshing ? "animate-spin text-blue-500" : ""
              }`}
            />
            {refreshing ? "Mise à jour..." : "Actualiser le cache"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={initializeService}
            disabled={initializing}
            className="flex items-center gap-2"
          >
            <Database
              className={`h-4 w-4 transition-colors ${
                initializing ? "animate-pulse" : ""
              }`}
            />
            {initializing ? "Initialisation..." : "Initialiser le service"}
          </Button>
        </div>
      </div>

      {/* Statistiques du cache */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sets d'artefacts en cache
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.artifactSetsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nombre de sets stockés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Statut du cache
            </CardTitle>
            {stats?.cacheValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={stats?.cacheValid ? "default" : "destructive"}>
                {stats?.cacheValid ? "Valide" : "Expiré"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cache valide pendant 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernière mise à jour
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats?.lastUpdated
                ? new Date(stats.lastUpdated).toLocaleString("fr-FR")
                : "Jamais"}
            </div>
            <p className="text-xs text-muted-foreground">
              Dernière synchronisation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informations sur le cache */}
      <Card>
        <CardHeader>
          <CardTitle>À propos du cache des artefacts</CardTitle>
          <CardDescription>
            Informations sur le système de cache des données d'artefacts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Fonctionnement</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Les données sont récupérées depuis l'API genshin-db</li>
                <li>• Stockage en base de données PostgreSQL</li>
                <li>• Cache valide pendant 24 heures</li>
                <li>• Fallback automatique vers les sets par défaut</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Actions disponibles</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <strong>Actualiser le cache</strong> : Force la mise à jour
                  depuis l'API
                </li>
                <li>
                  • <strong>Initialiser le service</strong> : Configure le cache
                  initial
                </li>
                <li>
                  • <strong>Actualiser</strong> : Recharge les statistiques
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Conseil
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Le cache se met à jour automatiquement quand les données sont
              demandées et qu'elles ne sont pas en cache. L'actualisation
              manuelle n'est nécessaire que pour forcer une mise à jour
              complète.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
