import { prisma } from "@/lib/prisma";
import ArtefactGeneratorClient from "./page.client";
import { Suspense } from "react";

// Fonction pour récupérer les données côté serveur
async function getArtifactsData() {
  try {
    const allArtifacts = await prisma.artifactSet.findMany({
      orderBy: { name: "asc" },
    });

    return allArtifacts.map((artifact) => ({
      name: artifact.name,
      description: artifact.description,
      images: artifact.images,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des artefacts:", error);
    return [];
  }
}

export default async function ArtefactGenerator() {
  // Charger les données côté serveur
  const serverArtifacts = await getArtifactsData();
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
