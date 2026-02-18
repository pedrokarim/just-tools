import React from "react";
import {
  Code,
  Palette,
  Search,
  RefreshCw,
  Lock,
  FileText,
  Grid3X3,
  Image,
  Volume2,
  Sparkles,
} from "lucide-react";

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "coming-soon" | "in-progress" | "ready";
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  route: string;
  createdAt: Date;
}

export const toolsMetadata: ToolMetadata[] = [
  {
    id: "code-formatter",
    name: "Formateur de Code",
    description:
      "Formate automatiquement votre code dans différents langages avec une précision parfaite",
    category: "Développement",
    status: "ready",
    icon: <Code className="w-6 h-6" />,
    iconBg: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
    route: "/tools/code-formatter",
    createdAt: new Date("2025-05-15"),
  },
  {
    id: "color-palette",
    name: "Générateur de Palette",
    description:
      "Créez des palettes de couleurs harmonieuses pour vos projets créatifs",
    category: "Design",
    status: "ready",
    icon: <Palette className="w-6 h-6" />,
    iconBg: "bg-violet-100 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
    route: "/tools/color-palette",
    createdAt: new Date("2025-05-25"),
  },
  {
    id: "json-validator",
    name: "Validateur JSON",
    description:
      "Validez et formatez vos fichiers JSON avec une interface intuitive",
    category: "Développement",
    status: "ready",
    icon: <Search className="w-6 h-6" />,
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    route: "/tools/json-validator",
    createdAt: new Date("2025-06-05"),
  },
  {
    id: "base64-converter",
    name: "Convertisseur Base64",
    description: "Encodez et décodez du texte en Base64 instantanément",
    category: "Utilitaires",
    status: "ready",
    icon: <RefreshCw className="w-6 h-6" />,
    iconBg: "bg-orange-100 dark:bg-orange-950",
    iconColor: "text-orange-600 dark:text-orange-400",
    route: "/tools/base64-converter",
    createdAt: new Date("2025-06-15"),
  },
  {
    id: "password-generator",
    name: "Générateur de Mots de Passe",
    description: "Générez des mots de passe sécurisés et personnalisables",
    category: "Sécurité",
    status: "ready",
    icon: <Lock className="w-6 h-6" />,
    iconBg: "bg-indigo-100 dark:bg-indigo-950",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    route: "/tools/password-generator",
    createdAt: new Date("2025-06-25"),
  },
  {
    id: "markdown-editor",
    name: "Éditeur Markdown",
    description: "Éditez et prévisualisez du contenu Markdown en temps réel",
    category: "Édition",
    status: "ready",
    icon: <FileText className="w-6 h-6" />,
    iconBg: "bg-teal-100 dark:bg-teal-950",
    iconColor: "text-teal-600 dark:text-teal-400",
    route: "/tools/markdown-editor",
    createdAt: new Date("2025-07-05"),
  },
  {
    id: "pattern-editor",
    name: "Éditeur de Motifs",
    description:
      "Créez des motifs répétitifs avec une grille interactive avancée",
    category: "Design",
    status: "ready",
    icon: <Grid3X3 className="w-6 h-6" />,
    iconBg: "bg-rose-100 dark:bg-rose-950",
    iconColor: "text-rose-600 dark:text-rose-400",
    route: "/tools/pattern-editor",
    createdAt: new Date("2025-07-15"),
  },
  {
    id: "halftone",
    name: "Effet de Trame",
    description:
      "Ajoutez un effet de trame halftone par-dessus vos images avec des paramètres personnalisables",
    category: "Design",
    status: "ready",
    icon: <Image className="w-6 h-6" />,
    iconBg: "bg-purple-100 dark:bg-purple-950",
    iconColor: "text-purple-600 dark:text-purple-400",
    route: "/tools/halftone",
    createdAt: new Date("2025-07-25"),
  },
  {
    id: "color-extractor",
    name: "Extracteur de Couleurs",
    description:
      "Extrayez les couleurs dominantes de vos images avec une interface intuitive et un historique local",
    category: "Design",
    status: "ready",
    icon: <Palette className="w-6 h-6" />,
    iconBg: "bg-amber-100 dark:bg-amber-950",
    iconColor: "text-amber-600 dark:text-amber-400",
    route: "/tools/color-extractor",
    createdAt: new Date("2025-08-05"),
  },
  {
    id: "text-to-speech",
    name: "Synthèse Vocale",
    description:
      "Convertissez votre texte en parole avec des voix naturelles et des paramètres personnalisables",
    category: "Utilitaires",
    status: "ready",
    icon: <Volume2 className="w-6 h-6" />,
    iconBg: "bg-cyan-100 dark:bg-cyan-950",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    route: "/tools/text-to-speech",
    createdAt: new Date("2025-08-15"),
  },
  {
    id: "artefact-generator",
    name: "Simulateur d'Artefacts Genshin",
    description:
      "Générez des artefacts aléatoires avec les vraies probabilités du jeu Genshin Impact",
    category: "Gaming",
    status: "ready",
    icon: <Sparkles className="w-6 h-6" />,
    iconBg: "bg-pink-100 dark:bg-pink-950",
    iconColor: "text-pink-600 dark:text-pink-400",
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
