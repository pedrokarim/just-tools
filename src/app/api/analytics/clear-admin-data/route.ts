import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Supprimer toutes les vues de pages admin
    const deletedPageViews = await prisma.pageView.deleteMany({
      where: {
        pagePath: {
          startsWith: "/admin",
        },
      },
    });

    // Supprimer tous les visiteurs uniques (ils seront recréés automatiquement)
    const deletedVisitors = await prisma.uniqueVisitor.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Données admin nettoyées avec succès",
      deleted: {
        pageViews: deletedPageViews.count,
        visitors: deletedVisitors.count,
      },
    });
  } catch (error) {
    console.error("Erreur lors du nettoyage des données admin:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du nettoyage" },
      { status: 500 }
    );
  }
}
