import {
  Code,
  Palette,
  Search,
  RefreshCw,
  Lock,
  FileText,
  Grid3X3,
  Image,
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "coming-soon" | "in-progress" | "ready";
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

export const tools: Tool[] = [
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
  },
];

export const categories = [
  "Tous",
  "Développement",
  "Design",
  "Utilitaires",
  "Sécurité",
  "Édition",
];

// Fonction pour obtenir le nombre d'outils
export const getToolsCount = (): number => {
  return tools.length;
};

// Fonction pour obtenir les outils par catégorie
export const getToolsByCategory = (category: string): Tool[] => {
  if (category === "Tous") {
    return tools;
  }
  return tools.filter((tool) => tool.category === category);
};

// Fonction pour obtenir les outils prêts
export const getReadyTools = (): Tool[] => {
  return tools.filter((tool) => tool.status === "ready");
};

// Fonction pour obtenir les statistiques
export const getStats = () => [
  { number: getToolsCount().toString(), label: "Outils disponibles" },
  { number: "100%", label: "Gratuit" },
  { number: "Open", label: "Source" },
  { number: "24/7", label: "Disponible" },
];
