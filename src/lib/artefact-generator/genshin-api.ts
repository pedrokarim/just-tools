// genshin-db supprimé - utilisation uniquement de la base de données
import { prisma } from "../prisma";
import { LRUCache } from "../lru-cache";

// Cache LRU pour les sets d'artefacts (cache de 1h)
const artifactSetsCache = new LRUCache<any[]>(100, 60 * 60 * 1000);
const artifactImagesCache = new LRUCache<string>(500, 60 * 60 * 1000);

// Fonction pour obtenir les statistiques du cache
export function getCacheStats() {
  return {
    artifactSets: artifactSetsCache.getStats(),
    artifactImages: artifactImagesCache.getStats(),
  };
}

// Fonction pour nettoyer les caches
export function clearCaches() {
  artifactSetsCache.clear();
  artifactImagesCache.clear();
}

export interface GenshinArtefact {
  type: string;
  mainStat: string;
  subStats: string[];
  id: string;
  setName?: string;
  rarity?: number;
  imageUrl?: string;
  setImageUrl?: string;
}

export interface GenshinArtefactGenerationOptions {
  count: 1 | 10 | 50;
  specificType?: string;
  specificMainStat?: string;
  specificSubStats?: string[];
  setName?: string;
}

// Types d'artefacts dans Genshin Impact
const ARTEFACT_TYPES = [
  "flower", // Fleur de vie
  "plume", // Plume de la mort
  "sands", // Sablier de l'éternité
  "goblet", // Coupe d'Eonothem
  "circlet", // Couronne de Logos
];

// Mapping des types vers les noms français
const TYPE_NAMES = {
  flower: "Fleur",
  plume: "Plume",
  sands: "Sablier",
  goblet: "Coupe",
  circlet: "Couronne",
};

// Stats principales par type d'artefact
const MAIN_STATS = {
  flower: ["HP"], // PV fixe
  plume: ["ATK"], // ATQ fixe
  sands: ["HP%", "ATK%", "DEF%", "Elemental Mastery", "Energy Recharge"], // Stats %
  goblet: [
    "HP%",
    "ATK%",
    "DEF%",
    "Elemental Mastery",
    "Pyro DMG Bonus",
    "Hydro DMG Bonus",
    "Cryo DMG Bonus",
    "Electro DMG Bonus",
    "Anemo DMG Bonus",
    "Geo DMG Bonus",
    "Physical DMG Bonus",
  ], // Stats % + dégâts élémentaires
  circlet: [
    "CRIT Rate",
    "CRIT DMG",
    "HP%",
    "ATK%",
    "DEF%",
    "Elemental Mastery",
    "Healing Bonus",
  ], // Stats critiques + autres
};

// Sous-stats possibles
const SUB_STATS = [
  "HP",
  "ATK",
  "DEF",
  "HP%",
  "ATK%",
  "DEF%",
  "CRIT Rate",
  "CRIT DMG",
  "Elemental Mastery",
  "Energy Recharge",
];

// Poids des sous-stats (plus le poids est élevé, plus c'est probable)
const SUB_STAT_WEIGHTS = {
  HP: 6,
  ATK: 6,
  DEF: 6,
  "HP%": 4,
  "ATK%": 4,
  "DEF%": 4,
  "CRIT Rate": 3,
  "CRIT DMG": 3,
  "Elemental Mastery": 2,
  "Energy Recharge": 2,
};

// Probabilité d'avoir 4 sous-stats au lieu de 3
const FOUR_SUBSTATS_PROBABILITY = 0.25;

// Fonction utilitaire pour obtenir un élément aléatoire avec poids
function getWeightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

// Fonction pour obtenir un élément aléatoire simple
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Fonction pour obtenir les sets d'artefacts disponibles (utilise le cache)
export async function getAvailableArtifactSets(): Promise<string[]> {
  const { getAvailableArtifactSets: getCachedSets } = await import(
    "./artifact-service"
  );
  return await getCachedSets();
}

// Fonction pour obtenir les détails d'un set d'artefacts (utilise le cache)
export async function getArtifactSetDetails(setName: string) {
  const { getArtifactSetDetails: getCachedDetails } = await import(
    "./artifact-service"
  );
  return await getCachedDetails(setName);
}

// Fonction pour obtenir l'image d'un artefact spécifique
export async function getArtifactImage(
  setName: string,
  artifactType: string
): Promise<string | null> {
  console.log(`🚀 getArtifactImage appelée pour ${setName} ${artifactType}`);

  try {
    const artifactSet = await prisma.artifactSet.findUnique({
      where: { name: setName },
    });

    console.log(`🔍 Recherche image pour ${setName} ${artifactType}:`, {
      found: !!artifactSet,
      hasImages: !!(artifactSet && artifactSet.images),
      images: artifactSet?.images,
      setName: setName,
      artifactType: artifactType,
      rawData: artifactSet,
    });

    if (artifactSet && artifactSet.images) {
      const images = artifactSet.images as any;
      if (images[artifactType]) {
        console.log(`✅ Image trouvée: ${images[artifactType]}`);
        return images[artifactType];
      } else {
        console.log(
          `❌ Pas d'image pour le type ${artifactType} dans ${setName}`
        );
      }
    } else {
      console.log(`❌ Pas d'images stockées pour ${setName}`);
    }
    return null;
  } catch (error) {
    console.warn(
      `Erreur lors de la récupération de l'image pour ${setName} ${artifactType}:`,
      error
    );
    return null;
  }
}

// Fonction pour obtenir l'image du set d'artefacts
export async function getArtifactSetImage(
  setName: string
): Promise<string | null> {
  const cacheKey = `${setName}-set`;

  // Vérifier le cache d'abord
  const cachedImage = artifactImagesCache.get(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }

  try {
    const artifactSet = await prisma.artifactSet.findUnique({
      where: { name: setName },
    });

    if (artifactSet && artifactSet.images) {
      const images = artifactSet.images as any;
      if (images.flower) {
        // Utiliser l'image de la fleur comme image représentative du set
        artifactImagesCache.set(cacheKey, images.flower);
        return images.flower;
      }
    }
    return null;
  } catch (error) {
    console.warn(
      `Erreur lors de la récupération de l'image du set ${setName}:`,
      error
    );
    return null;
  }
}

// Fonction principale de génération d'un artefact
export async function generateGenshinArtefact(
  options: Partial<GenshinArtefactGenerationOptions> = {}
): Promise<GenshinArtefact> {
  // Déterminer le type d'artefact
  let artefactType: string;
  if (options.specificType && ARTEFACT_TYPES.includes(options.specificType)) {
    artefactType = options.specificType;
  } else {
    artefactType = getRandomElement(ARTEFACT_TYPES);
  }

  // Déterminer la stat principale
  let mainStat: string;
  if (
    options.specificMainStat &&
    MAIN_STATS[artefactType as keyof typeof MAIN_STATS]?.includes(
      options.specificMainStat
    )
  ) {
    mainStat = options.specificMainStat;
  } else {
    const availableMainStats =
      MAIN_STATS[artefactType as keyof typeof MAIN_STATS] || [];
    mainStat = getRandomElement(availableMainStats);
  }

  // Déterminer le nombre de sous-stats (3 ou 4)
  const hasFourSubStats = Math.random() < FOUR_SUBSTATS_PROBABILITY;
  const subStatsCount = hasFourSubStats ? 4 : 3;

  // Générer les sous-stats
  let availableSubStats = SUB_STATS.filter((stat) => stat !== mainStat);

  // Si des sous-stats spécifiques sont demandées, les inclure
  if (options.specificSubStats) {
    const specificStats = options.specificSubStats.filter((stat) =>
      availableSubStats.includes(stat)
    );
    if (specificStats.length > 0) {
      // Mélanger les stats spécifiques avec les autres
      const otherStats = availableSubStats.filter(
        (stat) => !options.specificSubStats!.includes(stat)
      );
      availableSubStats = [...specificStats, ...otherStats];
    }
  }

  // Sélectionner les sous-stats avec poids
  const selectedSubStats: string[] = [];
  const remainingStats = [...availableSubStats];

  for (let i = 0; i < Math.min(subStatsCount, remainingStats.length); i++) {
    const weights = remainingStats.map(
      (stat) => SUB_STAT_WEIGHTS[stat as keyof typeof SUB_STAT_WEIGHTS] || 1
    );
    const selectedStat = getWeightedRandom(remainingStats, weights);
    selectedSubStats.push(selectedStat);

    // Retirer la stat sélectionnée pour éviter les doublons
    const index = remainingStats.findIndex((stat) => stat === selectedStat);
    remainingStats.splice(index, 1);
  }

  // Obtenir un set d'artefacts aléatoire si non spécifié
  let setName = options.setName;
  if (!setName) {
    // Récupérer les sets depuis la base de données
    try {
      const availableSets = await prisma.artifactSet.findMany({
        orderBy: { name: "asc" },
      });

      if (availableSets.length > 0) {
        const setNames = availableSets.map((set) => set.name);
        setName = getRandomElement(setNames);
        console.log(
          `🎲 Set aléatoire sélectionné: ${setName} (${availableSets.length} sets disponibles)`
        );
      } else {
        // Fallback vers les sets par défaut si la base est vide
        const defaultSets = [
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
        ];
        setName = getRandomElement(defaultSets);
        console.log(`⚠️ Base vide, utilisation du set par défaut: ${setName}`);
      }
    } catch (error) {
      console.warn("Erreur lors de la récupération des sets:", error);
      // Fallback vers les sets par défaut
      const defaultSets = [
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
      ];
      setName = getRandomElement(defaultSets);
    }
  }

  // Les images seront gérées par generateGenshinArtefactWithSet

  return {
    type: TYPE_NAMES[artefactType as keyof typeof TYPE_NAMES] || artefactType,
    mainStat,
    subStats: selectedSubStats,
    id: `${artefactType}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    setName,
    rarity: 5, // Tous les artefacts générés sont de rareté 5 étoiles
  };
}

// Fonction pour générer plusieurs artefacts
export async function generateMultipleGenshinArtefacts(
  options: GenshinArtefactGenerationOptions
): Promise<GenshinArtefact[]> {
  const artefacts: GenshinArtefact[] = [];

  for (let i = 0; i < options.count; i++) {
    const artefact = await generateGenshinArtefact(options);
    artefacts.push(artefact);
  }

  return artefacts;
}

// Fonction pour générer un artefact avec un set spécifique (utilise les données pré-chargées)
export async function generateGenshinArtefactWithSet(
  options: Partial<GenshinArtefactGenerationOptions> = {},
  availableArtifacts?: any[] // Les données pré-chargées
): Promise<GenshinArtefact> {
  console.log(`🚀 generateGenshinArtefactWithSet appelée avec:`, {
    options,
    availableArtifactsCount: availableArtifacts?.length,
    firstArtifact: availableArtifacts?.[0],
  });

  // Générer l'artefact de base
  const artefact = await generateGenshinArtefact(options);

  // Utiliser les données pré-chargées pour assigner l'image
  if (availableArtifacts && artefact.setName) {
    const setData = availableArtifacts.find(
      (artifact) => artifact.name === artefact.setName
    );

    if (setData && setData.images) {
      // Récupérer l'image pour le type d'artefact généré
      const artifactType = Object.keys(TYPE_NAMES).find(
        (key) => TYPE_NAMES[key as keyof typeof TYPE_NAMES] === artefact.type
      );

      if (artifactType && setData.images[artifactType]) {
        artefact.imageUrl = setData.images[artifactType];
      }
    }
  }

  return artefact;
}

// Fonction pour calculer la probabilité d'obtenir un artefact spécifique
export function calculateGenshinArtefactProbability(
  type: string,
  mainStat: string,
  subStats: string[]
): number {
  const artefactType = Object.keys(TYPE_NAMES).find(
    (key) => TYPE_NAMES[key as keyof typeof TYPE_NAMES] === type
  );

  if (!artefactType) return 0;

  // Probabilité de la stat principale (égale pour toutes les stats disponibles)
  const availableMainStats =
    MAIN_STATS[artefactType as keyof typeof MAIN_STATS] || [];
  const mainStatProbability = 1 / availableMainStats.length;

  // Probabilité du nombre de sous-stats
  const subStatsCount = subStats.length;
  let subStatsCountProbability;
  if (subStatsCount === 4) {
    subStatsCountProbability = FOUR_SUBSTATS_PROBABILITY;
  } else if (subStatsCount === 3) {
    subStatsCountProbability = 1 - FOUR_SUBSTATS_PROBABILITY;
  } else {
    return 0; // Nombre de sous-stats invalide
  }

  // Probabilité des sous-stats spécifiques
  const availableSubStats = SUB_STATS.filter((stat) => stat !== mainStat);
  const totalSubStatsWeight = availableSubStats.reduce(
    (sum, stat) =>
      sum + (SUB_STAT_WEIGHTS[stat as keyof typeof SUB_STAT_WEIGHTS] || 1),
    0
  );

  let subStatsProbability = 1;
  for (const subStat of subStats) {
    const weight =
      SUB_STAT_WEIGHTS[subStat as keyof typeof SUB_STAT_WEIGHTS] || 1;
    subStatsProbability *= weight / totalSubStatsWeight;
  }

  // Probabilité totale
  const totalProbability =
    mainStatProbability * subStatsCountProbability * subStatsProbability;

  return totalProbability;
}

// Fonction pour formater un artefact en texte court
export function formatGenshinArtefactShort(artefact: GenshinArtefact): string {
  return `${artefact.type} – ${artefact.mainStat} – ${artefact.subStats.join(
    ", "
  )}`;
}

// Fonction pour obtenir les statistiques de génération
export function getGenshinGenerationStats(artefacts: GenshinArtefact[]) {
  const stats = {
    total: artefacts.length,
    byType: {} as Record<string, number>,
    byMainStat: {} as Record<string, number>,
    bySet: {} as Record<string, number>,
    fourSubStats: 0,
    threeSubStats: 0,
    subStatsFrequency: {} as Record<string, number>,
  };

  artefacts.forEach((artefact) => {
    // Comptage par type
    stats.byType[artefact.type] = (stats.byType[artefact.type] || 0) + 1;

    // Comptage par stat principale
    stats.byMainStat[artefact.mainStat] =
      (stats.byMainStat[artefact.mainStat] || 0) + 1;

    // Comptage par set
    if (artefact.setName) {
      stats.bySet[artefact.setName] = (stats.bySet[artefact.setName] || 0) + 1;
    }

    // Comptage du nombre de sous-stats
    if (artefact.subStats.length === 4) {
      stats.fourSubStats++;
    } else {
      stats.threeSubStats++;
    }

    // Fréquence des sous-stats
    artefact.subStats.forEach((subStat) => {
      stats.subStatsFrequency[subStat] =
        (stats.subStatsFrequency[subStat] || 0) + 1;
    });
  });

  return stats;
}
