#!/usr/bin/env node

/**
 * Script pour basculer entre SQLite et PostgreSQL
 * Usage: node scripts/switch-database.js [sqlite|postgresql]
 */

const fs = require('fs');
const path = require('path');

const databaseType = process.argv[2];

if (!databaseType || !['sqlite', 'postgresql'].includes(databaseType)) {
    console.error('❌ Usage: node scripts/switch-database.js [sqlite|postgresql]');
    process.exit(1);
}

const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaFile = path.join(prismaDir, 'schema.prisma');
const sqliteSchema = path.join(prismaDir, 'schema.sqlite.prisma');
const postgresqlSchema = path.join(prismaDir, 'schema.postgresql.prisma');

try {
    // Vérifier que les fichiers de schéma existent
    if (!fs.existsSync(sqliteSchema)) {
        console.error('❌ Fichier schema.sqlite.prisma introuvable');
        process.exit(1);
    }

    if (!fs.existsSync(postgresqlSchema)) {
        console.error('❌ Fichier schema.postgresql.prisma introuvable');
        process.exit(1);
    }

    // Copier le bon schéma
    const sourceSchema = databaseType === 'sqlite' ? sqliteSchema : postgresqlSchema;
    fs.copyFileSync(sourceSchema, schemaFile);

    console.log(`✅ Schéma ${databaseType} activé`);
    console.log(`📁 Fichier copié: ${sourceSchema} -> ${schemaFile}`);

    // Afficher les prochaines étapes
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Mettre à jour votre fichier .env avec la bonne DATABASE_URL');
    console.log('2. Exécuter: bun run db:generate');
    console.log('3. Exécuter: bun run db:migrate (ou db:push pour SQLite)');

    if (databaseType === 'postgresql') {
        console.log('\n🔗 Pour PostgreSQL sur Vercel:');
        console.log('- Créer une base de données PostgreSQL sur Vercel');
        console.log('- Copier la DATABASE_URL de Vercel dans votre .env');
    }

} catch (error) {
    console.error('❌ Erreur lors du changement de schéma:', error.message);
    process.exit(1);
}
