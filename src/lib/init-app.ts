import { initArtifactService } from "./artefact-generator/init-artifact-service";

/**
 * Initialise tous les services de l'application
 */
export async function initializeApp(): Promise<void> {
  try {
    console.log("Initialisation de l'application...");

    // Initialiser le service d'artefacts
    await initArtifactService();

    console.log("Application initialisée avec succès");
  } catch (error) {
    console.warn("Erreur lors de l'initialisation de l'application:", error);
  }
}
