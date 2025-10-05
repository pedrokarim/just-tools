"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Eye,
  Clock,
  Globe,
  RefreshCw,
  TrendingUp,
  Activity,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { AdminLoading, LoadingButton } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

interface PageView {
  id: number;
  pagePath: string;
  timestamp: string;
  ipAddress?: string;
  country?: string;
  city?: string;
}

interface Visitor {
  id: number;
  fingerprint: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  recentViews: PageView[];
  totalViews: number;
  uniquePages: number;
}

interface VisitorsStats {
  totalVisitors: number;
  totalPageViews: number;
  averageVisitsPerVisitor: number;
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<VisitorsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const pagination = usePagination(stats?.totalVisitors || 0, 25);

  useEffect(() => {
    fetchVisitors();
  }, [pagination.page, pagination.pageSize]);

  const fetchVisitors = async () => {
    try {
      if (pagination.page === 1 && !refreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch(
        `/api/admin/visitors?page=${pagination.page}&size=${pagination.pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        setVisitors(data.visitors);
        setStats(data.stats);

        // Mettre à jour le total pour la pagination
        if (data.pagination) {
          pagination.setPage(data.pagination.page);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des visiteurs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Visiteurs</h1>
            <p className="text-muted-foreground">
              Analyse des visiteurs uniques
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <AdminLoading
            mode="full"
            message="Chargement des visiteurs..."
            submessage="Récupération des données d'analytics"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visiteurs</h1>
          <p className="text-muted-foreground">Analyse des visiteurs uniques</p>
        </div>

        <Button
          onClick={fetchVisitors}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Actualisation..." : "Actualiser"}
        </Button>
      </div>

      {/* Statistiques générales */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Visiteurs uniques
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisitors}</div>
              <p className="text-xs text-muted-foreground">
                Visiteurs uniques au total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total des vues
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPageViews}</div>
              <p className="text-xs text-muted-foreground">
                Vues de pages au total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Moyenne par visiteur
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageVisitsPerVisitor.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Vues moyennes par visiteur
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des visiteurs */}
      <Card>
        <CardHeader>
          <CardTitle>Visiteurs récents</CardTitle>
          <CardDescription>
            Détail des visiteurs uniques par ordre de dernière visite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {visitors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun visiteur enregistré
              </div>
            ) : (
              visitors.map((visitor, index) => (
                <div
                  key={visitor.id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {index +
                            1 +
                            (pagination.page - 1) * pagination.pageSize}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg font-mono">
                          {visitor.fingerprint.substring(0, 12)}...
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{visitor.totalViews} vues totales</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{visitor.uniquePages} pages uniques</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-4 w-4" />
                            <span>{visitor.visitCount} sessions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {(
                          (visitor.uniquePages / visitor.totalViews) *
                          100
                        ).toFixed(1)}
                        % unique
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        Dernière visite:{" "}
                        {formatDistanceToNow(new Date(visitor.lastVisit), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Informations temporelles */}
                  <div className="ml-12 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Première visite:
                      </span>
                      <div className="font-medium">
                        {new Date(visitor.firstVisit).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Dernière visite:
                      </span>
                      <div className="font-medium">
                        {new Date(visitor.lastVisit).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dernières vues */}
                  {visitor.recentViews.length > 0 && (
                    <div className="ml-12">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Dernières pages visitées :
                      </h4>
                      <div className="space-y-2">
                        {visitor.recentViews.map((view) => (
                          <div
                            key={view.id}
                            className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2"
                          >
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">
                                {view.pagePath}
                              </span>
                              {view.ipAddress && (
                                <span className="text-muted-foreground">
                                  {view.ipAddress}
                                </span>
                              )}
                              {view.country && (
                                <div className="flex items-center space-x-1">
                                  <Globe className="h-3 w-3" />
                                  <span>
                                    {view.country}
                                    {view.city && `, ${view.city}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(view.timestamp), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {stats && stats.totalVisitors > 0 && (
        <div className="mt-6">
          <PaginationControls
            pagination={pagination}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      )}
    </div>
  );
}
