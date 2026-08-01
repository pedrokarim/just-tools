import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirige vers la page de connexion les visiteurs anonymes qui demandent une
 * page `/admin`.
 *
 * ⚠ Ce fichier n'est PAS une barrière de sécurité et ne doit pas être compté
 * comme telle. Il constate la *présence* d'un cookie de session sans le
 * vérifier, faute de pouvoir le faire ici : `auth()` s'appuie sur l'adaptateur
 * Prisma, indisponible sur le runtime edge où s'exécute ce fichier. C'est
 * vraisemblablement pour cette raison que la version précédente se contentait
 * de `NextResponse.next()` sur toutes ses branches.
 *
 * Les vraies barrières sont ailleurs :
 *   - `requireAdmin()` (src/lib/admin-auth.ts) sur chaque route `/api/admin/*`
 *     et les endpoints analytics sensibles — c'est là que sont les données ;
 *   - `AuthGuard` côté client pour le rendu des pages.
 *
 * L'apport ici est l'expérience : un visiteur non connecté part vers la
 * connexion au lieu de voir la coquille de l'admin se charger puis se vider.
 */

// Auth.js v5 : préfixe `__Secure-` en HTTPS, nom nu en développement.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ces deux pages restent joignables sans session, sinon la redirection
  // bouclerait sur elle-même.
  if (pathname === "/admin/login" || pathname === "/admin/access-denied") {
    return NextResponse.next();
  }

  const hasSessionCookie = SESSION_COOKIES.some(
    (name) => request.cookies.get(name)?.value
  );

  if (!hasSessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    // Permet de renvoyer l'utilisateur là où il allait après connexion.
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
