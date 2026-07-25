import { atomWithStorage } from "jotai/utils";

export interface TtsSettings {
  selectedVoice: string;
  rate: number;
  pitch: number;
  volume: number;
  clipboardAutoRead: boolean;
}

export interface SavedText {
  id: string;
  name: string;
  content: string;
  updatedAt: Date;
}

export const DEFAULT_SETTINGS = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

// Clés localStorage conservées à l'identique pour ne pas perdre les données
// des utilisateurs de la version précédente de l'outil.
export const ttsSettingsAtom = atomWithStorage<TtsSettings>("tts-settings", {
  selectedVoice: "",
  rate: DEFAULT_SETTINGS.rate,
  pitch: DEFAULT_SETTINGS.pitch,
  volume: DEFAULT_SETTINGS.volume,
  clipboardAutoRead: false,
});

export const ttsTextAtom = atomWithStorage("tts-text", "");

export const ttsSavedTextsAtom = atomWithStorage<SavedText[]>(
  "tts-saved-texts",
  []
);

export const ttsHistoryAtom = atomWithStorage<string[]>("tts-history", []);

export const SAMPLE_TEXTS = [
  {
    title: "Salutation",
    description: "Message de bienvenue simple",
    content: "Bonjour ! Comment allez-vous aujourd'hui ?",
  },
  {
    title: "Technologie",
    description: "Texte sur l'innovation",
    content:
      "La technologie de synthèse vocale a considérablement évolué ces dernières années.",
  },
  {
    title: "Intelligence Artificielle",
    description: "Impact de l'IA",
    content:
      "L'intelligence artificielle transforme notre façon de travailler et de communiquer.",
  },
  {
    title: "Développement",
    description: "Programmation moderne",
    content:
      "Le développement de logiciels en Rust offre des performances exceptionnelles et une sécurité mémoire garantie.",
  },
];

// Mapping des codes de langue vers les codes de pays (drapeaux)
export const LANGUAGE_TO_COUNTRY: { [key: string]: string } = {
  fr: "FR",
  en: "GB",
  es: "ES",
  de: "DE",
  it: "IT",
  pt: "PT",
  nl: "NL",
  ja: "JP",
  ko: "KR",
  zh: "CN",
  ru: "RU",
  ar: "SA",
  hi: "IN",
  th: "TH",
  tr: "TR",
  pl: "PL",
  sv: "SE",
  da: "DK",
  no: "NO",
  fi: "FI",
  hu: "HU",
  cs: "CZ",
  sk: "SK",
  ro: "RO",
  bg: "BG",
  hr: "HR",
  sl: "SI",
  et: "EE",
  lv: "LV",
  lt: "LT",
  el: "GR",
  he: "IL",
  id: "ID",
  ms: "MY",
  vi: "VN",
  uk: "UA",
  be: "BY",
  kk: "KZ",
  ky: "KG",
  uz: "UZ",
  tg: "TJ",
  mn: "MN",
  ka: "GE",
  hy: "AM",
  az: "AZ",
  tk: "TM",
  fa: "IR",
  ps: "AF",
  ur: "PK",
  bn: "BD",
  si: "LK",
  ne: "NP",
  my: "MM",
  km: "KH",
  lo: "LA",
  ta: "IN",
  te: "IN",
  kn: "IN",
  ml: "IN",
  gu: "IN",
  pa: "IN",
  or: "IN",
  mr: "IN",
  is: "IS",
  fo: "FO",
  ga: "IE",
  gd: "GB",
  cy: "GB",
  mt: "MT",
  eu: "ES",
  ca: "ES",
  gl: "ES",
  lb: "LU",
  mk: "MK",
  sq: "AL",
  bs: "BA",
  sr: "RS",
};
