/**
 * Lecture / écriture des paramètres d'URL de l'outil de synthèse vocale.
 *
 * Permet de piloter l'outil depuis l'extérieur (client natif, marque-page,
 * raccourci PWA) :
 *
 *   /tools/text-to-speech?text=Bonjour&autoplay=1
 *   /tools/text-to-speech?b64=Qm9uam91cg&autoplay=1&rate=1.2&mini=1
 *
 * `b64` est du base64url d'UTF-8 : bien plus compact que le percent-encoding
 * pour du texte accentué (1,33x contre jusqu'à 9x par caractère accentué).
 */

export interface TtsLaunchParams {
  /** Texte à charger dans l'éditeur (déjà décodé). */
  text?: string;
  /** Lancer la lecture automatiquement dès l'arrivée. */
  autoplay: boolean;
  /** Ajouter à la suite du texte existant au lieu de le remplacer. */
  append: boolean;
  /** Interface épurée « lecteur ». */
  mini: boolean;
  /** Surcharges de lecture, valables pour cette session uniquement. */
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Nom exact ou partiel d'une voix (ex. « Denise », « Natural »). */
  voice?: string;
  /** Code de langue souhaité (ex. « fr », « fr-FR », « en-US »). */
  lang?: string;
  /** Vrai si l'URL contenait au moins un paramètre reconnu. */
  hasAny: boolean;
}

export const EMPTY_TTS_PARAMS: TtsLaunchParams = {
  autoplay: false,
  append: false,
  mini: false,
  hasAny: false,
};

/** Tous les paramètres reconnus, utilisés pour nettoyer l'URL après lecture. */
export const TTS_PARAM_KEYS = [
  "text",
  "t",
  "b64",
  "autoplay",
  "play",
  "append",
  "mini",
  "rate",
  "pitch",
  "volume",
  "voice",
  "lang",
] as const;

/** Décode du base64url (sans padding) contenant de l'UTF-8. */
export function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}

/** Encode une chaîne UTF-8 en base64url (sans padding). */
export function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function readBoolean(params: URLSearchParams, ...keys: string[]): boolean {
  for (const key of keys) {
    const raw = params.get(key);
    if (raw === null) continue;
    // `?autoplay` seul (valeur vide) vaut vrai
    if (raw === "") return true;
    return ["1", "true", "yes", "on", "oui"].includes(raw.toLowerCase());
  }
  return false;
}

function readNumber(
  params: URLSearchParams,
  key: string,
  min: number,
  max: number
): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return undefined;

  const value = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(value)) return undefined;

  return Math.min(max, Math.max(min, value));
}

/**
 * Analyse une query string (`window.location.search` ou une URL complète).
 * Ne lève jamais : un paramètre invalide est simplement ignoré.
 */
export function parseTtsParams(
  input: string | URLSearchParams
): TtsLaunchParams {
  let params: URLSearchParams;

  if (typeof input === "string") {
    const queryStart = input.indexOf("?");
    params = new URLSearchParams(queryStart >= 0 ? input.slice(queryStart) : input);
  } else {
    params = input;
  }

  let text: string | undefined;

  const b64 = params.get("b64");
  if (b64) {
    try {
      text = decodeBase64Url(b64);
    } catch {
      // payload corrompu : on retombe sur `text` s'il existe
    }
  }

  if (text === undefined) {
    text = params.get("text") ?? params.get("t") ?? undefined;
  }

  const result: TtsLaunchParams = {
    text: text?.length ? text : undefined,
    autoplay: readBoolean(params, "autoplay", "play"),
    append: readBoolean(params, "append"),
    mini: readBoolean(params, "mini"),
    rate: readNumber(params, "rate", 0.5, 2),
    pitch: readNumber(params, "pitch", 0.5, 2),
    volume: readNumber(params, "volume", 0, 1),
    voice: params.get("voice") ?? undefined,
    lang: params.get("lang") ?? undefined,
    hasAny: TTS_PARAM_KEYS.some((key) => params.has(key)),
  };

  return result;
}

export interface BuildTtsUrlOptions {
  text: string;
  autoplay?: boolean;
  mini?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  lang?: string;
  /** Utiliser `b64` plutôt que `text` (par défaut : oui, plus compact). */
  encoded?: boolean;
}

/**
 * Construit une URL de lancement.
 * `base` peut être une origine (« https://exemple.fr ») ou une URL complète
 * de l'outil ; le chemin est ajouté s'il manque.
 */
export function buildTtsUrl(base: string, options: BuildTtsUrlOptions): string {
  const path = "/tools/text-to-speech";
  const root = base.replace(/\/+$/, "");
  const url = new URL(root.endsWith(path) ? root : `${root}${path}`);

  const { text, encoded = true } = options;

  if (encoded) {
    url.searchParams.set("b64", encodeBase64Url(text));
  } else {
    url.searchParams.set("text", text);
  }

  if (options.autoplay) url.searchParams.set("autoplay", "1");
  if (options.mini) url.searchParams.set("mini", "1");
  if (options.rate !== undefined) url.searchParams.set("rate", String(options.rate));
  if (options.pitch !== undefined)
    url.searchParams.set("pitch", String(options.pitch));
  if (options.volume !== undefined)
    url.searchParams.set("volume", String(options.volume));
  if (options.voice) url.searchParams.set("voice", options.voice);
  if (options.lang) url.searchParams.set("lang", options.lang);

  return url.toString();
}

/** Retire les paramètres de l'outil d'une query string, en gardant les autres. */
export function stripTtsParams(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  for (const key of TTS_PARAM_KEYS) {
    params.delete(key);
  }
  const rest = params.toString();
  return rest ? `?${rest}` : "";
}
