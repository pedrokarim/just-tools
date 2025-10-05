# Configuration du Panel Admin

## Variables d'environnement requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Auth.js Configuration
AUTH_SECRET=your-super-secret-key-here-change-this-in-production

# Discord OAuth Configuration
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Authorized Users (Discord IDs separated by commas)
AUTHORIZED_USERS=123456789012345678,987654321098765432

# Database
DATABASE_URL=file:./data/auth.db
```

## Configuration Discord OAuth

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Dans l'onglet "OAuth2", copiez le Client ID et Client Secret
4. Ajoutez `http://localhost:3000/api/auth/callback/discord` comme Redirect URI
5. Pour la production, ajoutez votre domaine : `https://votre-domaine.com/api/auth/callback/discord`

## Utilisateurs autorisés

- `AUTHORIZED_USERS` : Liste des IDs Discord des utilisateurs autorisés à accéder au panel admin
- Séparés par des virgules
- Vous pouvez obtenir votre ID Discord en activant le mode développeur dans Discord et en cliquant droit sur votre nom

## Fonctionnalités

### Authentification
- Connexion via Discord uniquement
- Vérification des utilisateurs autorisés
- Redirection automatique vers `/admin/login` si non connecté

### Analytics
- Tracking automatique des vues de pages
- Statistiques en temps réel
- Base de données SQLite pour les performances
- Fingerprinting des visiteurs

### Dashboard
- Vue d'ensemble des statistiques
- Graphiques interactifs avec Recharts
- Top des pages les plus visitées
- Activité des dernières 24h

## Structure des fichiers

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx          # Page de connexion
│   │   ├── layout.tsx              # Layout admin avec protection
│   │   └── page.tsx                # Dashboard principal
│   └── api/
│       ├── auth/[...nextauth]/     # Routes Auth.js
│       └── analytics/              # API Analytics
├── components/
│   ├── admin/                      # Composants admin
│   └── analytics-tracker.tsx       # Tracker automatique
└── lib/
    ├── auth.ts                     # Configuration Auth.js
    └── database.ts                 # Base de données SQLite
```

## Accès

- URL de connexion : `/admin/login`
- URL du dashboard : `/admin`
- Seuls les utilisateurs Discord listés dans `AUTHORIZED_USERS` peuvent accéder
