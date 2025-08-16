import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extraire les données du body
    const { pagePath, fingerprint, userAgent, timestamp, country, city } = body;

    // Récupérer l'IP depuis les headers
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Enregistrer la vue de page avec toutes les données
    await recordPageView({
      pagePath,
      userAgent,
      ipAddress,
      fingerprint,
      country,
      city,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vue de page:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}
