"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminLoading } from "@/components/ui/loading";
import {
  AdminSection,
  EmptyState,
  formatDateTime,
  formatInteger,
  formatLocation,
  PageHeader,
  RefreshButton,
  RelativeTime } from "@/components/admin/admin-page";

interface DatabaseStats {
  totalPageViews: number;
  totalUniqueVisitors: number;
  totalLoginAttempts: number;
  recentPageViews: Array<{
    id: number;
    pagePath: string;
    timestamp: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    fingerprint: string;
  }>;
  recentVisitors: Array<{
    id: number;
    fingerprint: string;
    firstVisit: string;
    lastVisit: string;
    visitCount: number;
  }>;
  recentLoginAttempts: Array<{
    id: number;
    discordId?: string;
    username?: string;
    email?: string;
    avatar?: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    success: boolean;
    reason?: string;
    timestamp: string;
  }>;
}

interface TableData {
  name: string;
  count: number;
  description: string;
}

/** Une liste courte des derniers événements, avec son état vide. */
function RecentList({
  title,
  emptyTitle,
  children,
}: {
  title: string;
  emptyTitle: string;
  children: React.ReactNode[];
}) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children.length > 0 ? (
          <ul className="divide-border divide-y">{children}</ul>
        ) : (
          <EmptyState title={emptyTitle} />
        )}
      </CardContent>
    </Card>
  );
}

function RecentItem({
  primary,
  secondary,
  title,
  timestamp,
}: {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  /** Le texte complet de `primary`, qui se tronque. */
  title?: string;
  timestamp: string;
}) {
  return (
    <li className="flex min-w-0 items-start justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="text-fg truncate font-medium" title={title}>
          {primary}
        </div>
        <div className="text-fg-muted flex min-w-0 flex-wrap items-center gap-2 text-[0.8125rem]">
          {secondary}
        </div>
      </div>
      <RelativeTime
        value={timestamp}
        className="text-fg-subtle shrink-0 text-xs"
      />
    </li>
  );
}

export default function DatabasePage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableDetails, setTableDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
  });

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/database/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableDetails = async (
    tableName: string,
    page = 1,
    pageSize = 25
  ) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/database/table/${tableName}?page=${page}&size=${pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Données reçues:", data);
        setTableDetails(data.records);
        setTablePagination({
          page: data.pagination.page,
          pageSize: data.pagination.pageSize,
          total: data.pagination.total,
        });
        console.log("Pagination mise à jour:", {
          page: data.pagination.page,
          pageSize: data.pagination.pageSize,
          total: data.pagination.total,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    setTablePagination({ page: 1, pageSize: 25, total: 0 });
    fetchTableDetails(tableName, 1, 25);
  };

  const tables: TableData[] = [
    {
      name: "pageView",
      count: stats?.totalPageViews || 0,
      description: "Vues de pages",
    },
    {
      name: "uniqueVisitor",
      count: stats?.totalUniqueVisitors || 0,
      description: "Visiteurs uniques",
    },
    {
      name: "loginAttempt",
      count: stats?.totalLoginAttempts || 0,
      description: "Tentatives de connexion",
    },
  ];

  const totalDetailPages = Math.ceil(
    tablePagination.total / tablePagination.pageSize
  );

  return (
    <>
      <PageHeader
        title="Base de données"
        description="Les tables du site et leurs derniers enregistrements."
        actions={
          <RefreshButton onClick={fetchDatabaseStats} busy={loading} />
        }
      />

      {loading ? (
        <AdminLoading message="Lecture de la base de données…" />
      ) : (
        <>
          {/* Vue d'ensemble des tables */}
          <AdminSection
            title="Tables"
            description="Ouvre une table pour parcourir ses enregistrements."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-end">Enregistrements</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell className="font-mono text-[0.8125rem]">
                      {table.name}
                    </TableCell>
                    <TableCell className="text-fg-muted">
                      {table.description}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatInteger(table.count)}
                    </TableCell>
                    <TableCell className="py-1 text-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTableClick(table.name)}
                          >
                            Voir
                            <span className="sr-only"> la table {table.name}</span>
                          </Button>
                        </DialogTrigger>
                        {/* La fenêtre est bornée à l'écran : seule la zone du
                            tableau défile, sur les deux axes, et la pagination
                            reste visible sous elle. */}
                        <DialogContent className="flex flex-col overflow-hidden sm:max-w-[min(72rem,calc(100vw-2rem))]">
                          <DialogHeader>
                            <DialogTitle>
                              Table{" "}
                              <span className="font-mono break-all">
                                {table.name}
                              </span>
                            </DialogTitle>
                            <DialogDescription>
                              {table.description},{" "}
                              <span className="tabular-nums">
                                {formatInteger(table.count)}
                              </span>{" "}
                              enregistrements.
                            </DialogDescription>
                          </DialogHeader>
                          {detailsLoading ? (
                            <AdminLoading
                              mode="compact"
                              message="Chargement des enregistrements…"
                            />
                          ) : (
                            <div className="flex min-h-0 flex-1 flex-col gap-4">
                              {tableDetails.length === 0 ? (
                                <EmptyState
                                  title="Aucun enregistrement"
                                  description="Cette table est vide pour l'instant."
                                />
                              ) : (
                                <div className="border-border rounded-card min-h-0 flex-1 overflow-auto border [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-1 [&>[data-slot=table-container]]:overflow-visible [&>[data-slot=table-container]]:rounded-none [&>[data-slot=table-container]]:border-0">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        {Object.keys(tableDetails[0] || {}).map(
                                          (key) => (
                                            <TableHead
                                              key={key}
                                              className="px-3 py-2 normal-case"
                                            >
                                              {key}
                                            </TableHead>
                                          )
                                        )}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {tableDetails
                                        .slice(0, 50)
                                        .map((record, index) => (
                                          <TableRow key={index}>
                                            {Object.entries(record).map(
                                              ([key, value]) => (
                                                <TableCell
                                                  key={key}
                                                  className="max-w-64 px-3 py-1.5 text-xs"
                                                >
                                                  {renderCellValue(key, value)}
                                                </TableCell>
                                              )
                                            )}
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                              {/* Pagination pour les détails de table */}
                              {tablePagination.total > 0 && (
                                <div className="border-border flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t pt-4">
                                  <div className="text-fg-muted text-sm tabular-nums">
                                    {(tablePagination.page - 1) *
                                      tablePagination.pageSize +
                                      1}{" "}
                                    à{" "}
                                    {Math.min(
                                      tablePagination.page *
                                        tablePagination.pageSize,
                                      tablePagination.total
                                    )}{" "}
                                    sur {formatInteger(tablePagination.total)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={tablePagination.page === 1}
                                      onClick={() =>
                                        fetchTableDetails(
                                          selectedTable!,
                                          tablePagination.page - 1,
                                          tablePagination.pageSize
                                        )
                                      }
                                    >
                                      Précédent
                                    </Button>
                                    <span className="text-fg-muted text-sm whitespace-nowrap tabular-nums">
                                      Page {tablePagination.page} sur{" "}
                                      {totalDetailPages}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={
                                        tablePagination.page >= totalDetailPages
                                      }
                                      onClick={() =>
                                        fetchTableDetails(
                                          selectedTable!,
                                          tablePagination.page + 1,
                                          tablePagination.pageSize
                                        )
                                      }
                                    >
                                      Suivant
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminSection>

          {/* Statistiques récentes */}
          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
            <RecentList title="Dernières vues" emptyTitle="Aucune vue enregistrée">
              {(stats?.recentPageViews ?? []).slice(0, 5).map((view) => (
                <RecentItem
                  key={view.id}
                  primary={view.pagePath}
                  title={view.pagePath}
                  secondary={formatLocation(view.country, view.city) ?? "Inconnu"}
                  timestamp={view.timestamp}
                />
              ))}
            </RecentList>

            <RecentList
              title="Derniers visiteurs"
              emptyTitle="Aucun visiteur enregistré"
            >
              {(stats?.recentVisitors ?? []).slice(0, 5).map((visitor) => (
                <RecentItem
                  key={visitor.id}
                  primary={
                    <span className="font-mono text-[0.8125rem]">
                      {visitor.fingerprint.slice(0, 8)}…
                    </span>
                  }
                  title={visitor.fingerprint}
                  secondary={
                    <span className="tabular-nums">
                      {formatInteger(visitor.visitCount)} visites
                    </span>
                  }
                  timestamp={visitor.lastVisit}
                />
              ))}
            </RecentList>

            <RecentList
              title="Dernières connexions"
              emptyTitle="Aucune tentative enregistrée"
            >
              {(stats?.recentLoginAttempts ?? []).slice(0, 5).map((attempt) => {
                const account = attempt.username || "Utilisateur inconnu";
                return (
                  <RecentItem
                    key={attempt.id}
                    primary={account}
                    title={account}
                    secondary={
                      <>
                        <Badge
                          variant={attempt.success ? "success" : "destructive"}
                        >
                          {attempt.success ? "Réussie" : "Refusée"}
                        </Badge>
                        {attempt.country && <span>{attempt.country}</span>}
                      </>
                    }
                    timestamp={attempt.timestamp}
                  />
                );
              })}
            </RecentList>
          </div>
        </>
      )}
    </>
  );
}

function renderCellValue(key: string, value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-fg-subtle font-mono">null</span>;
  }

  if (typeof value === "boolean") {
    return <Badge variant="secondary">{value ? "Oui" : "Non"}</Badge>;
  }

  if (key === "timestamp" || key === "firstVisit" || key === "lastVisit") {
    return <span className="tabular-nums">{formatDateTime(value)}</span>;
  }

  if (key === "fingerprint") {
    return (
      <span className="font-mono" title={String(value)}>
        {String(value).slice(0, 12)}…
      </span>
    );
  }

  if (key === "userAgent" || (typeof value === "string" && value.length > 50)) {
    return (
      <div className="truncate" title={String(value)}>
        {String(value)}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}
