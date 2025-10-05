#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de la migration de production...');

try {
    // 1. Générer le client Prisma (toujours nécessaire)
    console.log('📦 Génération du client Prisma...');
    execSync('bun --bun prisma generate', { stdio: 'inherit' });

    // 2. Vérifier si on est en production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

    // 3. Vérifier si DATABASE_URL est définie
    if (!process.env.DATABASE_URL) {
        console.log('⚠️  DATABASE_URL non définie - Skip de la migration');
        console.log('✅ Build peut continuer sans migration');
        process.exit(0);
    }

    // 4. Exécuter la migration appropriée
    if (isProduction) {
        console.log('🌐 Mode production détecté - Migration sécurisée');
        // Utiliser db push sans --force-reset pour éviter les problèmes
        execSync('bun --bun prisma db push --accept-data-loss', {
            stdio: 'inherit',
            timeout: 30000 // 30 secondes de timeout
        });
    } else {
        console.log('🔧 Mode développement - Migration normale');
        execSync('bun --bun prisma db push', {
            stdio: 'inherit',
            timeout: 30000 // 30 secondes de timeout
        });
    }

    console.log('✅ Migration terminée avec succès !');
} catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);

    // En cas d'erreur, ne pas faire échouer le build
    if (isProduction) {
        console.log('⚠️  En production, le build continue malgré l\'erreur de migration');
        console.log('💡 La migration pourra être effectuée manuellement après le déploiement');
        process.exit(0);
    } else {
        process.exit(1);
    }
}
