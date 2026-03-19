import { NextResponse } from "next/server";
import { getArtifactSetDetails } from "@/lib/artefact-generator/artifact-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setName: string }> }
) {
  try {
    const { setName } = await params;
    const decodedName = decodeURIComponent(setName);
    const details = await getArtifactSetDetails(decodedName);

    if (!details) {
      return NextResponse.json(
        { error: "Set d'artefacts non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ details });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du set:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails du set" },
      { status: 500 }
    );
  }
}
