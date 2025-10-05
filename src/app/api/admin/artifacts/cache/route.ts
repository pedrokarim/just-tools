import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  refreshArtifactCache,
  getCacheStats,
  initializeArtifactService,
} from "@/lib/artefact-generator/artifact-service";

/**
 * Vérifie si l'utilisateur est autorisé à accéder aux fonctions admin
 */
async function checkAdminAuthorization(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return { authorized: false, reason: "Non connecté" };
    }

    // Récupérer l'account Discord associé à cette session
    const account = await (prisma as any).account.findFirst({
      where: {
        userId: session.user.id,
        provider: "discord",
      },
    });

    if (!account) {
      return { authorized: false, reason: "Aucun compte Discord trouvé" };
    }

    const discordId = account.providerAccountId;

    // Vérifier si l'utilisateur est autorisé
    const authorizedUsers = process.env.AUTHORIZED_USERS?.split(",") || [];
    const isAuthorized = authorizedUsers.includes(discordId);

    return {
      authorized: isAuthorized,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        discordId: discordId,
      },
      reason: isAuthorized ? undefined : "Utilisateur non autorisé",
    };
  } catch (error) {
    console.error("Erreur lors de la vérification d'autorisation:", error);
    return { authorized: false, reason: "Erreur de vérification" };
  }
}

/**
 * GET /api/admin/artifacts/cache - Récupère les statistiques du cache (ADMIN ONLY)
 */
export async function GET(request: NextRequest) {
  // Vérifier l'autorisation admin
  const authCheck = await checkAdminAuthorization(request);
  if (!authCheck.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: `Accès refusé: ${authCheck.reason}`,
      },
      { status: 403 }
    );
  }
  try {
    const stats = await getCacheStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques du cache:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des statistiques du cache",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/artifacts/cache - Force la mise à jour du cache (ADMIN ONLY)
 */
export async function POST(request: NextRequest) {
  // Vérifier l'autorisation admin
  const authCheck = await checkAdminAuthorization(request);
  if (!authCheck.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: `Accès refusé: ${authCheck.reason}`,
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "refresh") {
      const result = await refreshArtifactCache();

      return NextResponse.json({
        success: result.success,
        data: {
          count: result.count,
          message: result.success
            ? `Cache mis à jour avec ${result.count} sets d'artefacts`
            : "Erreur lors de la mise à jour du cache",
        },
        error: result.error,
      });
    }

    if (action === "init") {
      await initializeArtifactService();

      return NextResponse.json({
        success: true,
        data: {
          message: "Service d'artefacts initialisé avec succès",
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Action non reconnue. Actions disponibles: refresh, init",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cache:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour du cache",
      },
      { status: 500 }
    );
  }
}
