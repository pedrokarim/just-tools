"use client";

import { useEffect, useState } from "react";
import { useQueryState } from "nuqs";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from "@/components/ui/table";
import { LoadingButton } from "@/components/ui/loading";
import { StatCard, StatGrid, LoadingCard } from "@/components/ui/loading-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminSection,
  EmptyState,
  formatInteger,
  formatPercent,
  PageHeader } from "@/components/admin/admin-page";

interface AnalyticsStats {
  totalViews: number;
  uniqueVisitors: number;
  viewsByPage: Array<{ pagePath: string; count: number }>;
  last24hViews: number;
  last24hNewVisitors: number;
  viewsByHour: Array<{ hour: string; count: number }>;
}

// Une seule série sur les deux graphiques, et la même mesure : la même couleur.
const viewsConfig = {
  count: {
    label: "Vues",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

const CHART_HEIGHT = "h-64";

/** Un chemin tient dans la largeur réservée à l'axe ; l'infobulle le donne entier. */
function shortenPath(path: string): string {
  return path.length > 18 ? `${path.slice(0, 17)}…` : path;
}

function formatHour(hour: string | number): string {
  return `${hour} h`;
}

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

  const hourlyViews = stats?.viewsByHour ?? [];
  const pageViews = stats?.viewsByPage ?? [];
  // L'API complète les 24 heures par des zéros : une liste pleine peut être vide.
  const hasHourlyViews = hourlyViews.some((entry) => entry.count > 0);

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité du site."
        actions={
          <>
            <Select
              value={autoRefreshInterval}
              onValueChange={(value) => {
                setAutoRefreshInterval(value);
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-52"
                aria-label="Actualisation automatique"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Actualisation manuelle</SelectItem>
                <SelectItem value="10">Toutes les 10&nbsp;s</SelectItem>
                <SelectItem value="30">Toutes les 30&nbsp;s</SelectItem>
                <SelectItem value="60">Toutes les minutes</SelectItem>
                <SelectItem value="300">Toutes les 5&nbsp;min</SelectItem>
              </SelectContent>
            </Select>

            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => fetchStats(false)}
              loading={refreshing}
              loadingText="Actualisation…"
            >
              <RefreshCw aria-hidden />
              Actualiser
            </LoadingButton>

            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={clearAdminData}
              loading={clearing}
              loadingText="Nettoyage…"
            >
              <Trash2 aria-hidden />
              Nettoyer les données admin
            </LoadingButton>
          </>
        }
      />

      {/* Chiffres clés */}
      <StatGrid>
        <StatCard
          title="Vues au total"
          value={stats?.totalViews || 0}
          isLoading={loading}
        />
        <StatCard
          title="Visiteurs uniques"
          value={stats?.uniqueVisitors || 0}
          isLoading={loading}
        />
        <StatCard
          title="Vues sur 24&nbsp;h"
          value={stats?.last24hViews || 0}
          isLoading={loading}
        />
        <StatCard
          title="Nouveaux visiteurs sur 24&nbsp;h"
          value={stats?.last24hNewVisitors || 0}
          isLoading={loading}
        />
      </StatGrid>

      {/* Graphiques */}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <LoadingCard
          title="Vues par heure"
          description="Activité des dernières 24 heures."
          isLoading={loading}
          fallback={<Skeleton className={CHART_HEIGHT} />}
        >
          {hasHourlyViews ? (
            <ChartContainer
              config={viewsConfig}
              className={`aspect-auto w-full ${CHART_HEIGHT}`}
            >
              <LineChart
                data={hourlyViews}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={formatHour}
                />
                <YAxis
                  width={36}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent labelFormatter={formatHour} />}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <EmptyState
              title="Aucune vue sur 24 heures"
              description="La courbe se dessinera dès la prochaine visite."
            />
          )}
        </LoadingCard>

        <LoadingCard
          title="Pages les plus visitées"
          description="Les cinq premières, en nombre de vues."
          isLoading={loading}
          fallback={<Skeleton className={CHART_HEIGHT} />}
        >
          {pageViews.length > 0 ? (
            <ChartContainer
              config={viewsConfig}
              className={`aspect-auto w-full ${CHART_HEIGHT}`}
            >
              <BarChart
                data={pageViews.slice(0, 5)}
                layout="vertical"
                margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="pagePath"
                  width={124}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={shortenPath}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="max-w-64"
                      labelClassName="break-all"
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={4}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState
              title="Aucune page visitée"
              description="Le classement apparaîtra dès la première visite."
            />
          )}
        </LoadingCard>
      </div>

      {/* Tableau des pages */}
      <AdminSection
        title="Détail des pages"
        description="Les dix pages les plus vues et leur part de l'audience."
      >
        {loading ? (
          <Skeleton className="rounded-card h-48" />
        ) : pageViews.length === 0 ? (
          <EmptyState
            framed
            title="Aucune page à détailler"
            description="Les pages apparaîtront ici dès la première visite."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-end">Rang</TableHead>
                <TableHead>Page</TableHead>
                <TableHead className="text-end">Vues</TableHead>
                <TableHead className="text-end">Part</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageViews.map((page, index) => (
                <TableRow key={page.pagePath}>
                  <TableCell className="text-fg-subtle text-end tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell
                    className="max-w-[28rem] truncate font-mono text-[0.8125rem]"
                    title={page.pagePath}
                  >
                    {page.pagePath}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {formatInteger(page.count)}
                  </TableCell>
                  <TableCell className="text-fg-muted text-end tabular-nums">
                    {formatPercent(
                      stats?.totalViews
                        ? (page.count / stats.totalViews) * 100
                        : 0
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AdminSection>
    </>
  );
}
