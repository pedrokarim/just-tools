/**
 * Les autres projets de l'écosystème Ascencia, pour la section de promotion
 * croisée présente en bas de l'accueil.
 *
 * Source de vérité : la section « Nos Projets » de https://ascencia.re. Les
 * descriptions sont reprises de là pour que la promotion soit cohérente d'un
 * site à l'autre ; les logos pointent chaque projet chez lui, donc un changement
 * de logo se propage sans rien redéployer ici.
 *
 * Volontairement séparé du composant de rendu : cette liste est destinée à être
 * recopiée à l'identique sur les autres projets, seul l'écran d'accueil change.
 * Chaque projet retire simplement sa propre entrée.
 */

export interface OtherProject {
  id: string;
  name: string;
  /** Une phrase, ton identique aux autres sites de l'écosystème. */
  description: string;
  url: string;
  /** URL absolue, servie par le projet lui-même. */
  logo: string;
  /** Étiquette courte affichée en badge. */
  tag: string;
  /** Met la carte en avant (badge « Nouveau »). */
  isNew?: boolean;
}

export const OTHER_PROJECTS: OtherProject[] = [
  {
    id: "sarutobi",
    name: "Sarutobi",
    description:
      "Product Analytics auto-hébergé : événements, funnels, Web Vitals et erreurs, avec vos données qui restent chez vous.",
    url: "https://sarutobi.ascencia.re/",
    logo: "https://sarutobi.ascencia.re/icon.png",
    tag: "Analytics",
    isNew: true,
  },
  {
    id: "watchme",
    name: "WatchMe",
    description:
      "Ta cinémathèque personnelle : suis, note et partage tes films et séries, avec classements, calendrier des épisodes et discussions.",
    url: "https://watchme.ascencia.re/",
    logo: "https://watchme.ascencia.re/icons/icon-192.png",
    tag: "Films & séries",
  },
  {
    id: "mcinfo",
    name: "MCInfo",
    description:
      "Plateforme Minecraft Intelligence : statut des serveurs en temps réel, viewer de skins 3D, statistiques joueurs et API ouverte.",
    url: "https://mcinfo.ascencia.re/",
    logo: "https://mcinfo.ascencia.re/images/logo/logo-mark-v01.png",
    tag: "Minecraft",
  },
  {
    id: "cardmyanime",
    name: "CardMyAnime",
    description:
      "Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées, avec classements et statistiques détaillées.",
    url: "https://cma.ascencia.re/",
    logo: "https://cma.ascencia.re/images/cma-logo.png",
    tag: "Anime",
  },
  {
    id: "dna-interactive",
    name: "DNA Interactive",
    description:
      "Carte interactive pour Duet Night Abyss. Explorez les régions, trouvez les secrets et les collectibles.",
    url: "https://dna.ascencia.re/",
    logo: "https://dna.ascencia.re/assets/images/logo_optimized.png",
    tag: "Jeu vidéo",
  },
  {
    id: "sharex-manager",
    name: "ShareX Manager",
    description:
      "Gérez vos uploads ShareX facilement et en toute sécurité : historique, galerie, statistiques et outils bonus.",
    url: "https://sxm.ascencia.re/",
    logo: "https://sxm.ascencia.re/images/logo-sxm-simple.png",
    tag: "Utilitaire",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description:
      "Portfolio personnel d'Ahmed Karim. Ses projets, ses compétences et ses réalisations en développement web.",
    url: "https://portfolio.ascencia.re/",
    logo: "https://portfolio.ascencia.re/img/logo.png",
    tag: "Portfolio",
  },
];

/** Le hub qui recense tous les projets de l'écosystème. */
export const ECOSYSTEM_HUB = {
  name: "Ascencia",
  url: "https://ascencia.re/",
};
