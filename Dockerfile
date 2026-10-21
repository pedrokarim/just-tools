# Just Tools – image de production.
#
# Construite par GitHub Actions (`.github/workflows/deploy.yml`), poussée sur
# GHCR, tirée par ascencia-prod. Jamais construite sur le serveur.
#
# Remplace l'ancien Dockerfile du dépôt, qui copiait les `.env*` dans l'image
# et lançait `prisma db push` sur la base de production à chaque démarrage.
#
# Prérequis dans le dépôt : `output: "standalone"` dans `next.config.ts`
# (déjà en place).

# Bun ÉPINGLÉ, comme pour DNA et sharex-manager : toute montée de version se
# fait ici, sciemment.
ARG BUN_VERSION=1.3.14
# La version de Node de Vercel aujourd'hui (`vercel project inspect`).
ARG NODE_VERSION=22

# ── Dépendances ─────────────────────────────────────────────────────────────
FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app
COPY package.json bun.lock ./
# `--ignore-scripts` : le `postinstall` (scripts/migrate-production.js)
# appliquerait les migrations SQL si une URL de base traînait dans
# l'environnement. Un build ne touche jamais une base.
RUN bun install --frozen-lockfile --ignore-scripts

# ── Build ───────────────────────────────────────────────────────────────────
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Les NEXT_PUBLIC_* sont FIGÉES dans le JavaScript au build : elles entrent
# ici, pas au démarrage du conteneur. Aucune n'est secrète.
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_SITE_DESCRIPTION
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_FALLBACK_URL
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_ASCENCIA_ISSUER
ARG NEXT_PUBLIC_SARUTOBI_SITE_ID
# Lu par scripts/version.js : sans `.git` dans le contexte, c'est la seule
# source du SHA (nom du cache du service worker).
ARG GITHUB_SHA
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME \
    NEXT_PUBLIC_SITE_DESCRIPTION=$NEXT_PUBLIC_SITE_DESCRIPTION \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_FALLBACK_URL=$NEXT_PUBLIC_FALLBACK_URL \
    NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL \
    NEXT_PUBLIC_ASCENCIA_ISSUER=$NEXT_PUBLIC_ASCENCIA_ISSUER \
    NEXT_PUBLIC_SARUTOBI_SITE_ID=$NEXT_PUBLIC_SARUTOBI_SITE_ID \
    GITHUB_SHA=$GITHUB_SHA \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=4096

# Le client Prisma est généré explicitement, puisque `postinstall` n'a pas
# tourné. Debian ici comme à l'exécution : le moteur produit vise
# `debian-openssl-3.0.x`, celui de l'image d'exécution.
RUN bunx prisma generate
RUN bun run build

# ── Exécution ───────────────────────────────────────────────────────────────
# Debian et non Alpine : `sharp` y trouve ses binaires précompilés (glibc), et
# le moteur Prisma y retrouve la bibliothèque OpenSSL pour laquelle il a été
# généré.
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# L'image slim n'a pas OpenSSL : sans lui, le site démarre, puis chaque page
# qui lit la base échoue.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Utilisateur non root ; il doit pouvoir écrire dans .next/cache (volume).
RUN groupadd --system --gid 1001 nextjs \
 && useradd --system --uid 1001 --gid nextjs nextjs

# Le serveur autonome, puis ce que `standalone` ne copie pas.
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nextjs /app/public ./public
# Le client Prisma généré et son moteur : le traçage de Next les oublie
# parfois, et l'absence ne se voit qu'à la première requête en base.
COPY --from=build --chown=nextjs:nextjs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nextjs:nextjs /app/node_modules/@prisma ./node_modules/@prisma
RUN mkdir -p .next/cache && chown -R nextjs:nextjs .next/cache

USER nextjs
EXPOSE 3000
# Rien d'autre : aucune migration au démarrage. Les scripts de prisma/sql/
# s'appliquent à part, avec scripts/apply-sql.js.
CMD ["node", "server.js"]
