import { prisma } from "@/lib/prisma";
import ArtefactGeneratorClient from "./page.client";
import { Suspense } from "react";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { ARTIFACT_SETS_TAG } from "@/lib/artefact-generator/artifact-cache";

const title = "Simulateur d'Artefacts Genshin Impact";
const description =
  "Générez des artefacts aléatoires de Genshin Impact avec les vraies probabilités du jeu : sets, statistiques principales et sous-statistiques.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/artefact-generator" },
  openGraph: {
    title,
    description,
    url: "https://just-tools.ascencia.re/tools/artefact-generator",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${title} - Just Tools` }],
  },
};

/**
 * Rendue à la requête, jamais au build.
 *
 * Pré-rendue, la page lisait la base pendant `next build`. Sur Vercel, la base
 * était joignable au build ; l'image Docker se construit sans elle, et la page
 * était figée avec une liste de sets vide : l'outil n'avait plus rien à
 * proposer.
 */
export const dynamic = "force-dynamic";

/**
 * Les sets ne changent qu'au rechargement depuis l'admin : un jour de cache
 * évite une requête en base, et un réveil de Neon, à chaque visite. Une erreur
 * est levée, donc jamais mise en cache : seule une liste réellement lue l'est.
 */
const getArtifactsData = unstable_cache(
  async () => {
    const allArtifacts = await prisma.artifactSet.findMany({
      orderBy: { name: "asc" },
    });

    return allArtifacts.map((artifact) => ({
      name: artifact.name,
      description: artifact.description,
      images: artifact.images,
    }));
  },
  [ARTIFACT_SETS_TAG],
  { revalidate: 86_400, tags: [ARTIFACT_SETS_TAG] },
);

async function loadArtifacts() {
  try {
    return await getArtifactsData();
  } catch (error) {
    console.error("Erreur lors de la récupération des artefacts:", error);
    return [];
  }
}

export default async function ArtefactGenerator() {
  // Charger les données côté serveur
  const serverArtifacts = await loadArtifacts();
  const availableSetNames = serverArtifacts.map((artifact) => artifact.name);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">
              Chargement du générateur d'artefacts...
            </p>
          </div>
        </div>
      }
    >
      <ArtefactGeneratorClient
        initialArtifacts={serverArtifacts}
        initialAvailableSets={availableSetNames}
      />
    </Suspense>
  );
}
