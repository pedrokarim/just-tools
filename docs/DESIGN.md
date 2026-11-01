# Design de Just Tools

Just Tools porte l'identité d'Ascencia ID, direction « Basalte », à une exception
près : **le logo reste celui de Just Tools**. Le logo d'Ascencia ID n'apparaît que
là où le site dit de qui il vient : copyright, à propos, pages légales.

## D'où vient le système

- `src/styles/ascencia/` et `src/lib/control.ts` sont des **copies conformes** de
  `@ascencia/id-ui`, qui n'est pas publié. On ne les modifie pas ici.
- `src/app/globals.css` branche le vocabulaire shadcn sur ces jetons et ajoute les
  polices et les quelques animations propres au site.
- `src/components/ui/` garde l'API shadcn, avec la grammaire d'Ascencia.
- `src/components/site/` porte ce qui est propre à Just Tools : coquilles, en-tête,
  pied de page, recherche, registre.

## Ce qui se vérifie tout seul

`tests/unit/design-rules.test.ts` échoue sur une couleur de palette en dur, un
emoji utilisé comme icône, un `transition-all` ou un dégradé hors du bouton
primaire. Une exception légitime s'inscrit dans `COLOR_EXCEPTIONS`, avec sa raison.

## Vocabulaire

Écrire le vocabulaire du système : `bg-surface`, `bg-elevated`, `bg-bg`,
`text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-link`, `border-border`,
`rounded-card`, `rounded-field`, `font-display`, `font-mono`.

- **Jamais de couleur en dur** : ni `blue-500`, ni `slate-*`, ni `gray-*`, ni
  `#hex`, ni dégradé. Le seul dégradé du système est celui du bouton primaire.
- `accent` désigne le lagon, la couleur secondaire. Un fond de survol est `surface`.
- États : `success`, `warning`, `danger`, avec leurs variantes `-soft` et
  `-soft-fg`. Un état s'écrit aussi en toutes lettres : la couleur n'est jamais
  seule porteuse d'information.
- Exception légitime : ce que l'outil **affiche comme donnée**. Un nuancier, une
  rareté d'artefact Genshin ou un motif gardent leurs vraies couleurs.

## Contrôles

- 44 px par défaut (`h-11`), 36 px (`size="sm"`) réservé aux barres d'outils.
- Icônes Lucide : 16 px dans un contrôle, 14 en ligne. Décoratives : `aria-hidden`.
- **Aucun emoji ni caractère unicode comme icône** (`✓`, `→`, `•`, `←`).
- Un bouton d'icône seule porte un `aria-label`.
- `Button` gère déjà l'espace autour de ses icônes : pas de `mr-2` sur l'icône.
- Une action par zone en primaire. Le reste en `secondary`, `outline` ou `ghost`.
- `CopyButton` pour toute copie : la confirmation se fait sur place.
- `.jt-prose` pour du HTML produit sans classes, comme le rendu Markdown.

## Mise en page d'un outil

- Une page défilante se compose dans `ToolPage` (`max-w-5xl`, alignée à gauche, ou
  `wide`). Pas de fond de page propre, pas de dégradé, pas de marge ajoutée.
- Un outil plein écran remplit `main` en `h-full` et gère ses zones de défilement.
- La coquille affiche déjà le nom et la description de l'outil : on ne les répète
  pas dans la page.
- **Rationaliser plutôt que repeindre.** Le résultat d'abord, les réglages ensuite.
  Pas d'empilement de cartes identiques : une carte pour ce qui a une vraie
  autonomie (le résultat), des sections ouvertes séparées par un trait pour le
  reste. Pas de titres de carte décoratifs avec icône.
- Pas de bande ni de barre colorée décorative autour d'un conteneur.
- Pas de surtitre en capitales, pas de pastilles décoratives, pas de chiffres
  d'ambiance. Un badge dit un état, pas une décoration.
- Un outil doit montrer quelque chose à l'arrivée : un exemple ou un état vide qui
  explique quoi faire.

## Mouvement

Une règle unique, celle d'Ascencia : **tout monte et s'amortit** (`--ease-rise`).

- On n'anime que `transform`, `translate`, `scale` et `opacity`, jamais `width`,
  `height` ou `all`. `prefers-reduced-motion` est géré par `tokens.css`.
- Un mouvement répond à un geste ou signale un changement. Si on ne sait pas dire
  à quoi il sert, on ne l'écrit pas.
- Pas d'animation sur ce qui se répète ou se déclenche au clavier : la recherche
  `Ctrl K` s'ouvre instantanément.
- Pas d'apparition au défilement, pas de fondu section par section. Le seul moment
  orchestré du site est l'arrivée sur l'accueil.
- `asc-animate-step-in` pour un résultat qui apparaît, `asc-animate-fade` pour un
  remplacement rapide (avec une `key` qui change), `asc-animate-rise` pour un
  panneau. Les fenêtres et les menus sont déjà animés.
- Une jauge se remplit avec `scale`, pas `width`.

## Pour les agents

Chaque page se lit aussi en Markdown (`Accept: text/markdown`), et un chemin inconnu
y répond par un vrai 404. `src/lib/site-markdown.ts` dérive tout des métadonnées des
outils, comme `/llms.txt`. La fiche `about` de chaque outil est dans le HTML servi :
un outil ajouté doit en avoir une.

## Texte

- Tutoiement partout, comme Ascencia ID.
- Typographie française : espace insécable avant `: ; ! ?` (`&nbsp;`), guillemets
  « », `…` et pas `...`, pas de tiret cadratin.
- Les messages d'erreur disent quoi faire ensuite.
- Identifiants en anglais, commentaires et textes en français.
