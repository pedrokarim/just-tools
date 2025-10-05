#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Création d\'une migration Prisma...');

try {
    // Créer une migration avec un nom descriptif
    const migrationName = process.argv[2] || 'update-auth-schema';
    execSync(`bun --bun prisma migrate dev --name ${migrationName}`, { stdio: 'inherit' });

    console.log('✅ Migration créée avec succès !');
    console.log('💡 N\'oubliez pas de commiter les fichiers de migration dans le dossier prisma/migrations/');
} catch (error) {
    console.error('❌ Erreur lors de la création de la migration:', error.message);
    process.exit(1);
}
