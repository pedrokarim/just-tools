// Par défaut, la sonde ne vérifie que le processus : Docker l'interroge toutes
// les 30 s, et une requête en base à ce rythme empêcherait le calcul Neon de
// se mettre en veille. `?db=1` ajoute un `SELECT 1`, appelé rarement : par
// `deploy.sh` et par la sonde externe toutes les 15 minutes.
//
// nginx réserve cette route à la machine elle-même. Elle ne renvoie aucune
// donnée : un 200 ou un 503, jamais mis en cache.

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 5_000;
const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get("db") !== "1") {
    return Response.json({ ok: true }, { headers: NO_STORE });
  }

  try {
    // Délai plus large que pour une base locale : Neon peut sortir de veille.
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), DB_TIMEOUT_MS)),
    ]);
    return Response.json({ ok: true, db: true }, { headers: NO_STORE });
  } catch {
    return Response.json({ ok: false, db: false }, { status: 503, headers: NO_STORE });
  }
}
