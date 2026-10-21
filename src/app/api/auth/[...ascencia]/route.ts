import type { AscenciaServer } from "@ascencia/id-server/next";
import { getAscencia } from "@/lib/auth";

type Handlers = AscenciaServer["handlers"];

/**
 * Les routes d'authentification : `signin`, `callback`, `signout`, `session`.
 *
 * Elles remplacent `[...nextauth]`. Le chemin change parce que les segments
 * attrape-tout ne peuvent pas coexister au même endroit — et parce qu'un nom
 * qui dit ce qu'il fait vaut mieux qu'un nom hérité.
 *
 * Le client est demandé à chaque requête, pas à l'import : sinon le build,
 * qui charge ce module, exigerait le secret client (voir `getAscencia`).
 */
export function GET(...args: Parameters<Handlers["GET"]>) {
  return getAscencia().handlers.GET(...args);
}

export function POST(...args: Parameters<Handlers["POST"]>) {
  return getAscencia().handlers.POST(...args);
}

/*
 * Rien ne doit être mis en cache ici : la réponse dépend d'un cookie, et une
 * mise en cache de bord servirait la session de quelqu'un d'autre.
 */
export const dynamic = "force-dynamic";
