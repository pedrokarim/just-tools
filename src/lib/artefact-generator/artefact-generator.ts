import artefactData from "./artefact-data.json";

export interface Artefact {
  type: string;
  mainStat: string;
  subStats: string[];
  id: string;
}

export interface ArtefactGenerationOptions {
  count: 1 | 10 | 50;
  specificType?: string;
  specificMainStat?: string;
  specificSubStats?: string[];
}

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

// Fonction pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fonction principale de génération d'un artefact
export function generateArtefact(
  options: Partial<ArtefactGenerationOptions> = {}
): Artefact {
  // Déterminer le type d'artefact
  let artefactType;
  if (options.specificType) {
    artefactType = artefactData.artefactTypes.find(
      (type) => type.id === options.specificType
    );
  }
  if (!artefactType) {
    artefactType = getRandomElement(artefactData.artefactTypes);
  }

  // Déterminer la stat principale
  let mainStat;
  if (
    options.specificMainStat &&
    artefactType.mainStats.includes(options.specificMainStat)
  ) {
    mainStat = options.specificMainStat;
  } else {
    // Pour les types avec des poids spécifiques
    if (
      artefactData.mainStatWeights[
        artefactType.id as keyof typeof artefactData.mainStatWeights
      ]
    ) {
      const weights =
        artefactData.mainStatWeights[
          artefactType.id as keyof typeof artefactData.mainStatWeights
        ];
      const stats = Object.keys(weights);
      const weightValues = Object.values(weights);
      mainStat = getWeightedRandom(stats, weightValues);
    } else {
      mainStat = getRandomElement(artefactType.mainStats);
    }
  }

  // Déterminer le nombre de sous-stats (3 ou 4)
  const hasFourSubStats =
    Math.random() < artefactData.probabilities.fourSubStats;
  const subStatsCount = hasFourSubStats ? 4 : 3;

  // Générer les sous-stats
  let availableSubStats = artefactData.subStats.filter(
    (stat) => stat.name !== mainStat
  );

  // Si des sous-stats spécifiques sont demandées, les inclure
  if (options.specificSubStats) {
    const specificStats = options.specificSubStats.filter((stat) =>
      availableSubStats.some((s) => s.name === stat)
    );
    if (specificStats.length > 0) {
      // Mélanger les stats spécifiques avec les autres
      const otherStats = availableSubStats.filter(
        (stat) => !options.specificSubStats!.includes(stat.name)
      );
      availableSubStats = [
        ...specificStats.map(
          (name) => artefactData.subStats.find((s) => s.name === name)!
        ),
        ...otherStats,
      ];
    }
  }

  // Sélectionner les sous-stats avec poids
  const selectedSubStats: string[] = [];
  const remainingStats = [...availableSubStats];

  for (let i = 0; i < Math.min(subStatsCount, remainingStats.length); i++) {
    const weights = remainingStats.map((stat) => stat.weight);
    const selectedStat = getWeightedRandom(remainingStats, weights);
    selectedSubStats.push(selectedStat.name);

    // Retirer la stat sélectionnée pour éviter les doublons
    const index = remainingStats.findIndex(
      (stat) => stat.name === selectedStat.name
    );
    remainingStats.splice(index, 1);
  }

  return {
    type: artefactType.name,
    mainStat,
    subStats: selectedSubStats,
    id: `${artefactType.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`,
  };
}

// Fonction pour générer plusieurs artefacts
export function generateMultipleArtefacts(
  options: ArtefactGenerationOptions
): Artefact[] {
  const artefacts: Artefact[] = [];

  for (let i = 0; i < options.count; i++) {
    artefacts.push(generateArtefact(options));
  }

  return artefacts;
}

// Fonction pour calculer la probabilité d'obtenir un artefact spécifique
export function calculateArtefactProbability(
  type: string,
  mainStat: string,
  subStats: string[]
): number {
  const artefactType = artefactData.artefactTypes.find((t) => t.id === type);
  if (!artefactType) return 0;

  // Probabilité de la stat principale
  let mainStatProbability = 1;
  if (
    artefactData.mainStatWeights[
      type as keyof typeof artefactData.mainStatWeights
    ]
  ) {
    const weights =
      artefactData.mainStatWeights[
        type as keyof typeof artefactData.mainStatWeights
      ];
    const totalWeight = Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    mainStatProbability =
      (weights[mainStat as keyof typeof weights] || 0) / totalWeight;
  } else {
    mainStatProbability = 1 / artefactType.mainStats.length;
  }

  // Probabilité du nombre de sous-stats
  const subStatsCount = subStats.length;
  const fourSubStatsProbability = artefactData.probabilities.fourSubStats;
  const threeSubStatsProbability = artefactData.probabilities.threeSubStats;

  let subStatsCountProbability;
  if (subStatsCount === 4) {
    subStatsCountProbability = fourSubStatsProbability;
  } else if (subStatsCount === 3) {
    subStatsCountProbability = threeSubStatsProbability;
  } else {
    return 0; // Nombre de sous-stats invalide
  }

  // Probabilité des sous-stats spécifiques
  const availableSubStats = artefactData.subStats.filter(
    (stat) => stat.name !== mainStat
  );
  const totalSubStatsWeight = availableSubStats.reduce(
    (sum, stat) => sum + stat.weight,
    0
  );

  let subStatsProbability = 1;
  for (const subStat of subStats) {
    const statData = availableSubStats.find((s) => s.name === subStat);
    if (!statData) return 0;

    subStatsProbability *= statData.weight / totalSubStatsWeight;
  }

  // Probabilité totale
  const totalProbability =
    mainStatProbability * subStatsCountProbability * subStatsProbability;

  return totalProbability;
}

// Fonction pour formater un artefact en texte court
export function formatArtefactShort(artefact: Artefact): string {
  return `${artefact.type} – ${artefact.mainStat} – ${artefact.subStats.join(
    ", "
  )}`;
}

// Fonction pour obtenir les statistiques de génération
export function getGenerationStats(artefacts: Artefact[]) {
  const stats = {
    total: artefacts.length,
    byType: {} as Record<string, number>,
    byMainStat: {} as Record<string, number>,
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
