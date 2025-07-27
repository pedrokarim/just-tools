# Just Tools 🛠️

Une collection d'outils de développement pratiques pour simplifier votre workflow quotidien.

## 🚀 Technologies Utilisées

- **Next.js 15** - Framework React moderne avec App Router
- **TypeScript** - Typage statique pour un code plus robuste
- **Tailwind CSS 4** - Framework CSS utilitaire pour un design moderne
- **shadcn/ui** - Composants UI réutilisables et personnalisables
- **Bun** - Runtime JavaScript rapide et gestionnaire de paquets
- **Lucide React** - Icônes modernes et cohérentes
- **Sonner** - Notifications toast élégantes

## ✨ Fonctionnalités

### 🎨 Interface Moderne
- Design responsive et adaptatif
- Support du mode sombre/clair
- Animations fluides et transitions élégantes
- Interface utilisateur intuitive

### 🛠️ Outils Disponibles

#### ✅ Convertisseur Base64
- Encodez du texte en Base64
- Décodez du Base64 en texte
- Interface intuitive avec validation
- Copie en un clic
- Fonction d'échange entre entrée/sortie

#### 🔄 Outils à Venir
- **Formateur de Code** - Formatage automatique de code
- **Générateur de Palette** - Création de palettes de couleurs
- **Validateur JSON** - Validation et formatage JSON
- **Générateur de Mots de Passe** - Mots de passe sécurisés
- **Éditeur Markdown** - Édition et prévisualisation Markdown

## 🏃‍♂️ Démarrage Rapide

### Prérequis
- [Bun](https://bun.sh/) installé sur votre système

### Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd just-tools
   ```

2. **Installer les dépendances**
   ```bash
   bun install
   ```

3. **Lancer le serveur de développement**
   ```bash
   bun dev
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
│   │   ├── tools/           # Routes des outils
│   │   │   ├── layout.tsx   # Layout commun pour les outils
│   │   │   └── base64-converter/
│   │   │       └── page.tsx # Outil convertisseur Base64
│   │   ├── globals.css      # Styles globaux
│   │   ├── layout.tsx       # Layout racine
│   │   └── page.tsx         # Page d'accueil
│   ├── components/
│   │   └── ui/              # Composants shadcn/ui
│   └── lib/
│       └── utils.ts         # Utilitaires
├── public/                  # Assets statiques
└── package.json
```

## 🎯 Ajouter un Nouvel Outil

1. **Créer le dossier de l'outil**
   ```bash
   mkdir src/app/tools/nom-de-loutil
   ```

2. **Créer la page de l'outil**
   ```tsx
   // src/app/tools/nom-de-loutil/page.tsx
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
Le projet utilise Tailwind CSS avec des variables CSS personnalisées. Modifiez `src/app/globals.css` pour changer les couleurs et le thème.

### Composants
Les composants shadcn/ui peuvent être personnalisés dans `src/components/ui/`.

## 📝 Scripts Disponibles

```bash
bun dev          # Serveur de développement
bun build        # Build de production
bun start        # Serveur de production
bun lint         # Vérification ESLint
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [Tailwind CSS](https://tailwindcss.com/) pour le framework CSS
- [Lucide](https://lucide.dev/) pour les icônes
- [Next.js](https://nextjs.org/) pour le framework React

---

Développé avec ❤️ pour la communauté des développeurs
