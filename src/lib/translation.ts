import { toast } from "sonner";

// Interface pour la réponse de LibreTranslate
interface LibreTranslateResponse {
  translatedText: string;
}

// Fonction pour diviser intelligemment le texte en chunks
function splitTextIntoChunks(text: string, maxLength: number = 500): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    if (remainingText.length <= maxLength) {
      chunks.push(remainingText);
      break;
    }

    // Prendre un chunk de la taille maximale
    let chunk = remainingText.substring(0, maxLength);

    // Chercher la dernière fin de phrase dans ce chunk
    const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n', '.\t', '!\t', '?\t'];
    let bestSplitIndex = -1;

    for (const ending of sentenceEndings) {
      const lastIndex = chunk.lastIndexOf(ending);
      if (lastIndex > maxLength * 0.3 && lastIndex > bestSplitIndex) { // Au moins 30% du chunk
        bestSplitIndex = lastIndex + ending.length; // Inclure la ponctuation
      }
    }

    // Si on a trouvé une fin de phrase appropriée
    if (bestSplitIndex > 0) {
      chunk = remainingText.substring(0, bestSplitIndex);
      remainingText = remainingText.substring(bestSplitIndex).trim();
    } else {
      // Sinon, chercher d'autres séparateurs naturels
      const naturalBreaks = ['\n\n', '\n', '  ', '\t'];
      bestSplitIndex = -1;

      for (const breakChar of naturalBreaks) {
        const lastIndex = chunk.lastIndexOf(breakChar);
        if (lastIndex > maxLength * 0.5 && lastIndex > bestSplitIndex) { // Au moins 50% du chunk
          bestSplitIndex = lastIndex + breakChar.length;
        }
      }

      if (bestSplitIndex > 0) {
        chunk = remainingText.substring(0, bestSplitIndex);
        remainingText = remainingText.substring(bestSplitIndex).trim();
      } else {
        // Dernier recours: couper au milieu (mais pas au milieu d'un mot si possible)
        const words = remainingText.split(' ');
        let wordBasedChunk = '';

        for (const word of words) {
          if ((wordBasedChunk + ' ' + word).length > maxLength * 0.8) {
            break;
          }
          wordBasedChunk += (wordBasedChunk ? ' ' : '') + word;
        }

        if (wordBasedChunk) {
          chunk = wordBasedChunk;
          const chunkLength = chunk.length + (remainingText.startsWith(chunk) ? 0 : 1);
          remainingText = remainingText.substring(chunkLength).trim();
        } else {
          // Couper brutalement si rien d'autre ne marche
          chunk = remainingText.substring(0, maxLength);
          remainingText = remainingText.substring(maxLength).trim();
        }
      }
    }

    chunks.push(chunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 0);
}

// Fonction pour traduire un seul chunk
async function translateChunk(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  // Essayer LibreTranslate d'abord
  try {
    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
    });

    if (response.ok) {
      const data: LibreTranslateResponse = await response.json();
      if (data.translatedText) {
        return data.translatedText;
      }
    }
  } catch (error) {
    console.warn("LibreTranslate échoué pour ce chunk:", error);
  }

  // Essayer MyMemory comme fallback
  try {
    const myMemoryResponse = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${sourceLang}|${targetLang}`,
      {
        method: "GET",
      }
    );

    if (myMemoryResponse.ok) {
      const myMemoryData = await myMemoryResponse.json();
      if (
        myMemoryData.responseData &&
        myMemoryData.responseData.translatedText
      ) {
        return myMemoryData.responseData.translatedText;
      }
    }
  } catch (fallbackError) {
    console.warn("MyMemory aussi échoué pour ce chunk:", fallbackError);
  }

  throw new Error("Tous les services de traduction ont échoué pour ce chunk");
}

// Fonction pour traduire du texte en utilisant LibreTranslate
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (!text.trim()) {
    throw new Error("Aucun texte à traduire");
  }

  if (sourceLang === targetLang) {
    return text; // Pas besoin de traduire
  }

  try {
    // Diviser le texte en chunks intelligents
    const chunks = splitTextIntoChunks(text, 450); // Laisser une marge de sécurité

    if (chunks.length === 1) {
      // Texte court, traduction directe
      return await translateChunk(chunks[0], sourceLang, targetLang);
    }

    // Traduction en parallèle pour de meilleures performances
    const translationPromises = chunks.map(chunk =>
      translateChunk(chunk, sourceLang, targetLang)
    );

    const translatedChunks = await Promise.all(translationPromises);

    // Recombinaison intelligente
    let result = translatedChunks[0];
    for (let i = 1; i < translatedChunks.length; i++) {
      const previousChunk = chunks[i - 1];
      const currentChunk = chunks[i];

      // Ajouter un séparateur approprié
      if (previousChunk.endsWith('\n\n')) {
        result += '\n\n' + translatedChunks[i];
      } else if (previousChunk.endsWith('\n')) {
        result += '\n' + translatedChunks[i];
      } else if (currentChunk.startsWith(' ') || result.endsWith(' ')) {
        result += translatedChunks[i];
      } else {
        result += ' ' + translatedChunks[i];
      }
    }

    return result;

  } catch (error) {
    console.error("Erreur de traduction:", error);
    throw new Error("Erreur lors de la traduction. Les services de traduction peuvent être indisponibles ou le texte est trop long.");
  }
}

// Fonction pour détecter automatiquement la langue du texte
export async function detectLanguage(text: string): Promise<string> {
  if (!text.trim()) {
    return "en"; // Défaut à l'anglais
  }

  try {
    const response = await fetch("https://libretranslate.com/detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0 && data[0].language) {
        return data[0].language;
      }
    }
  } catch (error) {
    console.error("Erreur de détection de langue:", error);
  }

  // Fallback: retourner anglais par défaut
  return "en";
}
