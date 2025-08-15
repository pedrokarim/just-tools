import { toast } from "sonner";
import {
  cleanFileContent,
  validateFileType,
  validateImage,
} from "./text-processing";

// Fonction pour importer un fichier texte
export async function importTextFile(
  file: File,
  setText: (text: string) => void
): Promise<void> {
  if (!validateFileType(file)) {
    toast.error(
      "Type de fichier non supporté. Utilisez un fichier texte (.txt, .md, .csv, etc.)"
    );
    return;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const cleanedContent = cleanFileContent(content, file.name);
        setText(cleanedContent);
        toast.success(`Fichier "${file.name}" importé et nettoyé avec succès`);
        resolve();
      } else {
        reject(new Error("Impossible de lire le fichier"));
      }
    };

    reader.onerror = () => {
      toast.error("Erreur lors de la lecture du fichier");
      reject(new Error("Erreur de lecture"));
    };

    reader.readAsText(file);
  });
}

// Fonction pour extraire le texte d'une image (OCR)
export async function extractTextFromImage(
  file: File,
  setText: (text: string) => void
): Promise<void> {
  if (!validateImage(file)) {
    return;
  }

  return new Promise((resolve, reject) => {
    // Créer un canvas pour l'image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img") as HTMLImageElement;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // Utiliser Tesseract.js pour l'OCR
      import("tesseract.js")
        .then(({ createWorker }) => {
          toast.info("Extraction du texte en cours...");

          createWorker("fra+eng", 1, {
            logger: (m) => console.log(m),
          })
            .then((worker) => {
              return worker.recognize(canvas);
            })
            .then(({ data: { text } }) => {
              if (text.trim()) {
                setText(text);
                toast.success("Texte extrait de l'image avec succès");
                resolve();
              } else {
                toast.warning("Aucun texte détecté dans l'image");
                resolve();
              }
            })
            .catch((error) => {
              console.error("Erreur OCR:", error);
              toast.error("Erreur lors de l'extraction du texte");
              reject(error);
            });
        })
        .catch(() => {
          toast.error(
            "Module OCR non disponible. Veuillez installer tesseract.js"
          );
          reject(new Error("Module OCR non disponible"));
        });
    };

    img.onerror = () => {
      toast.error("Erreur lors du chargement de l'image");
      reject(new Error("Erreur de chargement d'image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

// Fonction pour extraire le texte d'une URL d'image (OCR)
export async function extractTextFromImageURL(
  imageUrl: string,
  setText: (text: string) => void
): Promise<void> {
  // Validation de l'URL
  if (!imageUrl.trim()) {
    toast.error("Veuillez entrer une URL d'image valide");
    return;
  }

  // Validation basique de l'URL
  try {
    new URL(imageUrl.trim());
  } catch {
    toast.error(
      "URL invalide. Veuillez entrer une URL complète (ex: https://exemple.com/image.jpg)"
    );
    return;
  }

  return new Promise((resolve, reject) => {
    // Créer un canvas pour l'image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img") as HTMLImageElement;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // Utiliser Tesseract.js pour l'OCR
      import("tesseract.js")
        .then(({ createWorker }) => {
          toast.info("Extraction du texte depuis l'URL en cours...");

          createWorker("fra+eng", 1, {
            logger: (m) => console.log(m),
          })
            .then((worker) => {
              return worker.recognize(canvas);
            })
            .then(({ data: { text } }) => {
              if (text.trim()) {
                setText(text);
                toast.success("Texte extrait de l'image avec succès");
                resolve();
              } else {
                toast.warning("Aucun texte détecté dans l'image");
                resolve();
              }
            })
            .catch((error) => {
              console.error("Erreur OCR:", error);
              toast.error("Erreur lors de l'extraction du texte");
              reject(error);
            });
        })
        .catch(() => {
          toast.error(
            "Module OCR non disponible. Veuillez installer tesseract.js"
          );
          reject(new Error("Module OCR non disponible"));
        });
    };

    img.onerror = () => {
      toast.error(
        "Impossible de charger l'image. Vérifiez que :\n" +
          "• L'URL est correcte et pointe vers une image\n" +
          "• Le domaine est autorisé (Unsplash, Picsum, etc.)\n" +
          "• L'image est accessible publiquement"
      );
      reject(new Error("Erreur de chargement d'image depuis URL"));
    };

    // Utiliser notre API proxy pour éviter les problèmes CORS
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(
      imageUrl.trim()
    )}`;
    img.src = proxyUrl;
  });
}

// Fonction pour récupérer le texte du presse-papiers
export async function getClipboardText(
  setText: (text: string) => void
): Promise<void> {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText.trim()) {
      setText(clipboardText);
      toast.success("Texte récupéré depuis le presse-papiers");
    } else {
      toast.warning("Le presse-papiers est vide");
    }
  } catch (error) {
    toast.error("Impossible d'accéder au presse-papiers");
    throw error;
  }
}
