import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Vérifier si c'est une route admin (sauf login et access-denied)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const path = request.nextUrl.pathname;

    // Permettre l'accès aux pages de connexion et d'erreur
    if (path === "/admin/login" || path === "/admin/access-denied") {
      return NextResponse.next();
    }

    // Pour toutes les autres routes admin, laisser passer
    // La vérification d'autorisation se fait dans AuthGuard côté client
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
