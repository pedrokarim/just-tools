/** Clé de stockage de l'état du rail d'outils. */
export const RAIL_KEY = "just-tools:rail";

/**
 * Pose l'état du rail avant le premier rendu : réduit en attribut sur <html>, il
 * ne saute pas à l'arrivée sur la page.
 */
export const RAIL_INIT_SCRIPT = `try{if(localStorage.getItem("${RAIL_KEY}")==="collapsed")document.documentElement.dataset.rail="collapsed"}catch(e){}`;
