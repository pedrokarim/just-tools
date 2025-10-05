#!/usr/bin/env node

/**
 * Script d'extraction des données Genshin Impact
 * 
 * Ce script utilise genshin-db pour extraire toutes les données d'artefacts
 * et les stocke dans la base de données. Une fois exécuté, on peut supprimer
 * genshin-db du package.json pour éviter les problèmes de mémoire au build.
 * 
 * Usage: node scripts/extract-genshin-data.js
 */

const { PrismaClient } = require('@prisma/client');

// Import dynamique de genshin-db (seulement en dev)
let GenshinDB = null;

async function loadGenshinDB() {
    if (!GenshinDB) {
        try {
            GenshinDB = require('genshin-db');
            console.log('✅ genshin-db chargé avec succès');
        } catch (error) {
            console.error('❌ Impossible de charger genshin-db:', error.message);
            console.log('💡 Assurez-vous que genshin-db est installé en dev: bun add genshin-db');
            process.exit(1);
        }
    }
    return GenshinDB;
}

async function extractArtifactSets() {
    console.log('🔄 Extraction des sets d\'artefacts...');

    const db = new PrismaClient();
    const genshinDB = await loadGenshinDB();

    try {
        // Liste complète des sets d'artefacts Genshin Impact (48 sets officiels)
        const allSets = [
            "Gladiator's Finale", "Wanderer's Troupe", "Noblesse Oblige", "Bloodstained Chivalry",
            "Viridescent Venerer", "Crimson Witch of Flames", "Thundering Fury", "Blizzard Strayer",
            "Heart of Depth", "Pale Flame", "Tenacity of the Millelith", "Shimenawa's Reminiscence",
            "Emblem of Severed Fate", "Husk of Opulent Dreams", "Ocean-Hued Clam", "Vermillion Hereafter",
            "Echoes of an Offering", "Deepwood Memories", "Gilded Dreams", "Desert Pavilion Chronicle",
            "Flower of Paradise Lost", "Nymph's Dream", "Vourukasha's Glow", "Marechaussee Hunter",
            "Golden Troupe", "Song of Days Past", "Nighttime Whispers in the Echoing Woods",
            "Fragment of Harmonic Whimsy", "Unfinished Reverie",
            "Archaic Petra", "Retracing Bolide", "Lavawalker", "Thundersoother",
            "Maiden Beloved", "Gambler", "Scholar", "Brave Heart",
            "Resolution of Sojourner", "Tiny Miracle", "Berserker", "Instructor", "The Exile",
            "Defender's Will", "Martial Artist", "Prayers for Illumination", "Prayers for Destiny",
            "Prayers for Wisdom", "Prayers to Springtime"
        ];

        console.log(`📦 ${allSets.length} sets à traiter avec les vraies données`);

        let processedCount = 0;
        let errorCount = 0;

        for (const setName of allSets) {
            try {
                // Récupérer les vraies données depuis genshin-db
                const artifactData = genshinDB.artifacts(setName);

                if (artifactData && artifactData.images) {
                    // Créer ou mettre à jour le set avec les vraies images
                    await db.artifactSet.upsert({
                        where: { name: setName },
                        update: {
                            description: artifactData.effect2Pc || `Set d'artefacts ${setName}`,
                            images: {
                                flower: artifactData.images.flower || null,
                                plume: artifactData.images.plume || null,
                                sands: artifactData.images.sands || null,
                                goblet: artifactData.images.goblet || null,
                                circlet: artifactData.images.circlet || null,
                            },
                            updatedAt: new Date(),
                        },
                        create: {
                            name: setName,
                            description: artifactData.effect2Pc || `Set d'artefacts ${setName}`,
                            images: {
                                flower: artifactData.images.flower || null,
                                plume: artifactData.images.plume || null,
                                sands: artifactData.images.sands || null,
                                goblet: artifactData.images.goblet || null,
                                circlet: artifactData.images.circlet || null,
                            },
                        },
                    });

                    console.log(`✅ ${setName} - Images récupérées`);
                } else {
                    // Fallback si pas de données
                    await db.artifactSet.upsert({
                        where: { name: setName },
                        update: {
                            description: `Set d'artefacts ${setName}`,
                            images: {
                                flower: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🌸`,
                                plume: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🪶`,
                                sands: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=⏳`,
                                goblet: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🏺`,
                                circlet: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=👑`,
                            },
                            updatedAt: new Date(),
                        },
                        create: {
                            name: setName,
                            description: `Set d'artefacts ${setName}`,
                            images: {
                                flower: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🌸`,
                                plume: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🪶`,
                                sands: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=⏳`,
                                goblet: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=🏺`,
                                circlet: `https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=👑`,
                            },
                        },
                    });

                    console.log(`⚠️  ${setName} - Fallback utilisé`);
                }

                processedCount++;

                if (processedCount % 10 === 0) {
                    console.log(`📊 ${processedCount}/${allSets.length} sets traités...`);
                }
            } catch (error) {
                console.warn(`⚠️  Erreur lors du traitement du set ${setName}:`, error.message);
                errorCount++;
            }
        }

        console.log(`✅ Extraction terminée: ${processedCount} sets traités, ${errorCount} erreurs`);

        // Mettre à jour les métadonnées de cache
        await db.cacheMetadata.upsert({
            where: { key: 'artifact_sets' },
            update: {
                lastUpdated: new Date(),
                version: '2.0',
            },
            create: {
                key: 'artifact_sets',
                lastUpdated: new Date(),
                version: '2.0',
            },
        });

        console.log('💾 Métadonnées de cache mises à jour');

    } catch (error) {
        console.error('❌ Erreur lors de l\'extraction:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

async function extractArtifactTypes() {
    console.log('🔄 Extraction des types d\'artefacts...');

    const db = new PrismaClient();

    try {
        // Types d'artefacts avec leurs stats principales
        const artifactTypes = [
            {
                name: 'flower',
                mainStats: ['HP']
            },
            {
                name: 'plume',
                mainStats: ['ATK']
            },
            {
                name: 'sands',
                mainStats: ['HP%', 'ATK%', 'DEF%', 'Elemental Mastery', 'Energy Recharge']
            },
            {
                name: 'goblet',
                mainStats: [
                    'HP%', 'ATK%', 'DEF%', 'Elemental Mastery',
                    'Pyro DMG Bonus', 'Hydro DMG Bonus', 'Cryo DMG Bonus',
                    'Electro DMG Bonus', 'Anemo DMG Bonus', 'Geo DMG Bonus',
                    'Physical DMG Bonus'
                ]
            },
            {
                name: 'circlet',
                mainStats: [
                    'CRIT Rate', 'CRIT DMG', 'HP%', 'ATK%', 'DEF%',
                    'Elemental Mastery', 'Healing Bonus'
                ]
            }
        ];

        for (const type of artifactTypes) {
            await db.artifactType.upsert({
                where: { name: type.name },
                update: {
                    mainStats: type.mainStats,
                    updatedAt: new Date(),
                },
                create: {
                    name: type.name,
                    mainStats: type.mainStats,
                },
            });
        }

        console.log(`✅ ${artifactTypes.length} types d'artefacts extraits`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'extraction des types:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

async function extractSubStats() {
    console.log('🔄 Extraction des sous-stats...');

    const db = new PrismaClient();

    try {
        const subStats = [
            'HP', 'ATK', 'DEF', 'HP%', 'ATK%', 'DEF%',
            'CRIT Rate', 'CRIT DMG', 'Elemental Mastery', 'Energy Recharge'
        ];

        for (const stat of subStats) {
            await db.subStat.upsert({
                where: { name: stat },
                update: {
                    updatedAt: new Date(),
                },
                create: {
                    name: stat,
                },
            });
        }

        console.log(`✅ ${subStats.length} sous-stats extraits`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'extraction des sous-stats:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

async function main() {
    console.log('🚀 Démarrage de l\'extraction des données Genshin Impact...');
    console.log('📅 Date:', new Date().toISOString());

    try {
        // Vérifier que nous sommes en mode développement
        if (process.env.NODE_ENV === 'production') {
            console.error('❌ Ce script ne doit pas être exécuté en production !');
            process.exit(1);
        }

        // Extraire toutes les données
        await extractArtifactTypes();
        await extractSubStats();
        await extractArtifactSets();

        console.log('🎉 Extraction terminée avec succès !');
        console.log('💡 Vous pouvez maintenant supprimer genshin-db du package.json');
        console.log('💡 Le build sera beaucoup plus rapide sans les 158 MB de données JSON');

    } catch (error) {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    }
}

// Exécuter le script
if (require.main === module) {
    main();
}

module.exports = {
    extractArtifactSets,
    extractArtifactTypes,
    extractSubStats,
};
