/**
 * Configuration dynamique de base de données
 * Détecte automatiquement le type de base de données depuis la DATABASE_URL
 */

export type DatabaseType = "sqlite" | "postgresql";

export function getDatabaseType(): DatabaseType {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL n'est pas définie dans les variables d'environnement"
    );
  }

  if (databaseUrl.startsWith("file:") || databaseUrl.startsWith("sqlite:")) {
    return "sqlite";
  }

  if (
    databaseUrl.startsWith("postgresql:") ||
    databaseUrl.startsWith("postgres:")
  ) {
    return "postgresql";
  }

  // Par défaut, on assume PostgreSQL pour les URLs complexes
  return "postgresql";
}

export function getDatabaseProvider(): string {
  return getDatabaseType() === "sqlite" ? "sqlite" : "postgresql";
}

export function isPostgreSQL(): boolean {
  return getDatabaseType() === "postgresql";
}

export function isSQLite(): boolean {
  return getDatabaseType() === "sqlite";
}

// Configuration pour BetterAuth
export function getBetterAuthDatabaseConfig() {
  const dbType = getDatabaseType();

  return {
    provider: dbType,
    // Configuration spécifique si nécessaire
    ...(dbType === "postgresql" &&
      {
        // Options spécifiques à PostgreSQL si nécessaire
      }),
    ...(dbType === "sqlite" &&
      {
        // Options spécifiques à SQLite si nécessaire
      }),
  };
}
