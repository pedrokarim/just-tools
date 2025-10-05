import { initializeArtifactService } from "./artifact-service";

let isInitialized = false;

/**
 * Initialise le service d'artefacts de manière asynchrone
 * Cette fonction peut être appelée plusieurs fois sans problème
 */
export async function initArtifactService(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    await initializeArtifactService();
    isInitialized = true;
    console.log("Service d'artefacts initialisé avec succès");
  } catch (error) {
    console.warn(
      "Erreur lors de l'initialisation du service d'artefacts:",
      error
    );
    // Ne pas marquer comme initialisé en cas d'erreur pour permettre une nouvelle tentative
  }
}

/**
 * Vérifie si le service est initialisé
 */
export function isArtifactServiceInitialized(): boolean {
  return isInitialized;
}
