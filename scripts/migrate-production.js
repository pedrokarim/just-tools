#!/usr/bin/env node

/**
 * Ce qui tourne à l'installation, donc à chaque build Vercel.
 *
 * ── Ce qu'il faisait, et pourquoi ça ne pouvait pas rester ─────────────────
 *
 * Il appelait `prisma db push --accept-data-loss` dès que `VERCEL` valait 1 —
 * c'est-à-dire **à chaque déploiement**, sur la base de production. `db push`
 * compare le schéma au vivant et applique la différence : un champ renommé, un
 * modèle retiré, et la colonne part sans un mot.
 *
 * Et l'erreur était avalée « pour ne pas faire échouer le build ». Une perte de
 * données pouvait donc traverser tout le pipeline sans qu'aucun voyant ne
 * s'allume.
 *
 * ── Ce qu'il fait maintenant ───────────────────────────────────────────────
 *
 * Il génère le client Prisma, puis applique les scripts SQL de `prisma/sql/`,
 * relus et écrits à la main. Aucune différence n'est déduite, aucune colonne
 * n'est supprimée par accident, et un échec arrête le déploiement.
 *
 * Pour préparer un changement de schéma : écrire un fichier dans `prisma/sql/`
 * (numéroté, idempotent), et mettre `prisma/schema.prisma` en accord. Les deux
 * doivent rester cohérents — le schéma décrit, le SQL applique.
 */

const { execSync } = require('child_process');

try {
  console.log('📦 Génération du client Prisma…');
  execSync('bun --bun prisma generate', { stdio: 'inherit' });

  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    console.log('⚠️  Aucune URL de base — le build continue sans migration.');
    process.exit(0);
  }

  console.log('🗄️  Application des scripts SQL…');
  execSync('node scripts/apply-sql.js', { stdio: 'inherit' });

  console.log('✅ Base à jour.');
} catch (error) {
  console.error('❌ Migration interrompue :', error.message);
  // Échouer, et fort. Un déploiement qui continue sur une base dans un état
  // inconnu est exactement ce qu'on cherche à ne plus faire.
  process.exit(1);
}
