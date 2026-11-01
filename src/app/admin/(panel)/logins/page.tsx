"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  formatLocation,
  formatPercent,
  PageHeader,
  RefreshButton,
  RelativeTime } from "@/components/admin/admin-page";

interface LoginAttempt {
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
}

interface LoginStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  last24hAttempts: number;
  successRate: number;
}

export default function LoginsPage() {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [stats, setStats] = useState<LoginStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const pagination = usePagination(stats?.totalAttempts || 0, 25);

  useEffect(() => {
    fetchLoginAttempts();
    // La fonction n'est volontairement pas dans les dépendances : elle est
    // recréée à chaque rendu, donc l'y mettre relancerait l'effet en boucle.
    // Elle modifie de surcroît `refreshing`, dont elle dépend : la boucle
    // serait immédiate. L'effet doit se déclencher sur la pagination seule, et
    // la fonction lue à ce moment porte déjà les bonnes valeurs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize]);

  const fetchLoginAttempts = async () => {
    try {
      if (pagination.page === 1 && !refreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch(
        `/api/analytics/logins?page=${pagination.page}&size=${pagination.pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        setLoginAttempts(data.loginAttempts);
        setStats(data.stats);

        // Mettre à jour le total pour la pagination
        if (data.pagination) {
          pagination.setPage(data.pagination.page);
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des tentatives de connexion:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Connexions"
        description="Les tentatives de connexion au panneau, réussies ou refusées."
        actions={
          <RefreshButton
            onClick={fetchLoginAttempts}
            busy={refreshing}
            disabled={loading}
          />
        }
      />

      {loading ? (
        <AdminLoading message="Chargement des tentatives…" />
      ) : (
        <>
          {/* Statistiques générales */}
          {stats && (
            <StatGrid>
              <StatCard title="Tentatives au total" value={stats.totalAttempts} />
              <StatCard
                title="Réussies"
                value={stats.successfulAttempts}
                description={`${formatPercent(stats.successRate)} de réussite`}
              />
              <StatCard title="Refusées" value={stats.failedAttempts} />
              <StatCard title="Sur 24&nbsp;h" value={stats.last24hAttempts} />
            </StatGrid>
          )}

          {/* Liste des tentatives */}
          {loginAttempts.length === 0 ? (
            <EmptyState
              framed
              title="Aucune tentative enregistrée"
              description="Les connexions et les refus se consultent aussi dans le journal d'audit d'Ascencia ID."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compte</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Adresse IP</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginAttempts.map((attempt) => {
                  const account = attempt.username || "Utilisateur inconnu";
                  const details = [
                    attempt.email,
                    attempt.discordId && `ID : ${attempt.discordId}`,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarImage src={attempt.avatar} alt="" />
                            <AvatarFallback className="text-fg-muted text-xs font-semibold">
                              {attempt.username?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div
                              className="max-w-56 truncate font-medium"
                              title={account}
                            >
                              {account}
                            </div>
                            {details && (
                              <div
                                className="text-fg-muted max-w-56 truncate text-xs"
                                title={details}
                              >
                                {details}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={attempt.success ? "success" : "destructive"}
                        >
                          {attempt.success ? "Réussie" : "Refusée"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-fg-muted max-w-64 truncate"
                        title={attempt.reason}
                      >
                        {attempt.reason || "–"}
                      </TableCell>
                      <TableCell className="text-fg-muted">
                        {formatLocation(attempt.country, attempt.city) ?? "–"}
                      </TableCell>
                      <TableCell className="text-fg-muted font-mono text-xs tabular-nums">
                        {attempt.ipAddress || "–"}
                      </TableCell>
                      <TableCell className="text-fg-muted">
                        <RelativeTime value={attempt.timestamp} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {stats && stats.totalAttempts > 0 && (
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
