import { PROJECT_CONFIG } from "@/lib/constants";
import {
  getToolGroups,
  getToolMetadataByRoute,
  tools,
} from "@/lib/tools-metadata";

/**
 * Le site en Markdown, pour les agents et les outils qui le demandent par
 * `Accept: text/markdown` (voir `middleware.ts`).
 *
 * Tout est dérivé des métadonnées des outils, comme le sitemap : une version
 * écrite à la main finirait par dire autre chose que le site.
 */

const base = PROJECT_CONFIG.baseUrl.replace(/\/$/, "");
const absolute = (path: string) => `${base}${path}`;

const TOOL_LIST = getToolGroups()
  .map(
    ({ category, items }) =>
      `### ${category}\n\n${items
        .map(
          (tool) =>
            `- [${tool.name}](${absolute(tool.route)}) : ${tool.description}`
        )
        .join("\n")}`
  )
  .join("\n\n");

const FOOTER = `---

- [Tous les outils](${absolute("/tools")})
- [À propos](${absolute("/about")})
- [Contact](${absolute("/contact")})
- [Politique de confidentialité](${absolute("/legal/privacy")})
- [Conditions d'utilisation](${absolute("/legal/terms")})
- [Code source](${PROJECT_CONFIG.project.github})
- [Index pour les agents](${absolute("/llms.txt")})
`;

const SUMMARY = `${PROJECT_CONFIG.name} réunit ${tools.length} outils de développement gratuits, sans compte et open source (licence ${PROJECT_CONFIG.project.license}). Ils s'adressent aux développeurs et aux créatifs et tournent dans le navigateur : les textes et les images sont traités sur l'appareil. Seule la traduction de la synthèse vocale passe par un service tiers, à la demande de l'utilisateur.`;

function homePage() {
  return `# ${PROJECT_CONFIG.name}\n\n${SUMMARY}\n\n## Outils\n\n${TOOL_LIST}\n\n${FOOTER}`;
}

function toolsPage() {
  return `# Tous les outils\n\n${tools.length} outils gratuits, qui tournent dans le navigateur et ne demandent aucun compte.\n\n${TOOL_LIST}\n\n${FOOTER}`;
}

const PAGES: Record<string, () => string> = {
  "/": homePage,
  "/tools": toolsPage,
  "/about": () =>
    `# À propos de ${PROJECT_CONFIG.name}\n\n${SUMMARY}\n\n${PROJECT_CONFIG.name} est créé par ${PROJECT_CONFIG.creator.name} (${PROJECT_CONFIG.creator.alias}) pour [${PROJECT_CONFIG.company.name}](${PROJECT_CONFIG.company.website}). Le code source est public sur [GitHub](${PROJECT_CONFIG.project.github}).\n\n${FOOTER}`,
  "/contact": () =>
    `# Contact\n\n- Un problème ou une idée : [ouvrir une issue sur GitHub](${PROJECT_CONFIG.project.github}/issues).\n- Une question, ou l'exercice de tes droits sur tes données : ${PROJECT_CONFIG.contact.email}.\n\n${PROJECT_CONFIG.name} est développé par ${PROJECT_CONFIG.creator.name} pour [${PROJECT_CONFIG.company.name}](${PROJECT_CONFIG.company.website}).\n\n${FOOTER}`,
  "/legal/privacy": () =>
    `# Politique de confidentialité\n\nLe texte complet est publié sur [la page dédiée](${absolute("/legal/privacy")}). En résumé : le site collecte des statistiques d'usage anonymes, ni nom ni adresse e-mail, et ne collecte pas le contenu traité par les outils.\n\n${FOOTER}`,
  "/legal/terms": () =>
    `# Conditions générales d'utilisation\n\nLe texte complet est publié sur [la page dédiée](${absolute("/legal/terms")}). Le service est gratuit, fourni en l'état, et régi par le droit français.\n\n${FOOTER}`,
};

export interface MarkdownPage {
  status: 200 | 404;
  body: string;
}

/** La version Markdown d'un chemin du site, ou une page 404 qui oriente. */
export function renderMarkdown(path: string): MarkdownPage {
  const normalized = path.length > 1 ? path.replace(/\/$/, "") : path;

  const page = PAGES[normalized];
  if (page) return { status: 200, body: page() };

  const tool = getToolMetadataByRoute(normalized);
  if (tool) {
    return {
      status: 200,
      body: `# ${tool.name}\n\n${tool.description}\n\n${tool.about}\n\nCatégorie : ${tool.category}. [Ouvrir l'outil](${absolute(tool.route)}).\n\n${FOOTER}`,
    };
  }

  return {
    status: 404,
    body: `# Page introuvable\n\nLe chemin \`${normalized}\` n'existe pas sur ${PROJECT_CONFIG.name}. La liste des outils est sur [${absolute("/tools")}](${absolute("/tools")}), et l'index complet du site sur [${absolute("/llms.txt")}](${absolute("/llms.txt")}).\n\n${FOOTER}`,
  };
}

/** L'index du site pour les agents, au format llms.txt. */
export function renderLlmsTxt(): string {
  const sections = getToolGroups()
    .map(
      ({ category, items }) =>
        `## ${category}\n\n${items
          .map(
            (tool) =>
              `- [${tool.name}](${absolute(tool.route)}): ${tool.description}`
          )
          .join("\n")}`
    )
    .join("\n\n");

  return `# ${PROJECT_CONFIG.name}

> ${SUMMARY}

Chaque page existe aussi en Markdown : envoyer l'en-tête \`Accept: text/markdown\`.

${sections}

## Le site

- [À propos](${absolute("/about")}): qui fait ${PROJECT_CONFIG.name}, et comment
- [Contact](${absolute("/contact")}): signaler un problème, poser une question
- [Confidentialité](${absolute("/legal/privacy")}): les données collectées
- [Conditions d'utilisation](${absolute("/legal/terms")}): le cadre du service
- [Code source](${PROJECT_CONFIG.project.github}): le dépôt GitHub
`;
}
