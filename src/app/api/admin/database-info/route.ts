import { NextResponse } from "next/server";
import { getDatabaseType } from "@/lib/database-config";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

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
