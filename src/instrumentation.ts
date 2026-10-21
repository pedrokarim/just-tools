/**
 * Exécuté une fois, au démarrage du serveur (jamais pendant le build).
 *
 * Une configuration d'authentification incomplète fait échouer le démarrage :
 * le conteneur ne passe pas au vert et `deploy.sh` affiche l'erreur, au lieu
 * d'un site qui tourne et refuse la première connexion.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertAuthConfig } = await import("./lib/auth");
    assertAuthConfig();
  }
}
