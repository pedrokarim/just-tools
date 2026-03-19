// genshin-db supprimé - utilisation uniquement de la base de données
import { prisma } from "../prisma";
import {
  getCachedArtifactSets,
  getCachedArtifactSetDetails,
  saveArtifactSets,
  isCacheValid,
  updateCacheMetadata,
  initializeDefaultData,
  CACHE_KEYS,
  type ArtifactSetData,
} from "./artifact-cache";

// Sets d'artefacts par défaut (fallback)
const DEFAULT_ARTIFACT_SETS = [
  "Gladiator's Finale",
  "Wanderer's Troupe",
  "Noblesse Oblige",
  "Bloodstained Chivalry",
  "Viridescent Venerer",
  "Crimson Witch of Flames",
  "Thundering Fury",
  "Blizzard Strayer",
  "Heart of Depth",
  "Pale Flame",
  "Tenacity of the Millelith",
  "Shimenawa's Reminiscence",
  "Emblem of Severed Fate",
  "Husk of Opulent Dreams",
  "Ocean-Hued Clam",
  "Vermillion Hereafter",
  "Echoes of an Offering",
  "Deepwood Memories",
  "Gilded Dreams",
  "Desert Pavilion Chronicle",
  "Flower of Paradise Lost",
  "Nymph's Dream",
  "Vourukasha's Glow",
  "Marechaussee Hunter",
  "Golden Troupe",
  "Song of Days Past",
  "Nighttime Whispers in the Echoing Woods",
  "Fragment of Harmonic Whimsy",
  "Unfinished Reverie",
  "Deathly Statuette",
];

/**
 * Récupère les sets d'artefacts depuis la base de données
 * (genshin-db n'est plus utilisé - données extraites via le script)
 */
async function fetchArtifactSetsFromDatabase(): Promise<ArtifactSetData[]> {
  try {
    const artifactSets = await prisma.artifactSet.findMany({
      orderBy: { name: "asc" },
    });

    return artifactSets.map((set) => {
      const images = set.images as Record<string, string> | null;
      return {
        name: set.name,
        description: set.description || undefined,
        images: images
          ? {
              flower: images.flower || undefined,
              plume: images.plume || undefined,
              sands: images.sands || undefined,
              goblet: images.goblet || undefined,
              circlet: images.circlet || undefined,
            }
          : undefined,
      };
    });
  } catch (error) {
    console.warn(
      "Erreur lors de la récupération des sets depuis la base de données:",
      error
    );
    throw error;
  }
}

/**
 * Récupère les sets d'artefacts disponibles (cache + API si nécessaire)
 */
export async function getAvailableArtifactSets(): Promise<string[]> {
  try {
    // 1. D'abord, essayer de récupérer depuis le cache (même expiré)
    const cachedSets = await getCachedArtifactSets();
    if (cachedSets.length > 0) {
      console.log(`Récupération de ${cachedSets.length} sets depuis le cache`);
      return cachedSets;
    }

    // 2. Si pas en cache, récupérer depuis la base de données
    console.log(
      "Aucun set en cache, récupération depuis la base de données..."
    );
    try {
      const dbSets = await fetchArtifactSetsFromDatabase();

      if (dbSets.length > 0) {
        // Sauvegarder en cache
        await saveArtifactSets(dbSets);
        await updateCacheMetadata(CACHE_KEYS.ARTIFACT_SETS, "1.0");

        console.log(`${dbSets.length} sets sauvegardés en cache`);
        return dbSets.map((set) => set.name);
      }
    } catch (dbError) {
      console.warn(
        "Erreur base de données, utilisation des sets par défaut:",
        dbError
      );
    }

    // 3. Dernier recours : sets par défaut
    console.log("Utilisation des sets par défaut");
    return DEFAULT_ARTIFACT_SETS;
  } catch (error) {
    console.warn("Erreur lors de la récupération des sets d'artefacts:", error);
    return DEFAULT_ARTIFACT_SETS;
  }
}

/**
 * Récupère les détails d'un set d'artefacts (cache + API si nécessaire)
 */
export async function getArtifactSetDetails(setName: string): Promise<any> {
  try {
    // 1. D'abord, essayer de récupérer depuis le cache (même expiré)
    const cachedDetails = await getCachedArtifactSetDetails(setName);
    if (cachedDetails) {
      console.log(`Set ${setName} trouvé en cache`);
      return cachedDetails;
    }

    // 2. Si pas en cache, récupérer depuis la base de données
    console.log(
      `Set ${setName} non trouvé en cache, récupération depuis la base de données...`
    );
    try {
      const dbDetails = await prisma.artifactSet.findUnique({
        where: { name: setName },
      });

      if (dbDetails) {
        console.log(`📊 Détails trouvés en base pour ${setName}:`, {
          name: dbDetails.name,
          description: dbDetails.description,
          images: dbDetails.images,
        });

        // Sauvegarder en cache pour la prochaine fois
        const dbImages = dbDetails.images as Record<string, string> | null;
        const artifactSetData: ArtifactSetData = {
          name: setName,
          description: dbDetails.description || undefined,
          images: dbImages
            ? {
                flower: dbImages.flower || undefined,
                plume: dbImages.plume || undefined,
                sands: dbImages.sands || undefined,
                goblet: dbImages.goblet || undefined,
                circlet: dbImages.circlet || undefined,
              }
            : undefined,
        };

        await saveArtifactSets([artifactSetData]);
        await updateCacheMetadata(CACHE_KEYS.ARTIFACT_SETS, "1.0");

        console.log(`Set ${setName} sauvegardé en cache`);
        return dbDetails;
      }
    } catch (dbError) {
      console.warn(`Erreur base de données pour le set ${setName}:`, dbError);
    }

    // 3. Fallback avec des données par défaut si la base de données est vide
    console.log(`Création de données de fallback pour le set ${setName}`);
    const fallbackData = {
      name: setName,
      description: `Set d'artefacts ${setName}`,
      images: {
        flower: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🌸`,
        plume: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🪶`,
        sands: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=⏳`,
        goblet: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🏺`,
        circlet: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=👑`,
      },
    };

    // Essayer de sauvegarder en base de données pour la prochaine fois
    try {
      await prisma.artifactSet.upsert({
        where: { name: setName },
        update: {
          description: fallbackData.description,
          images: fallbackData.images,
          updatedAt: new Date(),
        },
        create: {
          name: setName,
          description: fallbackData.description,
          images: fallbackData.images,
        },
      });
      console.log(`Set ${setName} sauvegardé en base avec données de fallback`);
    } catch (saveError) {
      console.warn(
        `Erreur lors de la sauvegarde du fallback pour ${setName}:`,
        saveError
      );
    }

    return fallbackData;
  } catch (error) {
    console.warn(
      `Erreur lors de la récupération des détails du set ${setName}:`,
      error
    );
    return null;
  }
}

/**
 * Force la mise à jour du cache depuis la base de données
 */
export async function refreshArtifactCache(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    console.log("Mise à jour forcée du cache des artefacts...");

    const dbSets = await fetchArtifactSetsFromDatabase();

    if (dbSets.length > 0) {
      await saveArtifactSets(dbSets);
      await updateCacheMetadata(CACHE_KEYS.ARTIFACT_SETS, "1.0");

      console.log(`Cache mis à jour avec ${dbSets.length} sets`);
      return { success: true, count: dbSets.length };
    }

    return {
      success: false,
      count: 0,
      error: "Aucun set récupéré depuis la base de données",
    };
  } catch (error) {
    console.warn("Erreur lors de la mise à jour du cache:", error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Initialise le service (à appeler au démarrage de l'application)
 */
export async function initializeArtifactService(): Promise<void> {
  try {
    console.log("Initialisation du service d'artefacts...");

    // Initialiser les données par défaut
    await initializeDefaultData();

    // Vérifier si on a besoin de récupérer les données depuis la base de données
    const cacheValid = await isCacheValid(CACHE_KEYS.ARTIFACT_SETS);

    if (!cacheValid) {
      console.log(
        "Cache invalide, récupération initiale depuis la base de données..."
      );
      await refreshArtifactCache();
    } else {
      console.log("Cache valide, utilisation des données en cache");
    }

    console.log("Service d'artefacts initialisé avec succès");
  } catch (error) {
    console.warn(
      "Erreur lors de l'initialisation du service d'artefacts:",
      error
    );
  }
}

/**
 * Obtient les statistiques du cache
 */
export async function getCacheStats(): Promise<{
  artifactSetsCount: number;
  cacheValid: boolean;
  lastUpdated?: Date;
}> {
  try {
    const sets = await getCachedArtifactSets();
    const cacheValid = await isCacheValid(CACHE_KEYS.ARTIFACT_SETS);

    // Récupérer la date de dernière mise à jour
    const metadata = await prisma.cacheMetadata.findUnique({
      where: { key: CACHE_KEYS.ARTIFACT_SETS },
    });

    return {
      artifactSetsCount: sets.length,
      cacheValid,
      lastUpdated: metadata?.lastUpdated,
    };
  } catch (error) {
    console.warn(
      "Erreur lors de la récupération des statistiques du cache:",
      error
    );
    return {
      artifactSetsCount: 0,
      cacheValid: false,
    };
  }
}
