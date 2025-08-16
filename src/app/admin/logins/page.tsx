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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  AlertTriangle,
  TrendingUp,
  Users,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/admin/pagination-controls";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des tentatives de connexion...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tentatives de connexion
          </h1>
          <p className="text-muted-foreground">
            Suivi des tentatives de connexion Discord
          </p>
        </div>

        <button
          onClick={fetchLoginAttempts}
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total des tentatives
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              <p className="text-xs text-muted-foreground">
                Tentatives au total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Connexions réussies
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.successfulAttempts}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.successRate.toFixed(1)}% de réussite
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tentatives échouées
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.failedAttempts}
              </div>
              <p className="text-xs text-muted-foreground">Accès refusés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dernières 24h
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last24hAttempts}</div>
              <p className="text-xs text-muted-foreground">
                Tentatives récentes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des tentatives */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des tentatives</CardTitle>
          <CardDescription>
            Historique des tentatives de connexion Discord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loginAttempts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune tentative de connexion enregistrée
              </div>
            ) : (
              loginAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={attempt.avatar}
                        alt={attempt.username || "Utilisateur"}
                      />
                      <AvatarFallback>
                        {attempt.username?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {attempt.username || "Utilisateur inconnu"}
                        </p>
                        <Badge
                          variant={attempt.success ? "default" : "destructive"}
                        >
                          {attempt.success ? "Réussi" : "Échoué"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {attempt.discordId && (
                          <span>ID: {attempt.discordId}</span>
                        )}
                        {attempt.email && <span>{attempt.email}</span>}
                        {attempt.country && (
                          <div className="flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            <span>{attempt.country}</span>
                            {attempt.city && <span>({attempt.city})</span>}
                          </div>
                        )}
                      </div>
                      {attempt.reason && (
                        <div className="flex items-center space-x-1 text-xs text-orange-600 mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{attempt.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{attempt.ipAddress}</div>
                    <div>
                      {formatDistanceToNow(new Date(attempt.timestamp), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {stats && stats.totalAttempts > 0 && (
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
