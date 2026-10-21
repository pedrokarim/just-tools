#!/usr/bin/env node

/**
 * Applique les scripts SQL de `prisma/sql/`, dans l'ordre, une seule fois.
 *
 * Se lance à la main, depuis le poste, quand un fichier s'ajoute à
 * `prisma/sql/` : `DIRECT_URL=… bun run db:apply`. Ni l'installation, ni le
 * build, ni le démarrage du conteneur ne touchent la base.
 *
 * ── Pourquoi pas `prisma db push` ─────────────────────────────────────────
 *
 * `db push` compare le schéma au vivant et applique la différence : un champ
 * renommé, un modèle retiré, et la colonne part sans un mot. L'ancien
 * `postinstall` le lançait avec `--accept-data-loss` à chaque déploiement,
 * en avalant l'erreur.
 *
 * Ici, chaque changement est un fichier SQL qu'on relit avant de l'écrire. Rien
 * n'est déduit, rien n'est destructeur par accident.
 *
 * ── Les règles ──────────────────────────────────────────────────────────────
 *
 * · les fichiers sont numérotés et appliqués dans l'ordre du nom ;
 * · chacun est enregistré dans `_sql_migrations` : rejouer le script ne
 *   réapplique rien ;
 * · chacun s'écrit **idempotent** malgré tout (`IF NOT EXISTS`) — la table de
 *   suivi peut manquer sur une base restaurée, et un script qui ne supporte
 *   pas d'être rejoué transforme une restauration en incident ;
 * · un échec **arrête** le script, et le déploiement attend. Une migration
 *   ratée qu'on ignore est une base dans un état que personne ne connaît.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DIR = path.join(__dirname, '..', 'prisma', 'sql');

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.log('⚠️  Aucune URL de base — rien à appliquer.');
    return;
  }

  const files = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort()
    : [];

  if (files.length === 0) {
    console.log('Aucun script SQL à appliquer.');
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_sql_migrations" (
        "name"       TEXT PRIMARY KEY,
        "appliedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const done = new Set(
      (await client.query('SELECT name FROM "_sql_migrations"')).rows.map((r) => r.name),
    );

    for (const file of files) {
      if (done.has(file)) {
        console.log(`·  ${file} — déjà appliqué`);
        continue;
      }

      const sql = fs.readFileSync(path.join(DIR, file), 'utf8');

      // Une transaction par fichier : un script à moitié appliqué est le pire
      // des états, parce qu'il n'est ni l'ancien ni le nouveau.
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO "_sql_migrations" (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅ ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`${file} : ${error.message}`);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('❌ Migration SQL interrompue :', error.message);
  // Sortir en échec, volontairement : mieux vaut un déploiement qui s'arrête
  // qu'une base dans un état inconnu.
  process.exit(1);
});
