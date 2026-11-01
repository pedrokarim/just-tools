import { renderLlmsTxt } from "@/lib/site-markdown";

export const dynamic = "force-static";

/** L'index du site pour les agents, dérivé des métadonnées des outils. */
export function GET() {
  return new Response(renderLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
