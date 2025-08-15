// Configuration du projet Just Tools
// Les valeurs peuvent être surchargées par des variables d'environnement

// Import des métadonnées des outils existantes
import { toolsMetadata, ToolMetadata } from "./tools-metadata";

export const PROJECT_CONFIG = {
  // Informations de base
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Just Tools",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Suite d'outils de développement gratuits",
  version: process.env.NEXT_PUBLIC_VERSION || "1.0.0",

  // URLs
  baseUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_FALLBACK_URL ||
    "https://just-tools.ascencia.re",

  // Créateur
  creator: {
    name: "Ahmed Karim",
    alias: "PedroKarim",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@ascencia.re",
    website: "https://ascencia.re",
    github: "https://github.com/pedrokarim",
  },

  // Entreprise
  company: {
    name: "Ascencia",
    website: "https://ascencia.re",
    description:
      "Entreprise de développement web et d'innovation technologique",
  },

  // Projet
  project: {
    github: "https://github.com/pedrokarim/just-tools",
    license: "MIT",
    licenseUrl: "https://opensource.org/licenses/MIT",
    repository: "pedrokarim/just-tools",
  },

  // Dates
  dates: {
    created: "2024-12-19",
    lastUpdated: "2025-08-15",
    copyrightYear: "2025",
  },

  // Métadonnées SEO
  seo: {
    keywords: [
      "outils de développement",
      "convertisseur base64",
      "formateur de code",
      "générateur de palette",
      "validateur json",
      "générateur de mots de passe",
      "éditeur markdown",
      "éditeur de motifs",
      "effet de trame",
      "extracteur de couleurs",
      "synthèse vocale",
      "développement web",
      "programmation",
      "utilitaires développeur",
      "outils gratuits",
      "workflow développement",
    ],
    author: "Ahmed Karim (PedroKarim)",
    publisher: "Ascencia",
    category: "technology",
  },

  // Configuration PWA
  pwa: {
    name: "Just Tools - Outils de développement gratuits",
    shortName: "Just Tools",
    description:
      "Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien",
    themeColor: "#3b82f6",
    backgroundColor: "#ffffff",
    display: "standalone",
    orientation: "portrait-primary",
    scope: "/",
    startUrl: "/",
    lang: "fr",
    categories: ["productivity", "utilities", "developer"],
  },

  // Statistiques du projet
  stats: {
    toolsCount: 10,
    isFree: true,
    isOpenSource: true,
    availability: "24/7",
  },

  // Technologies utilisées
  technologies: {
    frontend: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "shadcn/ui",
      "Framer Motion",
    ],
    backend: [
      "API Routes Next.js",
      "Service Worker",
      "Jotai",
      "Zustand",
      "Lucide React",
      "Sonner",
    ],
    deployment: ["Vercel", "Docker", "GitHub Actions"],
  },

  // Configuration des outils (importée depuis tools-metadata.tsx)
  tools: toolsMetadata,

  // Configuration des liens sociaux
  social: {
    github: "https://github.com/pedrokarim",
    twitter: "https://twitter.com/pedrokarim",
    linkedin: "https://linkedin.com/in/pedrokarim",
    website: "https://ascencia.re",
  },

  // Configuration des contacts
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@ascencia.re",
    website: "https://ascencia.re",
    github: "https://github.com/pedrokarim/just-tools",
    issues: "https://github.com/pedrokarim/just-tools/issues",
    discussions: "https://github.com/pedrokarim/just-tools/discussions",
  },

  // Configuration légale
  legal: {
    companyName: "Ascencia",
    developerName: "Ahmed Karim (PedroKarim)",
    copyrightYear: "2025",
    license: "MIT",
    jurisdiction: "France",
    governingLaw: "Droit français",
  },
};

// Types pour TypeScript
export type ToolConfig = ToolMetadata; // Utilise le type existant

export type CreatorConfig = typeof PROJECT_CONFIG.creator;
export type CompanyConfig = typeof PROJECT_CONFIG.company;

// Fonctions utilitaires
export const getLatestTool = (): ToolConfig => {
  return PROJECT_CONFIG.tools.reduce((latest, tool) =>
    tool.createdAt > latest.createdAt ? tool : latest
  );
};

export const getToolsCount = (): number => {
  return PROJECT_CONFIG.tools.length;
};

export const getToolsByCategory = (category: string): ToolConfig[] => {
  return PROJECT_CONFIG.tools.filter((tool) => tool.category === category);
};

export const getToolById = (id: string): ToolConfig | undefined => {
  return PROJECT_CONFIG.tools.find((tool) => tool.id === id);
};

// Export par défaut pour faciliter l'import
export default PROJECT_CONFIG;
