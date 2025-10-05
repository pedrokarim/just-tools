"use client";

import { useEffect, useState } from "react";
import { useQueryState } from "nuqs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Users, Eye, TrendingUp, Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AdminLoading, LoadingButton } from "@/components/ui/loading";
import { StatCard, LoadingCard } from "@/components/ui/loading-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface AnalyticsStats {
  totalViews: number;
  uniqueVisitors: number;
  viewsByPage: Array<{ pagePath: string; count: number }>;
  last24hViews: number;
  last24hNewVisitors: number;
  viewsByHour: Array<{ hour: string; count: number }>;
}

// Configuration des graphiques shadcn
const viewsByHourConfig = {
  count: {
    label: "Vues",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const viewsByPageConfig = {
  count: {
    label: "Vues",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Persister l'intervalle d'auto-refresh dans l'URL
  const [autoRefreshInterval, setAutoRefreshInterval] = useQueryState(
    "refresh",
    {
      defaultValue: "0",
      parse: (value) => value,
      serialize: (value) => value,
    }
  );

  const fetchStats = async (isInitialLoad = false) => {
    try {
      // Seulement mettre loading true pour le chargement initial
      if (isInitialLoad) {
        setLoading(true);
      } else {
        // Pour les refresh, mettre refreshing true
        setRefreshing(true);
      }

      const response = await fetch("/api/analytics/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        // Délai minimum de 3 secondes pour l'animation
        setTimeout(() => {
          setRefreshing(false);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    fetchStats(true); // Chargement initial avec loading
  }, []);

  // Auto-refresh simple sans loading
  useEffect(() => {
    const interval = parseInt(autoRefreshInterval);
    if (interval > 0) {
      const timer = setInterval(() => fetchStats(false), interval * 1000);
      return () => clearInterval(timer);
    }
  }, [autoRefreshInterval]);

  // Fonction pour nettoyer les données admin
  const clearAdminData = async () => {
    try {
      setClearing(true);
      const response = await fetch("/api/analytics/clear-admin-data", {
        method: "POST",
      });

      if (response.ok) {
        // Recharger les stats après nettoyage
        await fetchStats(true);
      } else {
        console.error("Erreur lors du nettoyage des données admin");
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage:", error);
    } finally {
      setClearing(false);
    }
  };

  // Plus de loading full, on affiche toujours la structure

  // Plus de gestion d'erreur séparée, on affiche toujours la structure

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de l'activité de votre site
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={autoRefreshInterval}
            onValueChange={(value) => {
              setAutoRefreshInterval(value);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Désactivé</SelectItem>
              <SelectItem value="10">10 secondes</SelectItem>
              <SelectItem value="30">30 secondes</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 bg-border" />

          <LoadingButton
            variant="outline"
            size="sm"
            onClick={() => fetchStats(false)}
            loading={refreshing}
            loadingText="Actualisation..."
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </LoadingButton>

          <Separator orientation="vertical" className="h-6 bg-border" />

          <LoadingButton
            variant="destructive"
            size="sm"
            onClick={clearAdminData}
            loading={clearing}
            loadingText="Nettoyage..."
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Nettoyer données admin
          </LoadingButton>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total des vues"
          value={stats?.totalViews || 0}
          description={`+${stats?.last24hViews || 0} ces dernières 24h`}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
          isLoading={loading}
        />

        <StatCard
          title="Visiteurs uniques"
          value={stats?.uniqueVisitors || 0}
          description={`+${
            stats?.last24hNewVisitors || 0
          } nouveaux aujourd'hui`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={loading}
        />

        <StatCard
          title="Vues 24h"
          value={stats?.last24hViews || 0}
          description="Vues des dernières 24 heures"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          isLoading={loading}
        />

        <StatCard
          title="Nouveaux visiteurs"
          value={stats?.last24hNewVisitors || 0}
          description="Nouveaux visiteurs aujourd'hui"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          isLoading={loading}
        />
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Vues par heure */}
        <LoadingCard
          title="Vues par heure (24h)"
          description="Activité des dernières 24 heures"
          isLoading={loading}
        >
          <ChartContainer
            config={viewsByHourConfig}
            className="min-h-[300px] w-full"
          >
            <LineChart data={stats?.viewsByHour || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </LoadingCard>

        {/* Vues par page */}
        <LoadingCard
          title="Pages les plus visitées"
          description="Top 5 des pages les plus populaires"
          isLoading={loading}
        >
          <ChartContainer
            config={viewsByPageConfig}
            className="min-h-[300px] w-full"
          >
            <BarChart data={stats?.viewsByPage?.slice(0, 5) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pagePath" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </LoadingCard>
      </div>

      {/* Tableau des pages */}
      <LoadingCard
        title="Détail des pages"
        description="Statistiques détaillées par page"
        isLoading={loading}
      >
        <div className="space-y-4">
          {stats?.viewsByPage?.map((page, index) => (
            <div
              key={page.pagePath}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{page.pagePath}</p>
                  <p className="text-sm text-muted-foreground">
                    <AnimatedCounter value={page.count} duration={1000} /> vues
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  <AnimatedCounter
                    value={
                      stats?.totalViews
                        ? (page.count / stats.totalViews) * 100
                        : 0
                    }
                    duration={1200}
                    decimals={1}
                    suffix="%"
                  />
                </p>
              </div>
            </div>
          )) || []}
        </div>
      </LoadingCard>
    </div>
  );
}
