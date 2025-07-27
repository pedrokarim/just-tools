# Outil Trame Halftone

Un outil Next.js complet pour transformer vos images en trames halftone avec une interface moderne et intuitive.

## 🎯 Fonctionnalités

### Import d'images
- **Drag & drop** : Glissez-déposez vos images directement
- **Sélection de fichier** : Bouton pour choisir une image
- **Formats supportés** : PNG, JPG, GIF, WebP
- **Taille illimitée** : Traite des images de toute taille

### Paramètres de trame
- **Formes** : Cercle, carré, diamant, hexagone, ligne
- **Angle de rotation** : 0-180 degrés
- **Fréquence** : Densité de la grille (1-300)
- **Tailles** : Min/Max des points (1-100px)
- **Mapping** : Linéaire, gamma, logarithmique, exponentiel
- **Seuil** : Contrôle binaire (0-1)
- **Jitter** : Variation aléatoire (0-1)
- **Graine** : Contrôle de l'aléatoire

### Couleurs
- **Monochrome** : Une seule couleur
- **Canaux RGB** : Couleurs originales
- **Palette** : Sélection de couleurs personnalisées
- **Opacité** : Transparence (0-1)
- **Mode de fusion** : Normal, multiply, screen, etc.

### Export
- **Formats** : PNG, JPG, SVG
- **Résolutions** : 1x, 2x, 3x
- **Transparence** : Support PNG/SVG
- **Qualité JPG** : 10-100%

### Presets
- **Sauvegarde** : Enregistrez vos configurations
- **Chargement** : Rechargez rapidement
- **Suppression** : Gestion des presets
- **Persistance** : Sauvegarde locale

## 🏗️ Architecture

### Structure des fichiers
```
src/
├── app/tools/(fullscreen)/halftone/
│   ├── page.tsx              # Page principale
│   └── README.md             # Documentation
├── components/halftone/
│   ├── halftone-playground.tsx  # Composant principal
│   ├── image-dropzone.tsx       # Zone de drop
│   ├── preview-canvas.tsx       # Prévisualisation
│   ├── controls-panel.tsx       # Contrôles
│   ├── export-panel.tsx         # Export
│   └── presets-bar.tsx          # Barre des presets
└── lib/
    ├── halftone-store.ts        # Store Zustand
    ├── halftone-engine.ts       # Moteur de rendu
    └── halftone-export.ts       # Module d'export
```

### Technologies utilisées
- **Next.js 15** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling utilitaire
- **Framer Motion** : Animations fluides
- **Zustand** : Gestion d'état globale
- **Radix UI** : Composants accessibles
- **Lucide React** : Icônes modernes
- **Sonner** : Notifications toast

## 🎨 Moteur de rendu

### Canvas 2D vs WebGL
L'outil utilise **Canvas 2D** par défaut pour les raisons suivantes :

**Avantages Canvas 2D :**
- ✅ Simplicité d'implémentation
- ✅ Compatibilité maximale
- ✅ Contrôle pixel par pixel
- ✅ Support de toutes les formes
- ✅ Facile à déboguer

**WebGL (optionnel) :**
- 🚀 Performance pour grandes images
- 🎯 Rendu parallèle
- ⚡ Accélération matérielle
- 🔧 Plus complexe à implémenter

### Algorithme de rendu
1. **Analyse de l'image** : Lecture des pixels source
2. **Calcul de la grille** : Espacement selon la fréquence
3. **Application de la rotation** : Transformation géométrique
4. **Mapping des valeurs** : Conversion luminosité → taille
5. **Rendu des formes** : Dessin sur le canvas
6. **Application des couleurs** : Palette ou canaux RGB

## 🚀 Utilisation

### Démarrage rapide
1. Chargez une image par drag & drop
2. Ajustez les paramètres en temps réel
3. Sauvegardez vos presets préférés
4. Exportez en haute résolution

### Conseils d'utilisation
- **Fréquence** : 50-100 pour un bon équilibre
- **Tailles** : 2-20px pour la plupart des cas
- **Angle** : 0° ou 45° pour les impressions
- **Jitter** : 0.1-0.3 pour un effet naturel
- **Résolution** : 2x pour l'impression, 1x pour le web

### Cas d'usage
- **Impression** : Trames pour offset/digital
- **Design** : Effets artistiques
- **Web** : Optimisation des images
- **Art** : Créations numériques

## 🔧 Développement

### Ajouter une nouvelle forme
1. Ajoutez le type dans `halftone-store.ts`
2. Implémentez le rendu dans `halftone-engine.ts`
3. Ajoutez l'icône dans `controls-panel.tsx`

```typescript
// Dans halftone-store.ts
export type Shape = 'circle' | 'square' | 'diamond' | 'hexagon' | 'line' | 'custom-svg' | 'triangle';

// Dans halftone-engine.ts
case 'triangle':
  this.drawTriangle(ctx, x, y, size, color);
  break;
```

### Ajouter un nouveau mapping
1. Ajoutez le type dans `halftone-store.ts`
2. Implémentez la fonction dans `halftone-engine.ts`
3. Ajoutez l'option dans `controls-panel.tsx`

```typescript
// Dans halftone-engine.ts
case 'sigmoid':
  return 1 / (1 + Math.exp(-10 * (value - 0.5)));
```

### Ajouter une nouvelle palette
1. Modifiez `halftone-store.ts` pour les palettes prédéfinies
2. Ajoutez les couleurs dans `controls-panel.tsx`

## 🧪 Tests

### Tests unitaires recommandés
```typescript
// Fonctions pures à tester
- calculateGrid(width, height, settings)
- applyMapping(value, settings)
- mapValueToSize(value, settings)
- getBrightness(color)
- drawShape(ctx, x, y, size, shape, color)
```

### Tests d'intégration
- Chargement d'image
- Rendu en temps réel
- Export des formats
- Sauvegarde des presets

## 📱 Accessibilité

### Fonctionnalités incluses
- **Labels** : Tous les contrôles sont labellisés
- **ARIA** : Attributs d'accessibilité
- **Focus** : Navigation au clavier
- **Contraste** : Mode sombre/clair
- **Écrans** : Support des lecteurs d'écran

### Améliorations possibles
- Raccourcis clavier
- Support des gestes tactiles
- Mode haute contraste
- Taille de police ajustable

## 🔮 Évolutions futures

### Fonctionnalités prévues
- **WebGL** : Rendu accéléré
- **Masques** : Zones de protection
- **Gradients** : Dégradés personnalisés
- **Animations** : Export GIF/MP4
- **API** : Intégration externe

### Optimisations
- **Web Workers** : Rendu en arrière-plan
- **OffscreenCanvas** : Performance
- **Mémoisation** : Cache des calculs
- **Lazy loading** : Chargement différé

## 📄 Licence

Cet outil fait partie du projet **Just Tools** et suit les mêmes conditions d'utilisation.

---

**Note** : Cet outil est conçu pour traiter des **images fixes uniquement**. Aucune fonctionnalité vidéo ou animation n'est incluse, conformément aux spécifications du projet. 