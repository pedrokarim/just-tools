# Déploiement – Just Tools

Le site tourne dans un conteneur Docker sur un serveur Linux, derrière nginx et
Cloudflare. L'image est construite par GitHub Actions et publiée sur GHCR ; le
serveur ne compile jamais.

```
push sur main ──► GitHub Actions ──► ghcr.io/pedrokarim/just-tools:main (et :<sha complet>)
                                              │
serveur : docker compose pull && up -d ◄──────┘
```

## L'image

Le `Dockerfile` a trois étapes : dépendances (Bun), build (Bun), exécution
(`node:22-bookworm-slim`, sortie `standalone` de Next).

Trois règles, chacune pour une raison :

- **aucun `.env` dans l'image** : `.dockerignore` les exclut tous. Les secrets
  se donnent au conteneur, au démarrage ;
- **aucune migration au build ni au démarrage** : `bun install` tourne avec
  `--ignore-scripts`, et le conteneur ne lance que `node server.js`. Une
  migration qui part toute seule d'un build est exactement ce que
  `scripts/apply-sql.js` a été écrit pour empêcher ;
- **`sharp` installé** : sans lui, `next/image` renvoie l'image d'origine
  quelle que soit la largeur demandée.

## Les variables

| Quand | Variables | Où |
|---|---|---|
| Build | `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_DESCRIPTION`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_FALLBACK_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_ASCENCIA_ISSUER`, `NEXT_PUBLIC_SARUTOBI_SITE_ID` | Variables du dépôt GitHub (*Settings → Secrets and variables → Actions → Variables*). Elles finissent dans le JavaScript public : ce ne sont pas des secrets |
| Exécution | `DATABASE_URL`, `DIRECT_URL`, `ASCENCIA_ISSUER`, `ASCENCIA_CLIENT_ID`, `ASCENCIA_CLIENT_SECRET` | Le `.env` du serveur (`chmod 600`), jamais GitHub |

Le serveur refuse de démarrer si une variable d'Ascencia ID manque
(`src/instrumentation.ts`) : l'erreur se voit au déploiement, pas à la première
connexion.

## Déployer

Sur le serveur, dans le dossier qui contient `compose.prod.yml` et le `.env` :

```bash
./deploy.sh            # dernière image `main`
./deploy.sh <sha>      # une version précise, SHA complet du commit : c'est le retour arrière
```

Le script attend que la sonde du conteneur passe au vert, puis interroge la base
une fois (`/api/health?db=1`).

## Les migrations SQL

Elles ne tournent plus à chaque build. Quand un fichier s'ajoute à
`prisma/sql/`, l'appliquer depuis un poste, avec l'URL directe de la base :

```bash
DIRECT_URL="postgresql://…" node scripts/apply-sql.js
```

Jamais de `prisma db push` en production.

## La sonde de santé

`/api/health` répond sur le processus seul ; `/api/health?db=1` lit aussi la
base. La première sert à Docker toutes les 30 secondes, la seconde rarement :
la base est chez Neon, et une requête toutes les 30 secondes l'empêcherait de
se mettre en veille. nginx réserve la route à la machine elle-même.

## Tester l'image en local

```bash
docker run --rm -p 3000:3000 --env-file ../just-tools-prod.env ghcr.io/pedrokarim/just-tools:main
```

Le fichier d'environnement se garde **hors du dépôt**. La connexion à l'admin
ne fonctionne pas sur `localhost` : l'URL de rappel enregistrée chez Ascencia
ID est celle du site.
