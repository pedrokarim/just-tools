import { PrismaClient } from "@prisma/client";

// Configuration Prisma avec gestion d'erreurs robuste
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });
};

// Singleton pattern pour éviter les connexions multiples
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Initialisation unique au démarrage du serveur
let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) {
    return;
  }

  try {
    await prisma.$connect();
    console.log("✅ Base de données Prisma initialisée avec succès");
    isInitialized = true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la base de données:",
      error
    );
    throw error;
  }
}

// Gestion propre de la fermeture
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Initialisation automatique côté serveur
if (typeof window === "undefined") {
  initializeDatabase().catch(console.error);
}
