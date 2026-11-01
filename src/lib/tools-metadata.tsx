import React from "react";
import {
  Code,
  Palette,
  Search,
  RefreshCw,
  Lock,
  FileText,
  Grid3X3,
  Image as ImageIcon,
  Pipette,
  Volume2,
  Sparkles,
  Scissors,
} from "lucide-react";

export interface ToolMetadata {
  id: string;
  name: string;
  /** Pour les listes étroites, quand `name` ne tient pas sur une ligne. */
  shortName?: string;
  description: string;
  /**
   * Ce que fait l'outil, en quelques phrases. Rendu dans le HTML de chaque page :
   * sans lui, un agent ou un moteur de recherche ne lit qu'une coquille, tout le
   * reste de l'outil n'existant qu'après l'exécution du JavaScript.
   */
  about: string;
  category: string;
  status: "coming-soon" | "in-progress" | "ready";
  /** La taille se décide là où l'icône est posée (voir `ToolIcon`). */
  icon: React.ReactNode;
  route: string;
  createdAt: Date;
}

export const toolsMetadata: ToolMetadata[] = [
  {
    id: "code-formatter",
    name: "Formateur de Code",
    description:
      "Formate ton code automatiquement dans le langage de ton choix.",
    about:
      "Colle ton code, choisis le langage et récupère une version proprement formatée par Prettier pour JavaScript, TypeScript, JSON, HTML et CSS. Pour les autres langages, l'outil harmonise l'indentation sans toucher au reste. Tout se passe dans ton navigateur : ton code ne quitte jamais ta machine.",
    category: "Développement",
    status: "ready",
    icon: <Code aria-hidden="true" />,
    route: "/tools/code-formatter",
    createdAt: new Date("2025-05-15"),
  },
  {
    id: "json-validator",
    name: "Validateur JSON",
    description: "Valide et reformate tes fichiers JSON, erreurs comprises.",
    about:
      "Colle ou importe un document JSON : l'outil te dit s'il est valide, t'indique où se trouve l'erreur le cas échéant, et le reformate pour le rendre lisible. Utile pour vérifier une réponse d'API ou un fichier de configuration avant de l'utiliser. Le contenu reste dans ton navigateur, rien n'est envoyé à un serveur.",
    category: "Développement",
    status: "ready",
    icon: <Search aria-hidden="true" />,
    route: "/tools/json-validator",
    createdAt: new Date("2025-06-05"),
  },
  {
    id: "color-palette",
    name: "Générateur de Palette",
    description: "Crée des palettes de couleurs harmonieuses pour tes projets.",
    about:
      "Pars d'une couleur ou laisse l'outil en proposer une, puis obtiens une palette harmonieuse prête à copier dans ton projet. Chaque teinte se récupère en un clic, ce qui évite les allers-retours avec un logiciel de dessin quand tu cherches juste une base de couleurs cohérente pour une interface ou un visuel.",
    category: "Design",
    status: "ready",
    icon: <Palette aria-hidden="true" />,
    route: "/tools/color-palette",
    createdAt: new Date("2025-05-25"),
  },
  {
    id: "pattern-editor",
    name: "Éditeur de Motifs",
    description: "Dessine des motifs répétitifs sur une grille interactive.",
    about:
      "Compose un motif case par case sur une grille, observe sa répétition en direct, puis exporte-le pour l'utiliser comme fond ou comme texture. L'outil sert autant à esquisser une idée rapidement qu'à préparer un motif précis. Tout se dessine dans ton navigateur, sans compte ni envoi de fichier.",
    category: "Design",
    status: "ready",
    icon: <Grid3X3 aria-hidden="true" />,
    route: "/tools/pattern-editor",
    createdAt: new Date("2025-07-15"),
  },
  {
    id: "halftone",
    name: "Effet de Trame",
    description:
      "Applique un effet de trame halftone réglable à tes images.",
    about:
      "Importe une image et transforme-la en trame de points, façon impression de presse. Forme, taille, espacement et couleurs se règlent en direct, avec des préréglages pour démarrer vite, puis tu exportes le résultat. L'image est traitée dans ton navigateur : elle n'est envoyée nulle part.",
    category: "Design",
    status: "ready",
    icon: <ImageIcon aria-hidden="true" />,
    route: "/tools/halftone",
    createdAt: new Date("2025-07-25"),
  },
  {
    id: "color-extractor",
    name: "Extracteur de Couleurs",
    description: "Extrait les couleurs dominantes de tes images.",
    about:
      "Dépose une image pour récupérer ses couleurs dominantes, prêtes à copier. L'outil garde un historique local de tes extractions, stocké uniquement dans ton navigateur, ce qui permet de retrouver une palette sans refaire le travail. Idéal pour partir d'une photo ou d'une capture et en tirer une base de couleurs.",
    category: "Design",
    status: "ready",
    icon: <Pipette aria-hidden="true" />,
    route: "/tools/color-extractor",
    createdAt: new Date("2025-08-05"),
  },
  {
    id: "remove-background",
    name: "Suppression d'Arrière-plan",
    shortName: "Détourage",
    description:
      "Détoure tes images par IA, directement dans ton navigateur.",
    about:
      "Dépose une image et récupère-la détourée, sur fond transparent, sans compte et sans limite d'usage. Le modèle d'IA tourne dans ton navigateur : il se télécharge à la première utilisation, puis ton image reste sur ta machine et n'est envoyée à aucun serveur. Le résultat s'exporte en PNG, prêt à être réutilisé.",
    category: "Design",
    status: "ready",
    icon: <Scissors aria-hidden="true" />,
    route: "/tools/remove-background",
    createdAt: new Date("2026-04-23"),
  },
  {
    id: "base64-converter",
    name: "Convertisseur Base64",
    description: "Encode et décode du texte en Base64 instantanément.",
    about:
      "Saisis du texte pour l'encoder en Base64, ou colle une chaîne encodée pour retrouver son contenu. La conversion est immédiate et se copie en un clic, ce qui sert au quotidien pour inspecter un en-tête, préparer une valeur de configuration ou lire un jeton. Tout se calcule dans ton navigateur.",
    category: "Utilitaires",
    status: "ready",
    icon: <RefreshCw aria-hidden="true" />,
    route: "/tools/base64-converter",
    createdAt: new Date("2025-06-15"),
  },
  {
    id: "text-to-speech",
    name: "Synthèse Vocale",
    description:
      "Fais lire ton texte à voix haute, avec des voix naturelles et réglables.",
    about:
      "Colle un texte ou importe un document, choisis une voix, et écoute-le avec un vrai lecteur : pause, reprise, déplacement dans le texte, vitesse et mode de lecture épuré. Les voix sont celles de ton navigateur et de ton système. La traduction intégrée, elle, envoie le texte à un service tiers, uniquement quand tu la demandes.",
    category: "Utilitaires",
    status: "ready",
    icon: <Volume2 aria-hidden="true" />,
    route: "/tools/text-to-speech",
    createdAt: new Date("2025-08-15"),
  },
  {
    id: "password-generator",
    name: "Générateur de Mots de Passe",
    shortName: "Mots de passe",
    description: "Génère des mots de passe solides et personnalisables.",
    about:
      "Choisis une longueur et les types de caractères, écarte ceux qui prêtent à confusion, et obtiens un mot de passe solide tiré par le générateur aléatoire cryptographique de ton navigateur. Rien n'est enregistré ni envoyé : le mot de passe n'existe que sur ta page, jusqu'à ce que tu le copies.",
    category: "Sécurité",
    status: "ready",
    icon: <Lock aria-hidden="true" />,
    route: "/tools/password-generator",
    createdAt: new Date("2025-06-25"),
  },
  {
    id: "markdown-editor",
    name: "Éditeur Markdown",
    description: "Écris en Markdown et vois le rendu en temps réel.",
    about:
      "Rédige en Markdown d'un côté, regarde le rendu de l'autre, mis à jour à chaque frappe. L'éditeur convient aussi bien à un fichier README qu'à une note ou un brouillon d'article. Ton texte reste dans ton navigateur et rien n'est envoyé à un serveur ; il te suffit de le copier ou de l'exporter une fois terminé.",
    category: "Édition",
    status: "ready",
    icon: <FileText aria-hidden="true" />,
    route: "/tools/markdown-editor",
    createdAt: new Date("2025-07-05"),
  },
  {
    id: "artefact-generator",
    name: "Simulateur d'Artefacts Genshin",
    shortName: "Artefacts Genshin",
    description:
      "Génère des artefacts avec les vraies probabilités de Genshin Impact.",
    about:
      "Simule le tirage d'artefacts de Genshin Impact avec les probabilités du jeu : set, pièce, statistique principale et sous-statistiques. L'outil sert à comprendre ce que vaut réellement une pièce, à estimer tes chances d'obtenir le jet que tu vises, ou simplement à tenter ta chance sans dépenser de résine.",
    category: "Gaming",
    status: "ready",
    icon: <Sparkles aria-hidden="true" />,
    route: "/tools/artefact-generator",
    createdAt: new Date("2025-01-10"),
  },
];

// Fonction pour obtenir les métadonnées d'un outil par son ID
export const getToolMetadata = (id: string): ToolMetadata | undefined => {
  return toolsMetadata.find((tool) => tool.id === id);
};

// Fonction pour obtenir les métadonnées d'un outil par sa route
export const getToolMetadataByRoute = (
  route: string
): ToolMetadata | undefined => {
  return toolsMetadata.find((tool) => tool.route === route);
};

// Fonction pour obtenir les métadonnées d'un outil par le pathname
export const getToolMetadataByPathname = (
  pathname: string
): ToolMetadata | undefined => {
  const pathParts = pathname.split("/");
  const toolId = pathParts[pathParts.length - 1];
  return getToolMetadata(toolId);
};

// Fonction pour vérifier si un outil est nouveau (moins de 30 jours)
export const isToolNew = (tool: ToolMetadata): boolean => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return tool.createdAt > thirtyDaysAgo;
};

// Fonction pour obtenir les outils récents (moins de 30 jours)
export const getRecentTools = (): ToolMetadata[] => {
  return toolsMetadata.filter(isToolNew);
};

// Fonction pour obtenir l'outil le plus récent
export const getLatestTool = (): ToolMetadata | undefined => {
  return toolsMetadata.reduce((latest, current) => {
    return current.createdAt > latest.createdAt ? current : latest;
  });
};

// Fonction pour obtenir le nombre d'outils
export const getToolsCount = (): number => {
  return toolsMetadata.length;
};

// Catégories disponibles
export const categories = [
  "Tous",
  "Développement",
  "Design",
  "Utilitaires",
  "Sécurité",
  "Édition",
  "Gaming",
];

// Fonction pour obtenir les outils par catégorie
export const getToolsByCategory = (category: string): ToolMetadata[] => {
  if (category === "Tous") {
    return toolsMetadata;
  }
  return toolsMetadata.filter((tool) => tool.category === category);
};

/** Les outils rangés par catégorie, sans les catégories vides. */
export const getToolGroups = (): { category: string; items: ToolMetadata[] }[] =>
  categories
    .filter((category) => category !== "Tous")
    .map((category) => ({ category, items: getToolsByCategory(category) }))
    .filter((group) => group.items.length > 0);

// Fonction pour obtenir les outils prêts
export const getReadyTools = (): ToolMetadata[] => {
  return toolsMetadata.filter((tool) => tool.status === "ready");
};

// Fonction pour obtenir les statistiques
export const getStats = () => [
  { number: getToolsCount().toString(), label: "Outils disponibles" },
  { number: "100%", label: "Gratuit" },
  { number: "Open", label: "Source" },
  { number: "24/7", label: "Disponible" },
];

// Alias pour compatibilité avec l'ancien code
export const tools = toolsMetadata;
