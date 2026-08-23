import { ascencia } from "@/lib/auth";

/**
 * Les routes d'authentification : `signin`, `callback`, `signout`, `session`.
 *
 * Elles remplacent `[...nextauth]`. Le chemin change parce que les segments
 * attrape-tout ne peuvent pas coexister au même endroit — et parce qu'un nom
 * qui dit ce qu'il fait vaut mieux qu'un nom hérité.
 */
export const { GET, POST } = ascencia.handlers;

/*
 * Rien ne doit être mis en cache ici : la réponse dépend d'un cookie, et une
 * mise en cache de bord servirait la session de quelqu'un d'autre.
 */
export const dynamic = "force-dynamic";
