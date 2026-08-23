import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Garde d'accès aux routes API d'administration.
 *
 * ── Ce que la question est devenue ─────────────────────────────────────────
 *
 * Avant, la garde demandait : « le compte Discord de cette session est-il dans
 * `AUTHORIZED_USERS` ? » — une comparaison de chaîne contre une variable
 * d'environnement, binaire, sans nuance et sans trace.
 *
 * Maintenant elle demande : « cette personne détient-elle la permission ? ».
 * Ascencia ID résout les rôles, la politique d'accès de l'application et
 * d'éventuels bannissements, et le jeton porte le résultat. Ouvrir l'accès à
 * quelqu'un ne demande plus de redéploiement, et le retirer prend effet à la
 * requête suivante.
 *
 * ── Ce qui n'a pas changé, et ne doit pas ──────────────────────────────────
 *
 * On revalide à **chaque requête**. Le jeton d'accès est court, mais il ne se
 * révoque pas instantanément : borner sa durée est ce qui limite la fenêtre
 * pendant laquelle un droit retiré s'applique encore.
 *
 * Et un incident — IdP injoignable, jeton illisible — refuse l'accès. Une
 * garde qui ouvre quand elle ne sait pas n'est pas une garde.
 */

/** La permission qui ouvre `/admin`. Déclarée dans `ascencia.manifest.json`. */
export const ADMIN_PERMISSION = "admin.access";

export interface AdminUser {
  /** L'identifiant Ascencia ID du compte. Stable, contrairement à un e-mail. */
  id: string;
  roles: readonly string[];
  permissions: readonly string[];
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
 *
 * Passer une permission plus fine quand la route le mérite — purger les
 * statistiques n'est pas lire une page :
 *
 * ```ts
 * const guard = await requireAdmin("admin.analytics.purge");
 * ```
 */
export async function requireAdmin(
  permission: string = ADMIN_PERMISSION,
): Promise<AdminGuard> {
  try {
    const context = await auth();

    // 401 : pas de session. Distinct du 403 ci-dessous — se reconnecter peut
    // résoudre le premier, jamais le second.
    if (!context) {
      return deny(401, "Authentification requise");
    }

    /*
     * « Je ne sais pas » n'est pas « non ».
     *
     * `can()` lit la revendication `perms` du jeton. Si elle est absente —
     * scope `ascencia.perms` non demandé, ou liste tronquée faute de place —
     * il rend `false` pour tout, sans distinguer l'ignorance du refus.
     *
     * Refuser en silence dans ce cas donne une application qui rejette tout le
     * monde sans que rien n'explique pourquoi. C'est exactement ce qui s'est
     * produit au premier branchement, et ça a coûté un moment à comprendre.
     */
    if (!context.hasPermissionClaim) {
      console.error(
        "[admin-auth] Le jeton ne porte pas de permissions : le scope `ascencia.perms` " +
          "est-il demandé et autorisé sur l'application ?",
      );
      return deny(403, "Permissions indisponibles");
    }

    if (!context.can(permission)) {
      return deny(403, "Accès refusé");
    }

    return {
      ok: true,
      user: {
        id: context.subject,
        roles: context.roles,
        permissions: context.permissions,
      },
    };
  } catch (error) {
    // Un incident ne doit jamais ouvrir la route : on refuse et on trace.
    console.error("[admin-auth] Échec de la vérification :", error);
    return deny(403, "Accès refusé");
  }
}

/**
 * Variante pour les composants serveur, qui ne rendent pas de `NextResponse`.
 *
 * Rend `null` plutôt que de lever : une page décide elle-même si elle redirige
 * vers la connexion ou affiche un écran de refus, et les deux sont légitimes.
 */
export async function getAdmin(
  permission: string = ADMIN_PERMISSION,
): Promise<AdminUser | null> {
  const guard = await requireAdmin(permission);
  return guard.ok ? guard.user : null;
}
