"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Database,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading";

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [databaseType, setDatabaseType] = useState<string>("Chargement...");

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
        "Êtes-vous sûr de vouloir supprimer toutes les données analytics ? Cette action est irréversible."
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
          description:
            "Toutes les données analytics ont été supprimées avec succès.",
        });
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des analytics:", error);
      toast.error("Erreur lors de la suppression", {
        description:
          "Une erreur s'est produite lors de la suppression des données analytics.",
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
          description: "Les données analytics ont été exportées avec succès.",
        });
      } else {
        throw new Error("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Erreur lors de l'export des analytics:", error);
      toast.error("Erreur lors de l'export", {
        description:
          "Une erreur s'est produite lors de l'export des données analytics.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gestion des paramètres et données du système
        </p>
      </div>

      {/* Informations système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informations système
          </CardTitle>
          <CardDescription>
            Informations sur la configuration actuelle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium">Base de données</h4>
              <p className="text-sm text-muted-foreground">
                {databaseType} avec Prisma
              </p>
            </div>
            <div>
              <h4 className="font-medium">Authentification</h4>
              <p className="text-sm text-muted-foreground">Auth.js + Discord</p>
            </div>
            <div>
              <h4 className="font-medium">Framework</h4>
              <p className="text-sm text-muted-foreground">
                Next.js 15 + React 19
              </p>
            </div>
            <div>
              <h4 className="font-medium">Runtime</h4>
              <p className="text-sm text-muted-foreground">Bun</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestion des analytics
          </CardTitle>
          <CardDescription>
            Actions sur les données analytics collectées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export des données</h4>
              <p className="text-sm text-muted-foreground">
                Télécharger toutes les données analytics au format JSON
              </p>
            </div>
            <Button
              onClick={handleExportAnalytics}
              disabled={isExporting}
              variant="outline"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Export en cours..." : "Exporter"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Supprimer les données</h4>
              <p className="text-sm text-muted-foreground">
                Supprimer définitivement toutes les données analytics
              </p>
              <div className="flex items-center gap-2 mt-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">
                  Action irréversible
                </span>
              </div>
            </div>
            <Button
              onClick={handleClearAnalytics}
              disabled={isClearing}
              variant="destructive"
            >
              {isClearing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isClearing ? "Suppression..." : "Supprimer tout"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statut du tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Statut du tracking</CardTitle>
          <CardDescription>
            État du système de collecte des données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Tracking actif</span>
            <Badge variant="secondary">En ligne</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Le système collecte automatiquement les données de visite sur toutes
            les pages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
