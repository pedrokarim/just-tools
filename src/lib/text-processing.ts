import { toast } from "sonner";

// Fonction pour nettoyer le texte pour la synthèse vocale
export function cleanTextForTTS(text: string): string {
  return text
    .replace(/\n+/g, " ") // Remplacer les sauts de ligne multiples par un espace
    .replace(/\s+/g, " ") // Remplacer les espaces multiples par un seul espace
    .trim(); // Supprimer les espaces en début et fin
}

// Fonction pour nettoyer le contenu Markdown
export function cleanMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "") // Supprimer les blocs de code
    .replace(/`[^`]*`/g, "") // Supprimer le code inline
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Remplacer les liens par leur texte
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // Remplacer les images par leur alt
    .replace(/^#{1,6}\s+/gm, "") // Supprimer les titres (# ## ### etc.)
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Supprimer le gras
    .replace(/\*([^*]+)\*/g, "$1") // Supprimer l'italique
    .replace(/~~([^~]+)~~/g, "$1") // Supprimer le barré
    .replace(/^[-*+]\s+/gm, "") // Supprimer les listes à puces
    .replace(/^\d+\.\s+/gm, "") // Supprimer les listes numérotées
    .replace(/^>\s+/gm, "") // Supprimer les citations
    .replace(/^\|.*\|$/gm, "") // Supprimer les tableaux
    .replace(/^---+$/gm, "") // Supprimer les séparateurs
    .replace(/\n{3,}/g, "\n\n") // Normaliser les sauts de ligne
    .trim();
}

// Fonction pour nettoyer le contenu HTML
export function cleanHTML(content: string): string {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, "") // Supprimer les scripts
    .replace(/<style[\s\S]*?<\/style>/gi, "") // Supprimer les styles
    .replace(/<[^>]+>/g, "") // Supprimer toutes les balises HTML
    .replace(/&[a-zA-Z]+;/g, " ") // Remplacer les entités HTML par des espaces
    .replace(/&[#\d]+;/g, " ") // Remplacer les entités numériques
    .replace(/\n{3,}/g, "\n\n") // Normaliser les sauts de ligne
    .trim();
}

// Fonction pour nettoyer le contenu XML
export function cleanXML(content: string): string {
  return content
    .replace(/<\?xml[\s\S]*?\?>/gi, "") // Supprimer la déclaration XML
    .replace(/<[^>]+>/g, "") // Supprimer toutes les balises XML
    .replace(/&[a-zA-Z]+;/g, " ") // Remplacer les entités par des espaces
    .replace(/&[#\d]+;/g, " ") // Remplacer les entités numériques
    .replace(/\n{3,}/g, "\n\n") // Normaliser les sauts de ligne
    .trim();
}

// Fonction pour extraire le texte d'un objet JSON
export function extractTextFromJSON(content: string): string {
  try {
    const jsonObj = JSON.parse(content);
    const extractText = (obj: any): string => {
      if (typeof obj === "string") return obj;
      if (typeof obj === "number" || typeof obj === "boolean")
        return String(obj);
      if (Array.isArray(obj)) {
        return obj.map(extractText).join(" ");
      }
      if (typeof obj === "object" && obj !== null) {
        return Object.values(obj).map(extractText).join(" ");
      }
      return "";
    };
    return extractText(jsonObj);
  } catch {
    // Si le JSON est invalide, garder le contenu brut
    return content;
  }
}

// Fonction pour nettoyer le contenu selon le type de fichier
export function cleanFileContent(content: string, fileName: string): string {
  if (fileName.match(/\.(md|markdown)$/i)) {
    return cleanMarkdown(content);
  } else if (fileName.match(/\.(html|htm)$/i)) {
    return cleanHTML(content);
  } else if (fileName.match(/\.xml$/i)) {
    return cleanXML(content);
  } else if (fileName.match(/\.json$/i)) {
    return extractTextFromJSON(content);
  }
  return content;
}

// Fonction pour valider le type de fichier
export function validateFileType(file: File): boolean {
  const allowedTypes = [
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
    "text/html",
    "text/xml",
  ];

  return (
    allowedTypes.includes(file.type) ||
    file.name.match(/\.(txt|md|markdown|csv|json|html|xml)$/i) !== null
  );
}

// Fonction pour valider une image
export function validateImage(file: File): boolean {
  if (!file.type.startsWith("image/")) {
    toast.error("Veuillez sélectionner une image");
    return false;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error("L'image est trop volumineuse (max 10MB)");
    return false;
  }

  return true;
}
