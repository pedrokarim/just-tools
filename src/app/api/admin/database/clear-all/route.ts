import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Supprimer toutes les données dans l'ordre pour éviter les erreurs de contrainte
    const deletedPageViews = await prisma.pageView.deleteMany({});
    const deletedVisitors = await prisma.uniqueVisitor.deleteMany({});
    const deletedLoginAttempts = await prisma.loginAttempt.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Toutes les données ont été supprimées avec succès",
      deleted: {
        pageViews: deletedPageViews.count,
        visitors: deletedVisitors.count,
        loginAttempts: deletedLoginAttempts.count,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de toutes les données:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
