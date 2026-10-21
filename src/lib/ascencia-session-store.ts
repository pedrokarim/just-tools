import type { SessionRecord, SessionStore } from "@ascencia/id-server/next";
import { prisma } from "./prisma";

/**
 * Le magasin de sessions d'Ascencia ID, adossé à Postgres.
 *
 * ── Pourquoi pas la mémoire ────────────────────────────────────────────────
 *
 * L'adaptateur Next d'Ascencia ID range les jetons en mémoire par défaut. Just
 * Tools tourne dans un seul processus, mais ce processus est remplacé à chaque
 * déploiement (`deploy.sh` recrée le conteneur) : en mémoire, chaque mise en
 * ligne déconnecterait tout le monde, sans erreur nulle part. Mieux vaut la
 * table.
 *
 * ── Ce que la table contient ───────────────────────────────────────────────
 *
 * Les jetons OAuth, et rien d'autre. Ils ne sortent jamais du serveur : le
 * navigateur ne reçoit qu'un identifiant opaque dans un cookie `httpOnly`. Un
 * XSS sur le site ne suffit donc pas à voler un accès.
 *
 * Corollaire : quiconque lit cette table peut agir au nom des sessions en
 * cours, jusqu'à leur expiration. Elle est aussi sensible que la table des
 * sessions qu'elle remplace, ni plus ni moins.
 *
 * Une lecture illisible — JSON corrompu, format changé — ferme la session au
 * lieu de lever : une session qu'on ne sait pas relire n'est pas une session.
 */
export function prismaSessionStore(): SessionStore {
  return {
    async get(id) {
      const row = await prisma.ascenciaSession.findUnique({ where: { id } });
      if (!row) return null;

      // L'expiration est vérifiée **ici** et pas seulement par le ménage
      // périodique : une ligne périmée mais pas encore effacée ne doit jamais
      // ouvrir une session.
      if (row.expiresAt <= new Date()) {
        await prisma.ascenciaSession.delete({ where: { id } }).catch(() => {});
        return null;
      }

      // `data` est du texte : le schéma SQLite de développement ne connaît pas
      // le type `Json`, et une colonne présente dans une seule des deux
      // variantes ferait diverger les schémas sans que rien ne le signale.
      try {
        return JSON.parse(row.data) as SessionRecord;
      } catch {
        await prisma.ascenciaSession.delete({ where: { id } }).catch(() => {});
        return null;
      }
    },

    async set(id, record, ttlSeconds) {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      const data = JSON.stringify(record);

      // `upsert` et non `create` : le rafraîchissement d'un jeton réécrit la
      // même ligne, et une contrainte violée déconnecterait l'utilisateur au
      // moment précis où l'on prolongeait sa session.
      await prisma.ascenciaSession.upsert({
        where: { id },
        create: { id, data, expiresAt },
        update: { data, expiresAt },
      });
    },

    async delete(id) {
      // Une session déjà absente n'est pas une erreur : la déconnexion doit
      // aboutir même si le ménage est passé avant.
      await prisma.ascenciaSession.delete({ where: { id } }).catch(() => {});
    },
  };
}

/**
 * Efface les sessions expirées.
 *
 * À appeler depuis une tâche planifiée, ou au fil de l'eau. Sans ménage la
 * table grossit indéfiniment : chaque connexion y laisse une ligne, et rien ne
 * la retire quand l'utilisateur ferme simplement son navigateur.
 */
export async function purgeExpiredSessions(): Promise<number> {
  const { count } = await prisma.ascenciaSession.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  return count;
}
