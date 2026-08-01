import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Beacon de tracking. Seule route analytics volontairement publique : elle est
 * appelée par chaque visiteur, une session ne peut donc pas être exigée.
 *
 * D'où les deux garde-fous ci-dessous. Sans eux, n'importe qui pouvait écrire
 * en boucle dans la base, avec des champs de longueur arbitraire.
 */

const LIMIT = 60; // requêtes…
const WINDOW_MS = 60_000; // …par minute et par IP

/** Bornes de longueur, alignées sur ce que le schéma peut raisonnablement stocker. */
const MAX = {
  pagePath: 512,
  fingerprint: 128,
  userAgent: 512,
  country: 64,
  city: 128,
} as const;

/**
 * Retient une chaîne non vide, tronquée. Tout le reste (nombre, objet, null)
 * devient `undefined` plutôt que d'être écrit tel quel en base.
 */
function str(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

export async function POST(request: NextRequest) {
  const ipAddress = clientIp(request.headers);

  const limit = rateLimit(`analytics:record:${ipAddress}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const body = await request.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }

    const pagePath = str(body.pagePath, MAX.pagePath);

    // Seul champ réellement indispensable : sans lui, l'enregistrement ne veut
    // rien dire.
    if (!pagePath) {
      return NextResponse.json({ error: "pagePath requis" }, { status: 400 });
    }

    await recordPageView({
      pagePath,
      userAgent: str(body.userAgent, MAX.userAgent),
      ipAddress,
      fingerprint: str(body.fingerprint, MAX.fingerprint),
      country: str(body.country, MAX.country),
      city: str(body.city, MAX.city),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vue de page:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}
