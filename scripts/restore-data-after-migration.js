#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreData() {
    console.log('🔄 Restauration des données après migration...');

    try {
        // Lire les données sauvegardées
        const backupPath = path.join(__dirname, 'backup-all-data.json');

        if (!fs.existsSync(backupPath)) {
            console.error('❌ Fichier de sauvegarde non trouvé:', backupPath);
            console.log('💡 Exécutez d\'abord: node scripts/analyze-current-database.js');
            return;
        }

        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        console.log(`📅 Données sauvegardées le: ${backupData.exportedAt}`);

        // Restaurer les utilisateurs d'abord (car les autres tables y font référence)
        if (backupData.user && backupData.user.length > 0) {
            console.log(`\n👥 Restauration de ${backupData.user.length} utilisateurs...`);

            for (const user of backupData.user) {
                try {
                    await prisma.user.create({
                        data: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            emailVerified: user.emailVerified,
                            image: user.image,
                            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
                        }
                    });
                } catch (error) {
                    console.log(`⚠️ Utilisateur ${user.id} déjà existant ou erreur:`, error.message);
                }
            }
            console.log('✅ Utilisateurs restaurés');
        }

        // Restaurer les comptes (accounts)
        if (backupData.account && backupData.account.length > 0) {
            console.log(`\n🔐 Restauration de ${backupData.account.length} comptes...`);

            for (const account of backupData.account) {
                try {
                    // Convertir expires_at en timestamp si c'est une date
                    let expiresAt = null;
                    if (account.accessTokenExpiresAt) {
                        expiresAt = Math.floor(new Date(account.accessTokenExpiresAt).getTime() / 1000);
                    }

                    await prisma.account.create({
                        data: {
                            id: account.id,
                            userId: account.userId,
                            type: 'oauth', // Valeur par défaut pour Auth.js
                            provider: account.providerId || 'discord', // Mapping: providerId -> provider
                            providerAccountId: account.accountId, // Mapping: accountId -> providerAccountId
                            refresh_token: account.refreshToken, // Mapping: refreshToken -> refresh_token
                            access_token: account.accessToken, // Mapping: accessToken -> access_token
                            expires_at: expiresAt, // Conversion en timestamp
                            token_type: null, // Pas dans l'ancien schéma
                            scope: account.scope,
                            id_token: account.idToken, // Mapping: idToken -> id_token
                            session_state: null, // Pas dans l'ancien schéma
                            createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
                            updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date()
                        }
                    });
                } catch (error) {
                    console.log(`⚠️ Compte ${account.id} erreur:`, error.message);
                }
            }
            console.log('✅ Comptes restaurés');
        }

        // Restaurer les sessions
        if (backupData.session && backupData.session.length > 0) {
            console.log(`\n🔑 Restauration de ${backupData.session.length} sessions...`);

            for (const session of backupData.session) {
                try {
                    await prisma.session.create({
                        data: {
                            id: session.id,
                            sessionToken: session.token, // Mapping: token -> sessionToken
                            userId: session.userId,
                            expires: session.expiresAt ? new Date(session.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Mapping: expiresAt -> expires
                            createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
                            updatedAt: session.updatedAt ? new Date(session.updatedAt) : new Date()
                        }
                    });
                } catch (error) {
                    console.log(`⚠️ Session ${session.id} erreur:`, error.message);
                }
            }
            console.log('✅ Sessions restaurées');
        }

        // Restaurer les page views
        if (backupData.pageview && backupData.pageview.length > 0) {
            console.log(`\n📊 Restauration de ${backupData.pageview.length} page views...`);

            for (const pageView of backupData.pageview) {
                try {
                    await prisma.pageView.create({
                        data: {
                            pagePath: pageView.pagePath,
                            userAgent: pageView.userAgent,
                            ipAddress: pageView.ipAddress,
                            fingerprint: pageView.fingerprint,
                            country: pageView.country,
                            city: pageView.city,
                            timestamp: pageView.timestamp ? new Date(pageView.timestamp) : new Date()
                        }
                    });
                } catch (error) {
                    console.log(`⚠️ PageView erreur:`, error.message);
                }
            }
            console.log('✅ Page views restaurées');
        }

        // Restaurer les visiteurs uniques
        if (backupData.uniquevisitor && backupData.uniquevisitor.length > 0) {
            console.log(`\n👤 Restauration de ${backupData.uniquevisitor.length} visiteurs uniques...`);

            for (const visitor of backupData.uniquevisitor) {
                try {
                    await prisma.uniqueVisitor.create({
                        data: {
                            fingerprint: visitor.fingerprint,
                            firstVisit: visitor.firstVisit ? new Date(visitor.firstVisit) : new Date(),
                            lastVisit: visitor.lastVisit ? new Date(visitor.lastVisit) : new Date(),
                            visitCount: visitor.visitCount || 1
                        }
                    });
                } catch (error) {
                    console.log(`⚠️ Visiteur unique erreur:`, error.message);
                }
            }
            console.log('✅ Visiteurs uniques restaurés');
        }

        // Restaurer les tentatives de connexion
        if (backupData.loginattempt && backupData.loginattempt.length > 0) {
            console.log(`\n🔒 Restauration de ${backupData.loginattempt.length} tentatives de connexion...`);

            for (const attempt of backupData.loginattempt) {
                try {
                    await prisma.loginAttempt.create({
                        data: {
                            discordId: attempt.discordId,
                            username: attempt.username,
                            email: attempt.email,
                            avatar: attempt.avatar,
                            ipAddress: attempt.ipAddress,
                            userAgent: attempt.userAgent,
                            country: attempt.country,
                            city: attempt.city,
                            success: attempt.success,
                            reason: attempt.reason,
                            timestamp: attempt.timestamp ? new Date(attempt.timestamp) : new Date()
                        }
                    });
                } catch (error) {
                    console.log(`⚠️ Tentative de connexion erreur:`, error.message);
                }
            }
            console.log('✅ Tentatives de connexion restaurées');
        }

        console.log('\n🎉 Restauration terminée avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la restauration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

restoreData();
