import { cookies } from "next/headers";
import { createAscenciaServer, type AscenciaServer } from "@ascencia/id-server/next";
import { AscenciaContext } from "@ascencia/id-server";
import { prismaSessionStore } from "./ascencia-session-store";

/**
 * L'authentification de Just Tools, déléguée à Ascencia ID.
 *
 * ── Ce qui a changé, et pourquoi ───────────────────────────────────────────
 *
 * Avant : NextAuth avec Discord, et une liste blanche dans la variable
 * d'environnement `AUTHORIZED_USERS`. Ça marchait, mais ouvrir l'accès à
 * quelqu'un demandait d'éditer un `.env` et de **redéployer**. Il n'existait ni
 * trace de qui avait ouvert l'accès, ni retrait, ni expiration, ni nuance entre
 * « administrateur » et « peut voir la démonstration ».
 *
 * Maintenant : l'application est déclarée dans Ascencia ID en `invite_only`.
 * On invite une adresse depuis la console, la personne rejoint, on révoque
 * quand on veut — et **rien ne se redéploie**. Le journal d'audit garde la
 * trace de chaque geste.
 *
 * Discord reste le moyen de se connecter : il est simplement passé derrière
 * l'IdP, qui devient le seul à parler OAuth à des tiers.
 *
 * ── Client confidentiel ────────────────────────────────────────────────────
 *
 * Les jetons restent côté serveur ; le navigateur ne reçoit qu'un identifiant
 * opaque dans un cookie `httpOnly`. Un XSS sur le site ne suffit donc pas à
 * voler un accès.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[auth] ${name} est absent de l'environnement.`);
  }
  return value;
}

/**
 * Vérifie que la configuration d'Ascencia ID est complète.
 *
 * Appelée par `src/instrumentation.ts`, donc au démarrage du serveur : une
 * variable oubliée doit se voir au déploiement, pas le jour où quelqu'un se
 * connecte. Jamais pendant le build : l'image se construit sans le secret
 * client, qui n'a rien à faire dans une couche Docker.
 */
export function assertAuthConfig(): void {
  required("ASCENCIA_ISSUER");
  required("ASCENCIA_CLIENT_ID");
  required("ASCENCIA_CLIENT_SECRET");
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

let server: AscenciaServer | undefined;

/**
 * Le client Ascencia ID, construit au premier usage et non à l'import.
 *
 * Construit à l'import, il exigeait ses variables dès que Next chargeait une
 * route qui en dépend pour collecter ses données, c'est-à-dire pendant le
 * build. Sur Vercel, le secret était présent au build ; dans une image Docker,
 * il ne doit pas l'être.
 */
export function getAscencia(): AscenciaServer {
  server ??= createAscenciaServer({
    issuer: required("ASCENCIA_ISSUER"),
    clientId: required("ASCENCIA_CLIENT_ID"),
    clientSecret: required("ASCENCIA_CLIENT_SECRET"),
    /*
     * Dérivée de l'URL du site, surchargeable par `ASCENCIA_REDIRECT_URI`.
     *
     * Cette valeur doit correspondre **au caractère près** à une URI enregistrée
     * dans la console : la comparaison est exacte, jamais un préfixe, et c'est ce
     * qui empêche un open redirect. La faire dépendre de `NEXT_PUBLIC_SITE_URL`
     * est pratique en production, et piégeux ailleurs — cette variable sert aussi
     * aux liens de partage et aux images, donc quelqu'un peut la changer sans
     * penser à l'authentification.
     *
     * En développement local, l'IdP occupe 3000 et Just Tools 3001 : la
     * surcharge évite d'avoir à tordre une variable qui ne parle pas de ça.
     */
    redirectUri: process.env.ASCENCIA_REDIRECT_URI ?? `${siteUrl}/api/auth/callback`,
    // Obligatoire ici : Vercel est serverless, la mémoire ne survit pas d'une
    // invocation à l'autre (voir `ascencia-session-store.ts`).
    /*
     * Les scopes sont explicites, et `ascencia.perms` n'est pas décoratif.
     *
     * C'est lui qui fait émettre la revendication `perms` du jeton — celle que
     * `context.can()` lit. Sans lui, `can()` rend **false pour tout**, sans
     * erreur ni avertissement : l'application refuse tout le monde et rien
     * n'explique pourquoi. C'est ce qui est arrivé au premier essai.
     *
     * Le SDK l'a désormais dans ses défauts, mais les déclarer ici reste plus
     * sûr : un défaut se déplace d'une version à l'autre, une liste écrite non.
     */
    scopes: ["openid", "profile", "email", "ascencia.roles", "ascencia.perms"],
    sessionStore: prismaSessionStore(),
    defaultRedirect: "/admin",
  });
  return server;
}

/**
 * Le contexte de la requête courante, ou `null`.
 *
 * Garde le nom `auth()` de NextAuth pour ne pas réécrire tous les appelants,
 * mais **ne rend pas la même chose** : un `AscenciaContext` porte les rôles et
 * les permissions résolus, là où une session NextAuth ne portait qu'un
 * identifiant. C'est ce qui permet à `requireAdmin()` de poser une vraie
 * question — « cette personne a-t-elle le droit ? » — au lieu de comparer un
 * identifiant Discord à une liste.
 */
export async function auth(): Promise<AscenciaContext | null> {
  const jar = await cookies();
  return getAscencia().getContext(jar);
}

export interface AscenciaProfile {
  sub: string;
  name: string | null;
  email: string | null;
  picture: string | null;
}

/**
 * Le profil affichable, lu chez l'IdP.
 *
 * Il n'est **pas** dans le jeton d'accès, et c'est volontaire : un jeton
 * d'accès autorise, il n'identifie pas. Le nom et l'avatar se demandent à
 * `/oauth/userinfo`, avec le jeton, au moment où l'on en a besoin.
 */
export async function getProfile(): Promise<AscenciaProfile | null> {
  const jar = await cookies();
  const token = await getAscencia().getAccessToken(jar);
  if (!token) return null;

  try {
    const response = await fetch(`${required("ASCENCIA_ISSUER")}/oauth/userinfo`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const claims = (await response.json()) as Record<string, unknown>;
    return {
      sub: String(claims.sub ?? ""),
      name: typeof claims.name === "string" ? claims.name : null,
      email: typeof claims.email === "string" ? claims.email : null,
      picture: typeof claims.picture === "string" ? claims.picture : null,
    };
  } catch {
    // Un profil illisible ne doit pas casser une page : on affiche ce qu'on a.
    return null;
  }
}

/** Où envoyer quelqu'un pour qu'il se connecte. */
export function signInUrl(returnTo = "/admin"): string {
  return `/api/auth/signin?redirect=${encodeURIComponent(returnTo)}`;
}

/**
 * Où envoyer quelqu'un pour qu'il se déconnecte.
 *
 * `global` ferme aussi la session Ascencia ID, donc partout. Sans lui, la
 * personne quitte Just Tools mais reste connectée à l'IdP — ce qui est le bon
 * défaut sur un poste partagé avec d'autres applications, et le mauvais sur un
 * poste public.
 */
export function signOutUrl(global = false): string {
  return `/api/auth/signout${global ? "?global=1" : ""}`;
}
