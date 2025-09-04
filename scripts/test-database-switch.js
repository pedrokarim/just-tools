#!/usr/bin/env node

/**
 * Script de test pour vérifier le basculement entre SQLite et PostgreSQL
 */

const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaFile = path.join(prismaDir, 'schema.prisma');

function testDatabaseSwitch() {
    console.log('🧪 Test du basculement de base de données...\n');

    // Test 1: Vérifier que les fichiers de schéma existent
    console.log('1️⃣ Vérification des fichiers de schéma...');

    const sqliteSchema = path.join(prismaDir, 'schema.sqlite.prisma');
    const postgresqlSchema = path.join(prismaDir, 'schema.postgresql.prisma');

    if (!fs.existsSync(sqliteSchema)) {
        console.error('❌ schema.sqlite.prisma introuvable');
        return false;
    }

    if (!fs.existsSync(postgresqlSchema)) {
        console.error('❌ schema.postgresql.prisma introuvable');
        return false;
    }

    console.log('✅ Fichiers de schéma trouvés');

    // Test 2: Vérifier le contenu des schémas
    console.log('\n2️⃣ Vérification du contenu des schémas...');

    const sqliteContent = fs.readFileSync(sqliteSchema, 'utf8');
    const postgresqlContent = fs.readFileSync(postgresqlSchema, 'utf8');

    if (!sqliteContent.includes('provider = "sqlite"')) {
        console.error('❌ schema.sqlite.prisma ne contient pas provider = "sqlite"');
        return false;
    }

    if (!postgresqlContent.includes('provider = "postgresql"')) {
        console.error('❌ schema.postgresql.prisma ne contient pas provider = "postgresql"');
        return false;
    }

    console.log('✅ Contenu des schémas correct');

    // Test 3: Tester le basculement vers SQLite
    console.log('\n3️⃣ Test basculement vers SQLite...');

    const { execSync } = require('child_process');

    try {
        execSync('node scripts/switch-database.js sqlite', { stdio: 'pipe' });

        if (!fs.existsSync(schemaFile)) {
            console.error('❌ schema.prisma non créé après basculement SQLite');
            return false;
        }

        const currentContent = fs.readFileSync(schemaFile, 'utf8');
        if (!currentContent.includes('provider = "sqlite"')) {
            console.error('❌ schema.prisma ne contient pas provider = "sqlite"');
            return false;
        }

        console.log('✅ Basculement vers SQLite réussi');
    } catch (error) {
        console.error('❌ Erreur lors du basculement vers SQLite:', error.message);
        return false;
    }

    // Test 4: Tester le basculement vers PostgreSQL
    console.log('\n4️⃣ Test basculement vers PostgreSQL...');

    try {
        execSync('node scripts/switch-database.js postgresql', { stdio: 'pipe' });

        const currentContent = fs.readFileSync(schemaFile, 'utf8');
        if (!currentContent.includes('provider = "postgresql"')) {
            console.error('❌ schema.prisma ne contient pas provider = "postgresql"');
            return false;
        }

        console.log('✅ Basculement vers PostgreSQL réussi');
    } catch (error) {
        console.error('❌ Erreur lors du basculement vers PostgreSQL:', error.message);
        return false;
    }

    // Test 5: Remettre SQLite par défaut
    console.log('\n5️⃣ Remise en place de SQLite par défaut...');

    try {
        execSync('node scripts/switch-database.js sqlite', { stdio: 'pipe' });
        console.log('✅ SQLite remis par défaut');
    } catch (error) {
        console.error('❌ Erreur lors de la remise en place de SQLite:', error.message);
        return false;
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Configurer votre fichier .env.local');
    console.log('2. Exécuter : bun run db:generate');
    console.log('3. Exécuter : bun run db:push (pour SQLite)');
    console.log('4. Tester votre application');

    return true;
}

// Exécuter les tests
if (require.main === module) {
    const success = testDatabaseSwitch();
    process.exit(success ? 0 : 1);
}

module.exports = { testDatabaseSwitch };
