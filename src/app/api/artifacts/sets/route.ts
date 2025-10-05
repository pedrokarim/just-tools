import { NextResponse } from "next/server";
import { getAvailableArtifactSets } from "@/lib/artefact-generator/artifact-service";

export async function GET() {
  try {
    const sets = await getAvailableArtifactSets();
    return NextResponse.json({ sets });
  } catch (error) {
    console.error("Erreur lors de la récupération des sets d'artefacts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sets d'artefacts" },
      { status: 500 }
    );
  }
}
