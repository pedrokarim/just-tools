import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Garde d'accès aux routes API d'administration.
 *
 * La logique existait déjà, recopiée dans quatre fichiers
 * (`api/admin/artifacts/cache`, `api/auth/check-authorization`,
 * `api/geolocation`, `lib/auth`). Elle est centralisée ici : toute route sous
 * `/api/admin/*`, ainsi que les endpoints analytics destructifs ou exposant des
 * données, doivent l'appeler.
 *
 * Deux contrôles, et le second n'est pas redondant : le callback `signIn` de
 * `lib/auth.ts` refuse déjà les Discord absents de `AUTHORIZED_USERS`, donc une
 * session existante implique une autorisation *au moment de la connexion*. Sans
 * revérification, retirer quelqu'un de la liste ne révoquerait pas sa session en
 * cours. On revalide donc à chaque requête.
 */

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  discordId: string;
}

type AdminGuard =
  | { ok: true; user: AdminUser }
  | { ok: false; response: NextResponse };

function deny(status: 401 | 403, error: string): AdminGuard {
  return {
    ok: false,
    response: NextResponse.json({ success: false, error }, { status }),
  };
}

/**
 * À appeler en première ligne du handler :
 *
 * ```ts
 * const guard = await requireAdmin();
 * if (!guard.ok) return guard.response;
 * ```
 */
export async function requireAdmin(): Promise<AdminGuard> {
  try {
    const session = await auth();

    // 401 : pas de session. Distinct du 403 ci-dessous — se reconnecter peut
    // résoudre le premier, jamais le second.
    if (!session?.user?.id) {
      return deny(401, "Authentification requise");
    }

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "discord" },
      select: { providerAccountId: true },
    });

    if (!account) {
      return deny(403, "Accès refusé");
    }

    const authorizedUsers = (process.env.AUTHORIZED_USERS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    // Liste vide = personne n'est admin. Un `AUTHORIZED_USERS` oublié doit
    // fermer l'accès, pas l'ouvrir à tous.
    if (!authorizedUsers.includes(account.providerAccountId)) {
      return deny(403, "Accès refusé");
    }

    return {
      ok: true,
      user: {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        discordId: account.providerAccountId,
      },
    };
  } catch (error) {
    // Un incident (base injoignable, session illisible) ne doit jamais ouvrir
    // la route : on refuse et on trace.
    console.error("[admin-auth] Échec de la vérification :", error);
    return deny(403, "Accès refusé");
  }
}
