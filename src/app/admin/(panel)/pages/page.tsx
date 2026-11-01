"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { AdminLoading } from "@/components/ui/loading";
import { StatCard, StatGrid } from "@/components/ui/loading-card";
import {
  EmptyState,
  ExpandableTableRow,
  formatInteger,
  formatLocation,
  PageHeader,
  RecentViewList,
  RefreshButton,
  RelativeTime } from "@/components/admin/admin-page";

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

/** Rang, page, vues, visiteurs, dernière visite et bouton de dépliage. */
const COLUMN_COUNT = 6;

export default function PagesPage() {
  const [pages, setPages] = useState<PageStats[]>([]);
  const [stats, setStats] = useState<PagesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const pagination = usePagination(stats?.uniquePages || 0, 25);

  useEffect(() => {
    fetchPages();
    // La fonction n'est volontairement pas dans les dépendances : elle est
    // recréée à chaque rendu, donc l'y mettre relancerait l'effet en boucle.
    // Elle modifie de surcroît `refreshing`, dont elle dépend : la boucle
    // serait immédiate. L'effet doit se déclencher sur la pagination seule, et
    // la fonction lue à ce moment porte déjà les bonnes valeurs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <>
      <PageHeader
        title="Pages"
        description="Les pages du site, de la plus vue à la moins vue."
        actions={
          <RefreshButton
            onClick={fetchPages}
            busy={refreshing}
            disabled={loading}
          />
        }
      />

      {loading ? (
        <AdminLoading message="Chargement des pages…" />
      ) : (
        <>
          {/* Statistiques générales */}
          {stats && (
            <StatGrid columns={2}>
              <StatCard title="Vues au total" value={stats.totalPages} />
              <StatCard title="Pages différentes" value={stats.uniquePages} />
            </StatGrid>
          )}

          {/* Liste des pages */}
          {pages.length === 0 ? (
            <EmptyState
              framed
              title="Aucune page visitée"
              description="Les pages apparaîtront ici dès la première visite enregistrée."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-end">Rang</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-end">Vues</TableHead>
                  <TableHead className="text-end">Visiteurs</TableHead>
                  <TableHead>Dernière visite</TableHead>
                  <TableHead>
                    <span className="sr-only">Dernières vues</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page, index) => (
                  <ExpandableTableRow
                    key={page.pagePath}
                    colSpan={COLUMN_COUNT}
                    toggleLabel={`Dernières vues de ${page.pagePath}`}
                    detail={
                      page.recentViews.length > 0 ? (
                        <RecentViewList
                          heading="Dernières vues"
                          items={page.recentViews.map((view) => ({
                            id: view.id,
                            label: (
                              <span className="font-mono text-xs">
                                {view.fingerprint.substring(0, 8)}…
                              </span>
                            ),
                            ipAddress: view.ipAddress,
                            location: formatLocation(view.country, view.city),
                            timestamp: view.timestamp,
                          }))}
                        />
                      ) : null
                    }
                  >
                    <TableCell className="text-fg-subtle text-end tabular-nums">
                      {index + 1 + (pagination.page - 1) * pagination.pageSize}
                    </TableCell>
                    <TableCell
                      className="max-w-[28rem] truncate font-mono text-[0.8125rem]"
                      title={page.pagePath}
                    >
                      {page.pagePath}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatInteger(page.viewCount)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatInteger(page.uniqueVisitors)}
                    </TableCell>
                    <TableCell className="text-fg-muted">
                      <RelativeTime value={page.lastVisit} />
                    </TableCell>
                  </ExpandableTableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {stats && stats.uniquePages > 0 && (
            <PaginationControls
              pagination={pagination}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          )}
        </>
      )}
    </>
  );
}
