# Tests - Just Tools

Ce dossier contient tous les tests pour le projet Just Tools.

## Structure

```
tests/
├── setup.ts                 # Configuration globale des tests
├── unit/                    # Tests unitaires
│   ├── lib/                 # Tests des utilitaires
│   │   ├── utils.test.ts    # Tests pour utils.ts
│   │   └── constants.test.ts # Tests pour constants.ts
│   └── components/          # Tests des composants
│       └── morphing-logo.test.tsx
├── integration/             # Tests d'intégration (à venir)
│   └── api/                 # Tests des API routes
└── e2e/                     # Tests end-to-end (à venir)
```

## Commandes de test

```bash
# Lancer les tests en mode watch
bun test

# Lancer les tests avec interface graphique
bun test:ui

# Lancer tous les tests une fois
bun test:run

# Lancer les tests avec couverture
bun test:coverage
```

## Configuration

- **Vitest** : Framework de test principal
- **@testing-library/react** : Pour tester les composants React
- **@testing-library/jest-dom** : Matchers supplémentaires pour les assertions
- **jsdom** : Environnement DOM pour les tests

## Conventions

### Tests unitaires
- Testent une fonction ou un composant isolé
- Utilisent des mocks pour les dépendances externes
- Doivent être rapides et déterministes

### Tests d'intégration
- Testent l'interaction entre plusieurs composants
- Peuvent utiliser une base de données de test
- Testent les API routes

### Tests E2E
- Testent le comportement complet de l'application
- Utilisent un navigateur réel
- Testent les parcours utilisateur complets

## Mocks

Les mocks suivants sont configurés dans `setup.ts` :
- Next.js Router
- Next.js Link
- next-themes
- framer-motion
- IntersectionObserver
- ResizeObserver
- window.matchMedia

## Ajouter de nouveaux tests

1. Créez un fichier `.test.ts` ou `.test.tsx` dans le dossier approprié
2. Importez les fonctions/composants à tester
3. Écrivez vos tests avec `describe`, `it` et `expect`
4. Utilisez les mocks appropriés si nécessaire

## Exemple de test

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```
