# Just Tools 🛠️

Une collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien.

## 🚀 Technologies Utilisées

- **Next.js 15** - Framework React moderne avec App Router et Turbopack
- **TypeScript** - Typage statique pour un code plus robuste
- **Tailwind CSS 4** - Framework CSS utilitaire de nouvelle génération
- **shadcn/ui** - Composants UI réutilisables et personnalisables
- **Framer Motion** - Animations fluides et transitions élégantes
- **Jotai & Zustand** - Gestion d'état moderne et performante
- **Lucide React** - Icônes modernes et cohérentes
- **Sonner** - Notifications toast élégantes
- **Next Themes** - Support du mode sombre/clair

## ✨ Fonctionnalités

### 🎨 Interface Moderne
- Design responsive et adaptatif
- Support du mode sombre/clair automatique
- Animations fluides avec Framer Motion
- Interface utilisateur intuitive et accessible
- Effets visuels avancés (particules, confettis, etc.)

### 🛠️ Outils Disponibles

#### ✅ Convertisseur Base64
- Encodez du texte en Base64
- Décodez du Base64 en texte
- Interface intuitive avec validation
- Copie en un clic
- Fonction d'échange entre entrée/sortie

#### ✅ Formateur de Code
- Formatage automatique de code dans différents langages
- Support de multiples langages de programmation
- Interface intuitive avec coloration syntaxique
- Options de formatage personnalisables

#### ✅ Générateur de Palette
- Création de palettes de couleurs harmonieuses
- Outils de génération automatique
- Export de palettes dans différents formats
- Interface intuitive pour la sélection de couleurs

#### ✅ Validateur JSON
- Validation et formatage JSON en temps réel
- Détection d'erreurs avec messages explicites
- Formatage automatique avec indentation
- Interface claire et intuitive

#### ✅ Générateur de Mots de Passe
- Génération de mots de passe sécurisés
- Options de personnalisation (longueur, caractères)
- Évaluation de la force du mot de passe
- Interface moderne et sécurisée

#### ✅ Éditeur Markdown
- Édition et prévisualisation Markdown en temps réel
- Support complet de la syntaxe Markdown
- Interface divisée (édition/prévisualisation)
- Export en différents formats

#### ✅ Éditeur de Motifs (Fullscreen)
- Création de motifs répétitifs avec une grille interactive
- Interface plein écran pour une expérience immersive
- Outils de dessin avancés
- Export de motifs personnalisés

#### ✅ Effet de Trame (Halftone)
- Ajout d'effets de trame halftone sur vos images
- Paramètres personnalisables (taille, densité, couleur)
- Interface intuitive avec prévisualisation
- Export d'images avec effets appliqués

## 🏃‍♂️ Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [Bun](https://bun.sh/) (recommandé) ou npm/yarn

### Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd just-tools
   ```

2. **Installer les dépendances**
   ```bash
   # Avec Bun (recommandé)
   bun install
   
   # Ou avec npm
   npm install
   
   # Ou avec yarn
   yarn install
   ```

3. **Lancer le serveur de développement**
   ```bash
   # Avec Bun
   bun dev
   
   # Ou avec npm
   npm run dev
   
   # Ou avec yarn
   yarn dev
   ```

4. **Ouvrir votre navigateur**
   ```
   http://localhost:3000
   ```

## 📁 Structure du Projet

```
just-tools/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── proxy-image/     # API pour le proxy d'images
│   │   ├── tools/
│   │   │   ├── (scrollable)/    # Outils avec défilement
│   │   │   │   ├── base64-converter/
│   │   │   │   ├── code-formatter/
│   │   │   │   ├── color-palette/
│   │   │   │   ├── halftone/
│   │   │   │   ├── json-validator/
│   │   │   │   ├── markdown-editor/
│   │   │   │   └── password-generator/
│   │   │   ├── (fullscreen)/    # Outils plein écran
│   │   │   │   └── pattern-editor/
│   │   │   └── halftone/        # Outil halftone standalone
│   │   ├── globals.css          # Styles globaux
│   │   ├── layout.tsx           # Layout racine
│   │   └── page.tsx             # Page d'accueil
│   ├── components/
│   │   ├── ui/                  # Composants shadcn/ui
│   │   ├── halftone/            # Composants spécifiques halftone
│   │   └── [animations]/        # Composants d'animation
│   └── lib/
│       ├── halftone-engine.ts   # Moteur halftone
│       ├── halftone-export.ts   # Export halftone
│       ├── halftone-store.ts    # Store halftone
│       ├── pattern-store.ts     # Store patterns
│       └── utils.ts             # Utilitaires
├── public/                      # Assets statiques
└── package.json
```

## 🎯 Ajouter un Nouvel Outil

1. **Créer le dossier de l'outil**
   ```bash
   mkdir src/app/tools/(scrollable)/nom-de-loutil
   ```

2. **Créer la page de l'outil**
   ```tsx
   // src/app/tools/(scrollable)/nom-de-loutil/page.tsx
   "use client";
   
   export default function NomDeLOutil() {
     return (
       <div className="max-w-4xl mx-auto space-y-6">
         <h1>Nom de l'outil</h1>
         {/* Votre interface ici */}
       </div>
     );
   }
   ```

3. **Mettre à jour la liste des outils**
   - Modifier le tableau `tools` dans `src/app/page.tsx`
   - Changer le statut de `"coming-soon"` à `"ready"`

## 🎨 Personnalisation

### Thème
Le projet utilise Tailwind CSS 4 avec des variables CSS personnalisées. Modifiez `src/app/globals.css` pour changer les couleurs et le thème.

### Composants
Les composants shadcn/ui peuvent être personnalisés dans `src/components/ui/`.

### Animations
Le projet inclut de nombreux composants d'animation réutilisables dans `src/components/`.

## 📝 Scripts Disponibles

```bash
# Développement
bun dev          # Serveur de développement avec Turbopack
npm run dev      # Alternative avec npm

# Production
bun build        # Build de production
bun start        # Serveur de production

# Qualité du code
bun lint         # Vérification ESLint
npm run lint     # Alternative avec npm
```

## 🚀 Déploiement

Le projet est optimisé pour le déploiement sur Vercel :

1. Connectez votre repository à Vercel
2. Les paramètres de build sont automatiquement détectés
3. Déploiement automatique à chaque push

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guide de Contribution

- Respectez les conventions de code existantes
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Utilisez des messages de commit descriptifs

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [Tailwind CSS](https://tailwindcss.com/) pour le framework CSS
- [Lucide](https://lucide.dev/) pour les icônes
- [Next.js](https://nextjs.org/) pour le framework React
- [Framer Motion](https://www.framer.com/motion/) pour les animations
- [Vercel](https://vercel.com/) pour l'hébergement

## 📊 Statistiques

- **9 outils** disponibles et fonctionnels
- **Interface moderne** avec animations fluides
- **Support complet** du mode sombre/clair
- **Performance optimisée** avec Next.js 15 et Turbopack
- **Accessibilité** respectée sur tous les outils

---

Développé avec ❤️ pour la communauté des développeurs
