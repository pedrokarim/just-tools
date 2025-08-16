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
} from "lucide-react";

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "coming-soon" | "in-progress" | "ready";
  icon: React.ReactNode;
  color: string;
  gradient: string;
  route: string;
  headerGradient: string;
  headerIconBg: string;
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
    color: "from-blue-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    route: "/tools/code-formatter",
    headerGradient: "from-blue-600 to-cyan-600",
    headerIconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
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
    color: "from-purple-500 to-pink-500",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    route: "/tools/color-palette",
    headerGradient: "from-purple-600 to-pink-600",
    headerIconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
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
    color: "from-green-500 to-emerald-500",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
    route: "/tools/json-validator",
    headerGradient: "from-green-600 to-emerald-600",
    headerIconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
    createdAt: new Date("2025-06-05"),
  },
  {
    id: "base64-converter",
    name: "Convertisseur Base64",
    description: "Encodez et décodez du texte en Base64 instantanément",
    category: "Utilitaires",
    status: "ready",
    icon: <RefreshCw className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    route: "/tools/base64-converter",
    headerGradient: "from-orange-600 to-red-600",
    headerIconBg: "bg-gradient-to-br from-orange-500 to-red-500",
    createdAt: new Date("2025-06-15"),
  },
  {
    id: "password-generator",
    name: "Générateur de Mots de Passe",
    description: "Générez des mots de passe sécurisés et personnalisables",
    category: "Sécurité",
    status: "ready",
    icon: <Lock className="w-6 h-6" />,
    color: "from-indigo-500 to-purple-500",
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-500",
    route: "/tools/password-generator",
    headerGradient: "from-indigo-600 to-purple-600",
    headerIconBg: "bg-gradient-to-br from-indigo-500 to-purple-500",
    createdAt: new Date("2025-06-25"),
  },
  {
    id: "markdown-editor",
    name: "Éditeur Markdown",
    description: "Éditez et prévisualisez du contenu Markdown en temps réel",
    category: "Édition",
    status: "ready",
    icon: <FileText className="w-6 h-6" />,
    color: "from-teal-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-500",
    route: "/tools/markdown-editor",
    headerGradient: "from-teal-600 to-cyan-600",
    headerIconBg: "bg-gradient-to-br from-teal-500 to-cyan-500",
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
    color: "from-rose-500 to-pink-500",
    gradient: "bg-gradient-to-br from-rose-500 to-pink-500",
    route: "/tools/pattern-editor",
    headerGradient: "from-rose-600 to-pink-600",
    headerIconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
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
    color: "from-violet-500 to-purple-500",
    gradient: "bg-gradient-to-br from-violet-500 to-purple-500",
    route: "/tools/halftone",
    headerGradient: "from-violet-600 to-purple-600",
    headerIconBg: "bg-gradient-to-br from-violet-500 to-purple-500",
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
    color: "from-amber-500 to-orange-500",
    gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    route: "/tools/color-extractor",
    headerGradient: "from-amber-600 to-orange-600",
    headerIconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
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
    color: "from-emerald-500 to-teal-500",
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
    route: "/tools/text-to-speech",
    headerGradient: "from-emerald-600 to-teal-600",
    headerIconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    createdAt: new Date("2025-08-15"), // Aujourd'hui
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
  // Extraire l'ID de l'outil depuis le pathname
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
