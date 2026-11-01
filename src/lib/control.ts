/**
 * La GRAMMAIRE DES CONTRÔLES.
 *
 * C'est le fichier qui empêche le design system de partir en morceaux. Sans
 * lui, chaque composant réinvente sa hauteur, son padding et sa taille d'icône,
 * et on obtient un formulaire où le champ fait 42 px, le select 44 et le bouton
 * 46 — personne ne sait dire pourquoi c'est laid, mais tout le monde le voit.
 *
 * Ces constantes ne sont pas des suggestions : tout contrôle qui se pose sur
 * une ligne avec un autre DOIT les utiliser.
 *
 * ── Hauteurs ──────────────────────────────────────────────────────────────
 * `md` = 44 px. C'est la cible tactile minimale de WCAG 2.2, et la hauteur de
 * référence de tous les champs, boutons, selects et déclencheurs de popover.
 * `sm` = 36 px, réservé aux barres d'outils denses et jamais à une action
 * principale sur mobile.
 *
 * ── Rythme horizontal ─────────────────────────────────────────────────────
 * 14 px (`px-3.5`) de chaque côté. MAIS un contrôle qui se termine par une
 * icône passe à 12 px à droite (`pe-3`) : une icône est optiquement plus
 * légère qu'une lettre, et garder 14 px la fait paraître décollée du bord.
 * C'est le genre de détail qui distingue un select « bien posé » d'un select
 * « à peu près ».
 *
 * ── Icônes ────────────────────────────────────────────────────────────────
 * 16 px dans un contrôle de 44 px. 15 px dans un menu. 14 px dans un badge ou
 * une ligne de tableau. Jamais d'icône à 20 px dans un champ : elle écrase le
 * texte à 14 px posé à côté.
 *
 * Les chevrons de déroulement sont TOUJOURS `ChevronDown` de Lucide, en 16 px,
 * en `text-fg-subtle`, collés au bord droit. Pas de triangle, pas de caret
 * dessiné à la main, pas de rotation à l'ouverture pour les selects — seuls
 * les accordéons tournent.
 *
 * ── Espacement interne ────────────────────────────────────────────────────
 * 10 px (`gap-2.5`) entre une icône et son texte. 8 px (`gap-2`) entre deux
 * éléments de même nature. 12 px (`gap-3`) entre deux blocs distincts.
 */

export const CONTROL = {
  /** Hauteur standard, en classes Tailwind. */
  height: {
    sm: 'h-9',
    md: 'h-11',
    lg: 'h-12',
  },
  /** Padding horizontal — `withTrailingIcon` compense le poids optique. */
  padding: {
    default: 'px-3.5',
    withTrailingIcon: 'ps-3.5 pe-3',
    withLeadingIcon: 'ps-3 pe-3.5',
    both: 'px-3',
  },
  /** Taille d'icône selon le contexte. */
  icon: {
    control: 16,
    menu: 15,
    inline: 14,
    stepper: 15,
  },
  gap: {
    iconText: 'gap-2.5',
    peers: 'gap-2',
    blocks: 'gap-3',
  },
} as const;

/**
 * La bordure + l'anneau de focus, identiques sur TOUS les contrôles bordés.
 *
 * Le focus ne se contente pas d'un anneau : la bordure change aussi de couleur.
 * L'anneau seul disparaît sur un fond sombre chargé, la bordure seule est trop
 * discrète — les deux ensemble sont visibles partout.
 */
export const CONTROL_SHELL = [
  'rounded-field border border-border bg-bg text-fg',
  'transition-[border-color,box-shadow] duration-[--animate-duration-fast]',
  'focus-visible:border-primary focus-visible:outline-none',
  'focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--asc-primary)_16%,transparent)]',
  'data-[invalid]:border-danger',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ');

/** La même chose quand le focus vient d'un enfant (champ avec icônes). */
export const CONTROL_SHELL_WITHIN = [
  'rounded-field border border-border bg-bg text-fg',
  'transition-[border-color,box-shadow] duration-[--animate-duration-fast]',
  'focus-within:border-primary',
  'focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--asc-primary)_16%,transparent)]',
  'data-[invalid]:border-danger',
].join(' ');

/** Surface flottante — menus, popovers, listes déroulantes. */
export const SURFACE_FLOATING = [
  'rounded-card border border-border bg-elevated shadow-pop',
  'z-(--z-popover) origin-(--radix-popper-transform-origin)',
].join(' ');

/** Entrée de menu — même rythme dans DropdownMenu, ContextMenu, Menubar. */
export const MENU_ITEM = [
  'relative flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none select-none',
  // 44 px au doigt, 36 à la souris : voir `DropdownMenuItem`.
  'pointer-coarse:min-h-11',
  'data-[highlighted]:bg-surface data-[highlighted]:text-fg',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
].join(' ');
