import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les données
    const pageViews = await prisma.pageView.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });

    const uniqueVisitors = await prisma.uniqueVisitor.findMany({
      orderBy: {
        lastVisit: "desc",
      },
    });

    const loginAttempts = await prisma.loginAttempt.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });

    // Préparer les données d'export
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalPageViews: pageViews.length,
        totalUniqueVisitors: uniqueVisitors.length,
        totalLoginAttempts: loginAttempts.length,
      },
      data: {
        pageViews,
        uniqueVisitors,
        loginAttempts,
      },
    };

    // Convertir en JSON et créer le blob
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="database-export-${
          new Date().toISOString().split("T")[0]
        }.json"`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'export des données:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}
