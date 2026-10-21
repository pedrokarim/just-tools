import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ARTIFACT_SETS_TAG } from "@/lib/artefact-generator/artifact-cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  refreshArtifactCache,
  getCacheStats,
  initializeArtifactService } from "@/lib/artefact-generator/artifact-service";

/**
 * La garde locale a disparu.
 *
 * Elle recopiait la même logique que trois autres fichiers : session, compte
 * Discord, comparaison à `AUTHORIZED_USERS`. Cette logique n'existe plus —
 * `requireAdmin()` pose la question à Ascencia ID, qui connaît les rôles.
 */
async function checkAdminAuthorization(_request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return { authorized: false, reason: "Accès refusé" } as const;
  }
  return {
    authorized: true,
    user: { id: guard.user.id, roles: guard.user.roles },
    reason: undefined,
  } as const;
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
      // La page du générateur garde la liste un jour : elle doit voir celle-ci.
      revalidateTag(ARTIFACT_SETS_TAG, { expire: 0 });

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
      revalidateTag(ARTIFACT_SETS_TAG, { expire: 0 });

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
