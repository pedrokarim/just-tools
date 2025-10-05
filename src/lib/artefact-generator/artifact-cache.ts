import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Types pour les données d'artefacts
export interface ArtifactSetData {
  name: string;
  description?: string;
  images?: {
    flower?: string;
    plume?: string;
    sands?: string;
    goblet?: string;
    circlet?: string;
  };
}

export interface ArtifactTypeData {
  name: string;
  mainStats: string[];
}

export interface SubStatData {
  name: string;
}

// Clés de cache
export const CACHE_KEYS = {
  ARTIFACT_SETS: "artifact_sets",
  ARTIFACT_TYPES: "artifact_types",
  SUB_STATS: "sub_stats",
} as const;

// Durée de cache (24 heures)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Vérifie si le cache est valide
 */
export async function isCacheValid(key: string): Promise<boolean> {
  try {
    const metadata = await prisma.cacheMetadata.findUnique({
      where: { key },
    });

    if (!metadata) return false;

    const now = new Date();
    const cacheAge = now.getTime() - metadata.lastUpdated.getTime();

    return cacheAge < CACHE_DURATION;
  } catch (error) {
    console.warn(`Erreur lors de la vérification du cache pour ${key}:`, error);
    return false;
  }
}

/**
 * Met à jour les métadonnées de cache
 */
export async function updateCacheMetadata(
  key: string,
  version?: string
): Promise<void> {
  try {
    await prisma.cacheMetadata.upsert({
      where: { key },
      update: {
        lastUpdated: new Date(),
        version,
      },
      create: {
        key,
        lastUpdated: new Date(),
        version,
      },
    });
  } catch (error) {
    console.warn(
      `Erreur lors de la mise à jour des métadonnées de cache pour ${key}:`,
      error
    );
  }
}

/**
 * Récupère tous les sets d'artefacts depuis la base de données
 */
export async function getCachedArtifactSets(): Promise<string[]> {
  try {
    const sets = await prisma.artifactSet.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    return sets.map((set) => set.name);
  } catch (error) {
    console.warn(
      "Erreur lors de la récupération des sets d'artefacts depuis la base:",
      error
    );
    return [];
  }
}

/**
 * Récupère les détails d'un set d'artefacts depuis la base de données
 */
export async function getCachedArtifactSetDetails(
  setName: string
): Promise<ArtifactSetData | null> {
  try {
    const set = await prisma.artifactSet.findUnique({
      where: { name: setName },
    });

    if (!set) return null;

    return {
      name: set.name,
      description: set.description || undefined,
      images: (set.images as any) || undefined,
    };
  } catch (error) {
    console.warn(
      `Erreur lors de la récupération des détails du set ${setName}:`,
      error
    );
    return null;
  }
}

/**
 * Sauvegarde un set d'artefacts en base de données
 */
export async function saveArtifactSet(data: ArtifactSetData): Promise<void> {
  try {
    await prisma.artifactSet.upsert({
      where: { name: data.name },
      update: {
        description: data.description,
        images: data.images,
        updatedAt: new Date(),
      },
      create: {
        name: data.name,
        description: data.description,
        images: data.images,
      },
    });
  } catch (error) {
    console.warn(`Erreur lors de la sauvegarde du set ${data.name}:`, error);
  }
}

/**
 * Sauvegarde plusieurs sets d'artefacts en base de données
 */
export async function saveArtifactSets(sets: ArtifactSetData[]): Promise<void> {
  try {
    for (const set of sets) {
      await saveArtifactSet(set);
    }
  } catch (error) {
    console.warn("Erreur lors de la sauvegarde des sets d'artefacts:", error);
  }
}

/**
 * Récupère tous les types d'artefacts depuis la base de données
 */
export async function getCachedArtifactTypes(): Promise<ArtifactTypeData[]> {
  try {
    const types = await prisma.artifactType.findMany({
      orderBy: { name: "asc" },
    });

    return types.map((type) => ({
      name: type.name,
      mainStats: type.mainStats as string[],
    }));
  } catch (error) {
    console.warn(
      "Erreur lors de la récupération des types d'artefacts depuis la base:",
      error
    );
    return [];
  }
}

/**
 * Sauvegarde un type d'artefact en base de données
 */
export async function saveArtifactType(data: ArtifactTypeData): Promise<void> {
  try {
    await prisma.artifactType.upsert({
      where: { name: data.name },
      update: {
        mainStats: data.mainStats,
        updatedAt: new Date(),
      },
      create: {
        name: data.name,
        mainStats: data.mainStats,
      },
    });
  } catch (error) {
    console.warn(`Erreur lors de la sauvegarde du type ${data.name}:`, error);
  }
}

/**
 * Récupère toutes les sous-stats depuis la base de données
 */
export async function getCachedSubStats(): Promise<string[]> {
  try {
    const subStats = await prisma.subStat.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    return subStats.map((stat) => stat.name);
  } catch (error) {
    console.warn(
      "Erreur lors de la récupération des sous-stats depuis la base:",
      error
    );
    return [];
  }
}

/**
 * Sauvegarde une sous-stat en base de données
 */
export async function saveSubStat(data: SubStatData): Promise<void> {
  try {
    await prisma.subStat.upsert({
      where: { name: data.name },
      update: {
        updatedAt: new Date(),
      },
      create: {
        name: data.name,
      },
    });
  } catch (error) {
    console.warn(
      `Erreur lors de la sauvegarde de la sous-stat ${data.name}:`,
      error
    );
  }
}

/**
 * Initialise le cache avec les données par défaut
 */
export async function initializeDefaultData(): Promise<void> {
  try {
    // Types d'artefacts par défaut
    const defaultTypes: ArtifactTypeData[] = [
      {
        name: "Fleur",
        mainStats: ["PV"],
      },
      {
        name: "Plume",
        mainStats: ["ATQ"],
      },
      {
        name: "Sablier",
        mainStats: ["ATQ %", "PV %", "DEF %", "RE", "ME"],
      },
      {
        name: "Coupe",
        mainStats: [
          "ATQ %",
          "PV %",
          "DEF %",
          "ME",
          "Pyro",
          "Hydro",
          "Cryo",
          "Électro",
          "Anémo",
          "Géo",
          "Physique",
        ],
      },
      {
        name: "Couronne",
        mainStats: ["TC", "DC", "ATQ %", "PV %", "DEF %", "ME", "Soins"],
      },
    ];

    // Sous-stats par défaut
    const defaultSubStats: SubStatData[] = [
      { name: "ATQ %" },
      { name: "PV %" },
      { name: "DEF %" },
      { name: "ATQ" },
      { name: "PV" },
      { name: "DEF" },
      { name: "TC" },
      { name: "DC" },
      { name: "RE" },
      { name: "ME" },
    ];

    // Sauvegarder les types d'artefacts
    for (const type of defaultTypes) {
      await saveArtifactType(type);
    }

    // Sauvegarder les sous-stats
    for (const subStat of defaultSubStats) {
      await saveSubStat(subStat);
    }

    console.log("Données par défaut initialisées avec succès");
  } catch (error) {
    console.warn(
      "Erreur lors de l'initialisation des données par défaut:",
      error
    );
  }
}

/**
 * Nettoie le cache expiré
 */
export async function cleanExpiredCache(): Promise<void> {
  try {
    const expiredKeys = await prisma.cacheMetadata.findMany({
      where: {
        lastUpdated: {
          lt: new Date(Date.now() - CACHE_DURATION),
        },
      },
    });

    for (const metadata of expiredKeys) {
      await prisma.cacheMetadata.delete({
        where: { id: metadata.id },
      });
    }

    console.log(`${expiredKeys.length} entrées de cache expirées supprimées`);
  } catch (error) {
    console.warn("Erreur lors du nettoyage du cache expiré:", error);
  }
}
