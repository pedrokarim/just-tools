# Étape de build - Utilise Bun pour une installation plus rapide
FROM oven/bun:1-alpine AS builder

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./
COPY bun.lock ./

# Installe les dépendances avec Bun (plus rapide que npm)
RUN bun install --frozen-lockfile

# Copie le code source
COPY . .

# Copie le fichier .env pour le build (si il existe)
COPY .env* ./

# Debug: Afficher les variables d'environnement et la structure des fichiers
RUN echo "=== DEBUG: Variables d'environnement ===" && \
    echo "DATABASE_URL: $DATABASE_URL" && \
    echo "BETTER_AUTH_SECRET: $BETTER_AUTH_SECRET" && \
    echo "DISCORD_CLIENT_ID: $DISCORD_CLIENT_ID" && \
    echo "DISCORD_CLIENT_SECRET: $DISCORD_CLIENT_SECRET" && \
    echo "=== DEBUG: Structure des fichiers ===" && \
    ls -la && \
    echo "=== DEBUG: Contenu du dossier prisma ===" && \
    ls -la prisma/ || echo "Dossier prisma non trouvé" && \
    echo "=== DEBUG: Contenu du fichier .env ===" && \
    cat .env 2>/dev/null || echo "Fichier .env non trouvé"

# Générer le client Prisma
RUN bunx prisma generate

# Initialiser la base de données (dans l'étape de build)
RUN bunx prisma db push

# Build de l'application
RUN bun run build

# Étape de production - Utilise Bun pour l'exécution
FROM oven/bun:1-alpine AS runner

# Crée un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 nextjs

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bun.lock ./

# Copie les fichiers de build
COPY --from=builder --chown=nextjs:bunjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bunjs /app/.next/static ./.next/static

# Copie le client Prisma généré
COPY --from=builder --chown=nextjs:bunjs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:bunjs /app/node_modules/@prisma ./node_modules/@prisma

# Copie la base de données initialisée
COPY --from=builder --chown=nextjs:bunjs /app/prisma ./prisma

# Change vers l'utilisateur non-root
USER nextjs

# Expose le port (sera configuré via variable d'environnement)
EXPOSE ${PORT:-3000}

# Variables d'environnement par défaut
ENV PORT=${PORT:-3000}
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Script de démarrage simplifié
CMD bun server.js 