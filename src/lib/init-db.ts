import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function initializeDatabases() {
  try {
    // Prisma s'occupe automatiquement de l'initialisation
    console.log("✅ Base de données Prisma initialisée avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la base de données:",
      error
    );
  }
}
