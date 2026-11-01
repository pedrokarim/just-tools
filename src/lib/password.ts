/** La génération de mots de passe, sans interface : testable, et tirée au sort. */

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const SIMILAR = "il1Lo0O";
const AMBIGUOUS = "{}[]()/\\'\"`~,;:.<>";

/** Les caractères autorisés par ces options, sans doublon. */
export function buildCharset(options: PasswordOptions): string {
  let charset = "";
  if (options.includeUppercase) charset += UPPERCASE;
  if (options.includeLowercase) charset += LOWERCASE;
  if (options.includeNumbers) charset += NUMBERS;
  if (options.includeSymbols) charset += SYMBOLS;

  return [...charset]
    .filter((char) => !(options.excludeSimilar && SIMILAR.includes(char)))
    .filter((char) => !(options.excludeAmbiguous && AMBIGUOUS.includes(char)))
    .join("");
}

/**
 * Un entier uniforme dans `[0, max[`, tiré par le générateur cryptographique.
 *
 * Le rejet est ce qui rend le tirage uniforme : un simple modulo favoriserait les
 * premiers caractères de l'alphabet.
 */
function randomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
}

/** Tire un mot de passe. Chaîne vide si aucun caractère n'est autorisé. */
export function generatePassword(options: PasswordOptions): string {
  const charset = buildCharset(options);
  if (!charset) return "";

  return Array.from(
    { length: options.length },
    () => charset[randomIndex(charset.length)]
  ).join("");
}

/** L'entropie en bits d'un mot de passe tiré au hasard avec ces options. */
export function estimateEntropy(options: PasswordOptions): number {
  const size = buildCharset(options).length;
  return size > 1 ? options.length * Math.log2(size) : 0;
}

export type StrengthLevel = "weak" | "fair" | "strong" | "excellent";

export interface PasswordStrength {
  level: StrengthLevel;
  label: string;
  description: string;
  /** Remplissage de la jauge, de 0 à 1. */
  ratio: number;
}

/** Seuils usuels : sous 60 bits, un mot de passe reste à portée d'une attaque. */
export function describeStrength(bits: number): PasswordStrength {
  const ratio = Math.min(bits / 128, 1);

  if (bits < 40) {
    return {
      level: "weak",
      label: "Faible",
      description: "Trouvable en peu de temps. Allonge-le ou ajoute des types de caractères.",
      ratio,
    };
  }
  if (bits < 60) {
    return {
      level: "fair",
      label: "Moyen",
      description: "Correct pour un compte secondaire, un peu juste pour le reste.",
      ratio,
    };
  }
  if (bits < 100) {
    return {
      level: "strong",
      label: "Fort",
      description: "Largement hors de portée d'une attaque par force brute.",
      ratio,
    };
  }
  return {
    level: "excellent",
    label: "Excellent",
    description: "Convient aussi à un gestionnaire de mots de passe ou à une clé.",
    ratio,
  };
}
