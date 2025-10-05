import { prisma } from "@/lib/prisma";
import ArtefactGeneratorClient from "./page.client";

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
    <ArtefactGeneratorClient
      initialArtifacts={serverArtifacts}
      initialAvailableSets={availableSetNames}
    />
  );
}
