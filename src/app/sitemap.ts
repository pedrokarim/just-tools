import type { MetadataRoute } from "next";
import { PROJECT_CONFIG } from "@/lib/constants";
import { getReadyTools } from "@/lib/tools-metadata";

/**
 * Le sitemap, dérivé de la liste des outils : un outil prêt y entre seul.
 *
 * Il remplace un `public/sitemap.xml` écrit à la main, auquel manquaient deux
 * outils et dont toutes les dates étaient figées au 19/12/2024.
 *
 * Pas de `lastModified` : une date fausse finit ignorée par Google, et aucune
 * source fiable ne dit ici quand une page a changé. Les pages légales n'y sont
 * pas : elles restent accessibles par le pied de page, mais on ne demande pas
 * leur indexation.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/tools", "/about", ...getReadyTools().map((tool) => tool.route)];
  return paths.map((path) => ({ url: new URL(path, PROJECT_CONFIG.baseUrl).toString() }));
}
