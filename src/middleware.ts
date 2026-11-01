import { NextResponse, type NextRequest } from "next/server";

/**
 * Sert le Markdown à qui le demande. Un navigateur n'envoie jamais
 * `text/markdown` : tout ce qui suit ne concerne que les agents et les outils qui
 * négocient explicitement ce format.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  const markdown = accept.indexOf("text/markdown");
  if (markdown === -1) return false;

  const html = accept.indexOf("text/html");
  return html === -1 || markdown < html;
}

export function middleware(request: NextRequest) {
  if (prefersMarkdown(request.headers.get("accept"))) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Les pages seulement : ni les fichiers statiques, ni l'API, ni l'administration.
  matcher: ["/((?!_next/|api/|admin|assets/|.*\\.[a-z0-9]+$).*)"],
};
