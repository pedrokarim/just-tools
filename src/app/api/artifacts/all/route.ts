import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Récupérer TOUS les sets d'artefacts avec leurs détails
    const allArtifacts = await prisma.artifactSet.findMany({
      orderBy: { name: "asc" },
    });

    // Transformer les données pour le client
    const artifactsData = allArtifacts.map((artifact) => ({
      name: artifact.name,
      description: artifact.description,
      images: artifact.images,
    }));

    return NextResponse.json({
      artifacts: artifactsData,
      count: artifactsData.length,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de tous les artefacts:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des artefacts" },
      { status: 500 }
    );
  }
}
