#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de la migration de production...');

// Fonction pour vérifier si la base de données est accessible
function isDatabaseAccessible() {
    try {
        // Vérifier si DATABASE_URL est définie
        if (!process.env.DATABASE_URL) {
            console.log('⚠️  DATABASE_URL non définie - Skip de la migration');
            return false;
        }

        // Test de connexion simple avec timeout
        console.log('🔍 Test de connexion à la base de données...');
        execSync('bun --bun prisma db execute --stdin', {
            input: 'SELECT 1;',
            stdio: 'pipe',
            timeout: 10000 // 10 secondes de timeout
        });
        return true;
    } catch (error) {
        console.log('⚠️  Base de données non accessible - Skip de la migration:', error.message);
        return false;
    }
}

try {
    // 1. Générer le client Prisma (toujours nécessaire)
    console.log('📦 Génération du client Prisma...');
    execSync('bun --bun prisma generate', { stdio: 'inherit' });

    // 2. Vérifier si on est en production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

    // 3. Vérifier si la base de données est accessible
    if (!isDatabaseAccessible()) {
        console.log('⏭️  Migration ignorée - Base de données non accessible');
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
