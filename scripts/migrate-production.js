#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de la migration de production...');

try {
    // 1. Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    execSync('bun --bun prisma generate', { stdio: 'inherit' });

    // 2. Vérifier si on est en production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

    if (isProduction) {
        console.log('🌐 Mode production détecté - Utilisation de --force-reset');
        execSync('bun --bun prisma db push --force-reset', { stdio: 'inherit' });
    } else {
        console.log('🔧 Mode développement - Migration normale');
        execSync('bun --bun prisma db push', { stdio: 'inherit' });
    }

    console.log('✅ Migration terminée avec succès !');
} catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
}
