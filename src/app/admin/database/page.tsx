"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  RefreshCw,
  Trash2,
  Download,
  Eye,
  FileText,
  Users,
  Shield,
  Calendar,
  Globe,
  Monitor,
  Hash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

export default function DatabasePage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const clearAllData = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer toutes les données ?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/database/clear-all", {
        method: "POST",
      });
      if (response.ok) {
        fetchDatabaseStats();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch("/api/admin/database/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `database-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
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
      icon: FileText,
      description: "Vues de pages enregistrées",
      color: "text-blue-600",
    },
    {
      name: "uniqueVisitor",
      count: stats?.totalUniqueVisitors || 0,
      icon: Users,
      description: "Visiteurs uniques",
      color: "text-green-600",
    },
    {
      name: "loginAttempt",
      count: stats?.totalLoginAttempts || 0,
      icon: Shield,
      description: "Tentatives de connexion",
      color: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement de la base de données...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base de données</h1>
          <p className="text-muted-foreground">
            Gestion et visualisation des données
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchDatabaseStats}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={clearAllData} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Vider
          </Button>
        </div>
      </div>

      {/* Vue d'ensemble des tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tables de la base de données
          </CardTitle>
          <CardDescription>
            Cliquez sur une table pour voir ses détails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Enregistrements</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => {
                const Icon = table.icon;
                return (
                  <TableRow
                    key={table.name}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${table.color}`} />
                        <span className="font-mono text-sm">{table.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{table.description}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {table.count.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTableClick(table.name)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] max-h-[90vh] w-full sm:max-w-[95vw]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Icon className={`h-5 w-5 ${table.color}`} />
                              Table: {table.name}
                            </DialogTitle>
                            <DialogDescription>
                              {table.description} -{" "}
                              {table.count.toLocaleString()} enregistrements
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-[70vh] w-full">
                            {detailsLoading ? (
                              <div className="flex items-center justify-center h-32">
                                <div className="text-lg">
                                  Chargement des détails...
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {tableDetails.length === 0 ? (
                                  <div className="text-center py-8 text-muted-foreground">
                                    Aucun enregistrement trouvé
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <Table className="min-w-full">
                                      <TableHeader>
                                        <TableRow>
                                          {Object.keys(
                                            tableDetails[0] || {}
                                          ).map((key) => (
                                            <TableHead
                                              key={key}
                                              className="text-xs whitespace-nowrap px-2 py-1"
                                            >
                                              {key}
                                            </TableHead>
                                          ))}
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
                                                    className="text-xs px-2 py-1 max-w-32"
                                                  >
                                                    {renderCellValue(
                                                      key,
                                                      value
                                                    )}
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
                                {(() => {
                                  console.log(
                                    "État pagination:",
                                    tablePagination
                                  );
                                  return null;
                                })()}
                                {tablePagination.total > 0 && (
                                  <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                      Affichage de{" "}
                                      {(tablePagination.page - 1) *
                                        tablePagination.pageSize +
                                        1}{" "}
                                      à{" "}
                                      {Math.min(
                                        tablePagination.page *
                                          tablePagination.pageSize,
                                        tablePagination.total
                                      )}{" "}
                                      sur{" "}
                                      {tablePagination.total.toLocaleString()}{" "}
                                      enregistrements
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
                                      <span className="text-sm">
                                        Page {tablePagination.page} sur{" "}
                                        {Math.ceil(
                                          tablePagination.total /
                                            tablePagination.pageSize
                                        )}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                          tablePagination.page >=
                                          Math.ceil(
                                            tablePagination.total /
                                              tablePagination.pageSize
                                          )
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
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistiques récentes */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Dernières vues de pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dernières vues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentPageViews.slice(0, 5).map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{view.pagePath}</div>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      {view.country || "Inconnu"}
                      {view.city && `, ${view.city}`}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(view.timestamp), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Derniers visiteurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Derniers visiteurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentVisitors.slice(0, 5).map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      <Hash className="h-3 w-3 inline mr-1" />
                      {visitor.fingerprint.slice(0, 8)}...
                    </div>
                    <div className="text-muted-foreground">
                      {visitor.visitCount} visites
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(visitor.lastVisit), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dernières tentatives de connexion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Dernières connexions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentLoginAttempts.slice(0, 5).map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {attempt.username || "Utilisateur inconnu"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={attempt.success ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {attempt.success ? "Réussi" : "Échoué"}
                      </Badge>
                      {attempt.country && (
                        <span className="text-muted-foreground text-xs">
                          {attempt.country}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(attempt.timestamp), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function renderCellValue(key: string, value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">null</span>;
  }

  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Oui" : "Non"}
      </Badge>
    );
  }

  if (key === "timestamp" || key === "firstVisit" || key === "lastVisit") {
    return (
      <div className="text-xs">
        <div>{new Date(value).toLocaleDateString("fr-FR")}</div>
        <div className="text-muted-foreground">
          {new Date(value).toLocaleTimeString("fr-FR")}
        </div>
      </div>
    );
  }

  if (key === "fingerprint") {
    return (
      <div className="font-mono text-xs">
        <Hash className="h-3 w-3 inline mr-1" />
        {String(value).slice(0, 12)}...
      </div>
    );
  }

  if (key === "userAgent") {
    return (
      <div className="text-xs max-w-32 truncate" title={String(value)}>
        {String(value)}
      </div>
    );
  }

  if (typeof value === "string" && value.length > 50) {
    return (
      <div className="text-xs max-w-32 truncate" title={value}>
        {value.slice(0, 50)}...
      </div>
    );
  }

  return <span className="text-xs">{String(value)}</span>;
}
