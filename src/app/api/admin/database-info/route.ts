import { NextResponse } from "next/server";
import { getDatabaseType } from "@/lib/database-config";

export async function GET() {
  try {
    const databaseType = getDatabaseType();

    return NextResponse.json({
      type: databaseType,
      provider: databaseType === "sqlite" ? "SQLite" : "PostgreSQL",
      status: "connected",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des informations de base de données:",
      error
    );

    return NextResponse.json(
      {
        type: "unknown",
        provider: "Inconnu",
        status: "error",
      },
      { status: 500 }
    );
  }
}
