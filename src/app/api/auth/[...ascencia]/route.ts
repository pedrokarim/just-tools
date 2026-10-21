import { getAscencia, withPublicOrigin } from "@/lib/auth";

/**
 * Les routes d'authentification : `signin`, `callback`, `signout`, `session`.
 *
 * Elles remplacent `[...nextauth]`. Le chemin change parce que les segments
 * attrape-tout ne peuvent pas coexister au même endroit — et parce qu'un nom
 * qui dit ce qu'il fait vaut mieux qu'un nom hérité.
 *
 * Le client est demandé à chaque requête, pas à l'import : sinon le build,
 * qui charge ce module, exigerait le secret client (voir `getAscencia`). Et la
 * requête lui est passée avec l'adresse publique du site, sur laquelle il
 * construit ses redirections (voir `withPublicOrigin`).
 */
export function GET(request: Request) {
  return getAscencia().handlers.GET(withPublicOrigin(request));
}

export function POST(request: Request) {
  return getAscencia().handlers.POST(withPublicOrigin(request));
}

/*
 * Rien ne doit être mis en cache ici : la réponse dépend d'un cookie, et une
 * mise en cache de bord servirait la session de quelqu'un d'autre.
 */
export const dynamic = "force-dynamic";
