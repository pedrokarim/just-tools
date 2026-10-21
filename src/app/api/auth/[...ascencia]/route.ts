import { getAscencia } from "@/lib/auth";

/**
 * Les routes d'authentification : `signin`, `callback`, `signout`, `session`.
 *
 * Elles remplacent `[...nextauth]`. Le chemin change parce que les segments
 * attrape-tout ne peuvent pas coexister au même endroit — et parce qu'un nom
 * qui dit ce qu'il fait vaut mieux qu'un nom hérité.
 *
 * Le client est demandé à chaque requête, pas à l'import : sinon le build,
 * qui charge ce module, exigerait le secret client (voir `getAscencia`).
 *
 * Derrière nginx, la requête arrive sur l'adresse d'écoute du serveur
 * (`0.0.0.0:3000`) : le SDK, depuis `0.1.0-rc.2`, redirige sur un chemin
 * relatif et ne s'en sert plus.
 */
export function GET(request: Request) {
  return getAscencia().handlers.GET(request);
}

export function POST(request: Request) {
  return getAscencia().handlers.POST(request);
}

/*
 * Rien ne doit être mis en cache ici : la réponse dépend d'un cookie, et une
 * mise en cache de bord servirait la session de quelqu'un d'autre.
 */
export const dynamic = "force-dynamic";
