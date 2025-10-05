import GenshinDB from "genshin-db";
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
 * Récupère les sets d'artefacts depuis l'API Genshin DB
 */
async function fetchArtifactSetsFromAPI(): Promise<ArtifactSetData[]> {
  try {
    const artifacts = GenshinDB.artifacts("", { matchCategories: true });

    if (!Array.isArray(artifacts)) {
      throw new Error("Format de données inattendu de l'API");
    }

    const artifactSets: ArtifactSetData[] = [];

    for (const artifact of artifacts) {
      try {
        // L'API genshin-db retourne des strings, pas des objets
        const setName =
          typeof artifact === "string"
            ? artifact
            : (artifact as any).name || artifact;
        const details = GenshinDB.artifacts(setName, { matchCategories: true });

        if (details && typeof details === "object" && "images" in details) {
          const images = (details as any).images;

          artifactSets.push({
            name: setName,
            description: (details as any).description || undefined,
            images: {
              flower: images?.flower || undefined,
              plume: images?.plume || undefined,
              sands: images?.sands || undefined,
              goblet: images?.goblet || undefined,
              circlet: images?.circlet || undefined,
            },
          });
        }
      } catch (error) {
        console.warn(`Erreur lors du traitement du set ${artifact}:`, error);
        // Ajouter quand même le set avec les données de base
        const setName =
          typeof artifact === "string"
            ? artifact
            : (artifact as any).name || artifact;
        artifactSets.push({
          name: setName,
        });
      }
    }

    return artifactSets;
  } catch (error) {
    console.warn(
      "Erreur lors de la récupération des sets depuis l'API:",
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

    // 2. Si pas en cache, récupérer depuis l'API et sauvegarder
    console.log("Aucun set en cache, récupération depuis l'API...");
    try {
      const apiSets = await fetchArtifactSetsFromAPI();

      if (apiSets.length > 0) {
        // Sauvegarder en cache
        await saveArtifactSets(apiSets);
        await updateCacheMetadata(CACHE_KEYS.ARTIFACT_SETS, "1.0");

        console.log(`${apiSets.length} sets sauvegardés en cache`);
        return apiSets.map((set) => set.name);
      }
    } catch (apiError) {
      console.warn("Erreur API, utilisation des sets par défaut:", apiError);
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

    // 2. Si pas en cache, récupérer depuis l'API et sauvegarder
    console.log(
      `Set ${setName} non trouvé en cache, récupération depuis l'API...`
    );
    try {
      const apiDetails = GenshinDB.artifacts(setName, {
        matchCategories: true,
      });

      if (apiDetails) {
        // Sauvegarder en cache pour la prochaine fois
        const artifactSetData: ArtifactSetData = {
          name: setName,
          description: (apiDetails as any).description || undefined,
          images: (apiDetails as any).images || undefined,
        };

        await saveArtifactSets([artifactSetData]);
        await updateCacheMetadata(CACHE_KEYS.ARTIFACT_SETS, "1.0");

        console.log(`Set ${setName} sauvegardé en cache`);
        return apiDetails;
      }
    } catch (apiError) {
      console.warn(`Erreur API pour le set ${setName}:`, apiError);
    }

    // 3. Si l'API échoue, retourner null
    console.warn(`Impossible de récupérer le set ${setName}`);
    return null;
  } catch (error) {
    console.warn(
      `Erreur lors de la récupération des détails du set ${setName}:`,
      error
    );
    return null;
  }
}

/**
 * Force la mise à jour du cache depuis l'API
 */
export async function refreshArtifactCache(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    console.log("Mise à jour forcée du cache des artefacts...");

    const apiSets = await fetchArtifactSetsFromAPI();

    if (apiSets.length > 0) {
      await saveArtifactSets(apiSets);
      await updateCacheMetadata(CACHE_KEYS.ARTIFACT_SETS, "1.0");

      console.log(`Cache mis à jour avec ${apiSets.length} sets`);
      return { success: true, count: apiSets.length };
    }

    return {
      success: false,
      count: 0,
      error: "Aucun set récupéré depuis l'API",
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

    // Vérifier si on a besoin de récupérer les données depuis l'API
    const cacheValid = await isCacheValid(CACHE_KEYS.ARTIFACT_SETS);

    if (!cacheValid) {
      console.log("Cache invalide, récupération initiale depuis l'API...");
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
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const metadata = await prisma.cacheMetadata.findUnique({
      where: { key: CACHE_KEYS.ARTIFACT_SETS },
    });

    await prisma.$disconnect();

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
