# Migration Base de Données - SQLite vers PostgreSQL

Ce projet supporte maintenant deux types de bases de données :
- **SQLite** : Pour le développement local
- **PostgreSQL** : Pour la production

## 🚀 Démarrage Rapide

### Pour le développement local (SQLite)
```bash
# Basculer vers SQLite
bun run db:switch:sqlite

# Configurer la base de données
bun run db:setup:sqlite

# Démarrer le serveur
bun run dev
```

### Pour la production (PostgreSQL)
```bash
# Basculer vers PostgreSQL
bun run db:switch:postgresql

# Configurer la base de données
bun run db:setup:postgresql

# Build pour la production
bun run build
```

## 📁 Structure des Fichiers

```
prisma/
├── schema.prisma              # Schéma actif (copié depuis sqlite ou postgresql)
├── schema.sqlite.prisma       # Schéma SQLite
└── schema.postgresql.prisma   # Schéma PostgreSQL

scripts/
└── switch-database.js         # Script de basculement

src/lib/
├── database-config.ts         # Configuration dynamique
└── auth.ts                    # Authentification (mise à jour)
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` avec :

> **Note importante** : Pour PostgreSQL, vous devez définir à la fois `DATABASE_URL` et `DIRECT_URL`. Elles ont souvent la même valeur, mais `DIRECT_URL` est nécessaire pour les migrations Prisma.

```env
# Pour SQLite (développement)
DATABASE_URL="file:./data/auth.db"

# Pour PostgreSQL (production)
# DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
# DIRECT_URL="postgresql://username:password@host:port/database?schema=public"

# Autres variables...
AUTH_SECRET=your-secret
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
AUTHORIZED_USERS=123456789012345678
```

## 🎯 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `bun run db:switch:sqlite` | Basculer vers SQLite |
| `bun run db:switch:postgresql` | Basculer vers PostgreSQL |
| `bun run db:setup:sqlite` | Configuration complète SQLite |
| `bun run db:setup:postgresql` | Configuration complète PostgreSQL |
| `bun run db:generate` | Générer le client Prisma |
| `bun run db:migrate` | Migrations (PostgreSQL) |
| `bun run db:push` | Push du schéma (SQLite) |
| `bun run db:studio` | Interface Prisma Studio |

## 🌐 Production

La production tourne sur PostgreSQL (Neon), dans un conteneur Docker sur le
serveur ascencia-prod. Le déploiement est décrit dans
[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md).

Les changements de schéma ne passent ni par `prisma migrate` ni par
`prisma db push` : chaque changement est un fichier numéroté et idempotent dans
`prisma/sql/`, appliqué à la main depuis le poste :

```bash
DIRECT_URL=… bun run db:apply
```

## 🔄 Migration des Données

Si vous avez des données existantes en SQLite et voulez les migrer vers PostgreSQL :

### Option 1 : Export/Import manuel
```bash
# 1. Exporter depuis SQLite
bun run db:switch:sqlite
# Utiliser Prisma Studio pour exporter les données

# 2. Importer vers PostgreSQL
bun run db:switch:postgresql
# Utiliser Prisma Studio pour importer les données
```

### Option 2 : Script de migration (à créer)
Un script de migration automatique peut être créé si nécessaire.

## 🐛 Dépannage

### Erreur "Provider not found"
```bash
# Régénérer le client Prisma
bun run db:generate
```

### Erreur de connexion PostgreSQL
- Vérifiez la `DATABASE_URL`
- Vérifiez que la base de données est accessible
- Vérifiez les permissions

### Erreur de migration
```bash
# Reset et recréer
bun run db:switch:postgresql
bun run db:generate
bun run db:migrate --force-reset
```

## 📊 Détection Automatique

Le système détecte automatiquement le type de base de données depuis la `DATABASE_URL` :

- `file:` ou `sqlite:` → SQLite
- `postgresql:` ou `postgres:` → PostgreSQL

Cette détection est utilisée dans :
- `src/lib/database-config.ts`
- `src/lib/auth.ts`
- Interface admin (`/admin/settings`)

## 🔒 Sécurité

- Ne jamais commiter les fichiers `.env`
- Utiliser des secrets forts pour `AUTH_SECRET`
- Limiter l'accès aux utilisateurs autorisés via `AUTHORIZED_USERS`
- Utiliser HTTPS en production

## 📈 Performance

### SQLite
- ✅ Rapide pour le développement
- ✅ Pas de serveur externe
- ❌ Limité en production
- ❌ Pas de connexions simultanées

### PostgreSQL
- ✅ Évolutif
- ✅ Connexions simultanées
- ✅ Fonctionnalités avancées
- ❌ Plus complexe à configurer
- ❌ Nécessite un serveur externe
