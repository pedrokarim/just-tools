import { renderMarkdown } from "@/lib/site-markdown";

/**
 * La version Markdown d'une page, atteinte par la réécriture de `middleware.ts`.
 * Le statut suit le contenu : un chemin inconnu reste un vrai 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const { status, body } = renderMarkdown(`/${path.join("/")}`);

  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
    },
  });
}
