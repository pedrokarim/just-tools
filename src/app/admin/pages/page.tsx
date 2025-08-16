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
  FileText,
  Eye,
  Users,
  Clock,
  Globe,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/admin/pagination-controls";

interface PageView {
  id: number;
  timestamp: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  fingerprint: string;
}

interface PageStats {
  pagePath: string;
  viewCount: number;
  uniqueVisitors: number;
  lastVisit: string;
  recentViews: PageView[];
}

interface PagesStats {
  totalPages: number;
  uniquePages: number;
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageStats[]>([]);
  const [stats, setStats] = useState<PagesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const pagination = usePagination(stats?.uniquePages || 0, 25);

  useEffect(() => {
    fetchPages();
  }, [pagination.page, pagination.pageSize]);

  const fetchPages = async () => {
    try {
      if (pagination.page === 1 && !refreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch(
        `/api/admin/pages?page=${pagination.page}&size=${pagination.pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages);
        setStats(data.stats);

        // Mettre à jour le total pour la pagination
        if (data.pagination) {
          pagination.setPage(data.pagination.page);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pages:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des pages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages visitées</h1>
          <p className="text-muted-foreground">
            Analyse des pages les plus populaires
          </p>
        </div>

        <button
          onClick={fetchPages}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 transition-colors ${
              refreshing
                ? "animate-spin text-blue-500"
                : "text-muted-foreground"
            }`}
          />
          {refreshing ? "Actualisation..." : "Actualiser"}
        </button>
      </div>

      {/* Statistiques générales */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total des vues
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPages}</div>
              <p className="text-xs text-muted-foreground">
                Vues de pages au total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pages uniques
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniquePages}</div>
              <p className="text-xs text-muted-foreground">
                Pages différentes visitées
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des pages */}
      <Card>
        <CardHeader>
          <CardTitle>Pages les plus visitées</CardTitle>
          <CardDescription>
            Classement des pages par nombre de vues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune page visitée enregistrée
              </div>
            ) : (
              pages.map((page, index) => (
                <div
                  key={page.pagePath}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index +
                            1 +
                            (pagination.page - 1) * pagination.pageSize}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{page.pagePath}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{page.viewCount} vues</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{page.uniqueVisitors} visiteurs uniques</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Dernière visite:{" "}
                              {formatDistanceToNow(new Date(page.lastVisit), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {((page.uniqueVisitors / page.viewCount) * 100).toFixed(
                        1
                      )}
                      % unique
                    </Badge>
                  </div>

                  {/* Dernières vues */}
                  {page.recentViews.length > 0 && (
                    <div className="ml-12">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Dernières vues :
                      </h4>
                      <div className="space-y-2">
                        {page.recentViews.map((view) => (
                          <div
                            key={view.id}
                            className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2"
                          >
                            <div className="flex items-center space-x-4">
                              <span className="font-mono text-xs">
                                {view.fingerprint.substring(0, 8)}...
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
      {stats && stats.uniquePages > 0 && (
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
