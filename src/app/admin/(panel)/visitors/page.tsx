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
  formatDateTime,
  formatInteger,
  formatLocation,
  PageHeader,
  RecentViewList,
  RefreshButton,
  RelativeTime } from "@/components/admin/admin-page";

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

/** Visiteur, vues, pages, sessions, deux dates et bouton de dépliage. */
const COLUMN_COUNT = 7;

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<VisitorsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const pagination = usePagination(stats?.totalVisitors || 0, 25);

  useEffect(() => {
    fetchVisitors();
    // La fonction n'est volontairement pas dans les dépendances : elle est
    // recréée à chaque rendu, donc l'y mettre relancerait l'effet en boucle.
    // Elle modifie de surcroît `refreshing`, dont elle dépend : la boucle
    // serait immédiate. L'effet doit se déclencher sur la pagination seule, et
    // la fonction lue à ce moment porte déjà les bonnes valeurs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <>
      <PageHeader
        title="Visiteurs"
        description="Les visiteurs uniques, du plus récent au plus ancien."
        actions={
          <RefreshButton
            onClick={fetchVisitors}
            busy={refreshing}
            disabled={loading}
          />
        }
      />

      {loading ? (
        <AdminLoading message="Chargement des visiteurs…" />
      ) : (
        <>
          {/* Statistiques générales */}
          {stats && (
            <StatGrid columns={3}>
              <StatCard title="Visiteurs uniques" value={stats.totalVisitors} />
              <StatCard title="Vues au total" value={stats.totalPageViews} />
              <StatCard
                title="Vues par visiteur"
                value={stats.averageVisitsPerVisitor}
                decimals={1}
              />
            </StatGrid>
          )}

          {/* Liste des visiteurs */}
          {visitors.length === 0 ? (
            <EmptyState
              framed
              title="Aucun visiteur enregistré"
              description="Les visiteurs apparaîtront ici dès la première visite enregistrée."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visiteur</TableHead>
                  <TableHead className="text-end">Vues</TableHead>
                  <TableHead className="text-end">Pages</TableHead>
                  <TableHead className="text-end">Sessions</TableHead>
                  <TableHead>Première visite</TableHead>
                  <TableHead>Dernière visite</TableHead>
                  <TableHead>
                    <span className="sr-only">Dernières pages visitées</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => (
                  <ExpandableTableRow
                    key={visitor.id}
                    colSpan={COLUMN_COUNT}
                    toggleLabel={`Dernières pages visitées par ${visitor.fingerprint.substring(0, 12)}`}
                    detail={
                      visitor.recentViews.length > 0 ? (
                        <RecentViewList
                          heading="Dernières pages visitées"
                          items={visitor.recentViews.map((view) => ({
                            id: view.id,
                            label: view.pagePath,
                            ipAddress: view.ipAddress,
                            location: formatLocation(view.country, view.city),
                            timestamp: view.timestamp,
                          }))}
                        />
                      ) : null
                    }
                  >
                    <TableCell
                      className="font-mono text-[0.8125rem]"
                      title={visitor.fingerprint}
                    >
                      {visitor.fingerprint.substring(0, 12)}…
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatInteger(visitor.totalViews)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatInteger(visitor.uniquePages)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatInteger(visitor.visitCount)}
                    </TableCell>
                    <TableCell className="text-fg-muted tabular-nums">
                      {formatDateTime(visitor.firstVisit)}
                    </TableCell>
                    <TableCell className="text-fg-muted">
                      <RelativeTime value={visitor.lastVisit} />
                    </TableCell>
                  </ExpandableTableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {stats && stats.totalVisitors > 0 && (
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
