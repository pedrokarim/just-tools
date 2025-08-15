"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Settings,
  Copy,
  RotateCcw,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mic,
  MicOff,
  Clipboard,
  X,
  Shield,
  Upload,
  FileText,
  Image,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGES, getLanguageDisplayName } from "@/lib/language-data";
import ReactCountryFlag from "react-country-flag";
import { cleanTextForTTS } from "@/lib/text-processing";
import {
  importTextFile,
  extractTextFromImage,
  extractTextFromImageURL,
  getClipboardText as getClipboardTextUtil,
} from "@/lib/file-import";

type Voice = SpeechSynthesisVoice;

interface SavedText {
  id: string;
  name: string;
  content: string;
  updatedAt: Date;
}

// Atomes Jotai pour la persistance
export const ttsSettingsAtom = atomWithStorage("tts-settings", {
  selectedVoice: "",
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  clipboardAutoRead: false,
});

export const ttsTextAtom = atomWithStorage("tts-text", "");

export const ttsSavedTextsAtom = atomWithStorage<SavedText[]>(
  "tts-saved-texts",
  []
);

export const ttsHistoryAtom = atomWithStorage<string[]>("tts-history", []);

const DEFAULT_SETTINGS = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

const SAMPLE_TEXTS = [
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

export default function TextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveBox, setShowSaveBox] = useState(false);
  const [saveTextName, setSaveTextName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);

  // États de chargement pour les différentes opérations
  const [isClipboardLoading, setIsClipboardLoading] = useState(false);
  const [isFileImportLoading, setIsFileImportLoading] = useState(false);
  const [isImageOCRLoading, setIsImageOCRLoading] = useState(false);
  const [isImageUrlLoading, setIsImageUrlLoading] = useState(false);
  const [isSavingText, setIsSavingText] = useState(false);

  // Atomes Jotai
  const [settings, setSettings] = useAtom(ttsSettingsAtom);
  const [text, setText] = useAtom(ttsTextAtom);
  const [rawSavedTexts, setRawSavedTexts] = useAtom(ttsSavedTextsAtom);
  const [history, setHistory] = useAtom(ttsHistoryAtom);

  // Convertir les dates des textes sauvegardés
  const savedTexts = rawSavedTexts.map((item) => ({
    ...item,
    updatedAt: new Date(item.updatedAt),
  }));

  // Mapping des codes de langue vers les codes de pays
  const languageToCountry: { [key: string]: string } = {
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

  // Obtenir les langues uniques disponibles
  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    voices.forEach((voice) => {
      const langCode = voice.lang.split("-")[0]; // Prendre juste le code de langue (fr, en, etc.)
      languages.add(langCode);
    });
    return Array.from(languages).sort();
  }, [voices]);

  // Filtrer les voix selon la langue sélectionnée
  const filteredVoices = useMemo(() => {
    if (selectedLanguage === "all") {
      return voices;
    }
    return voices.filter((voice) => voice.lang.startsWith(selectedLanguage));
  }, [voices, selectedLanguage]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fonction pour récupérer le texte du presse-papiers
  const handleClipboardText = useCallback(async () => {
    setIsClipboardLoading(true);
    try {
      await getClipboardTextUtil(setText);
    } catch (error) {
      console.error("Erreur clipboard:", error);
    } finally {
      setIsClipboardLoading(false);
    }
  }, [setText]);

  // Fonction pour importer un fichier texte
  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsFileImportLoading(true);
      try {
        await importTextFile(file, setText);
      } catch (error) {
        console.error("Erreur import fichier:", error);
      } finally {
        setIsFileImportLoading(false);
        // Réinitialiser l'input
        event.target.value = "";
      }
    },
    [setText]
  );

  // Fonction pour extraire le texte d'une image (OCR)
  const handleImageOCR = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsImageOCRLoading(true);
      try {
        await extractTextFromImage(file, setText);
      } catch (error) {
        console.error("Erreur OCR:", error);
      } finally {
        setIsImageOCRLoading(false);
        // Réinitialiser l'input
        event.target.value = "";
      }
    },
    [setText]
  );

  // Fonction pour gérer le drop de fichiers
  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0]; // On ne prend que le premier fichier

      try {
        if (file.type.startsWith("image/")) {
          // C'est une image, faire l'OCR
          setIsImageOCRLoading(true);
          await extractTextFromImage(file, setText);
        } else {
          // C'est un fichier texte, l'importer
          setIsFileImportLoading(true);
          await importTextFile(file, setText);
        }
      } catch (error) {
        console.error("Erreur lors du drop:", error);
      } finally {
        setIsImageOCRLoading(false);
        setIsFileImportLoading(false);
      }
    },
    [setText]
  );

  // Fonction pour gérer le drag over
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(true);
    },
    []
  );

  // Fonction pour gérer le drag leave
  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
    },
    []
  );

  // Fonction pour traiter une URL d'image
  const handleImageUrlSubmit = useCallback(async () => {
    if (!imageUrl.trim()) {
      toast.error("Veuillez entrer une URL d'image");
      return;
    }

    setIsImageUrlLoading(true);
    try {
      await extractTextFromImageURL(imageUrl, setText);
      setShowImageUrlInput(false);
      setImageUrl("");
    } catch (error) {
      console.error("Erreur URL image:", error);
    } finally {
      setIsImageUrlLoading(false);
    }
  }, [imageUrl, setText]);

  // Écouter les changements du presse-papiers si l'option est activée
  useEffect(() => {
    if (!settings.clipboardAutoRead) return;

    const handleClipboardChange = () => {
      handleClipboardText();
    };

    // Écouter les événements de copie
    document.addEventListener("copy", handleClipboardChange);
    document.addEventListener("paste", handleClipboardChange);

    return () => {
      document.removeEventListener("copy", handleClipboardChange);
      document.removeEventListener("paste", handleClipboardChange);
    };
  }, [settings.clipboardAutoRead, handleClipboardText]);

  // Charger les voix disponibles
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Sélectionner automatiquement une voix française si aucune n'est sélectionnée
      if (!settings.selectedVoice && availableVoices.length > 0) {
        // Priorité 1: Voix française naturelle/neural
        let frenchVoice = availableVoices.find(
          (v) => /^fr/i.test(v.lang) && /natural|online|neural/i.test(v.name)
        );

        // Priorité 2: N'importe quelle voix française
        if (!frenchVoice) {
          frenchVoice = availableVoices.find((v) => /^fr/i.test(v.lang));
        }

        // Priorité 3: Voix naturelle/neural dans n'importe quelle langue
        if (!frenchVoice) {
          frenchVoice = availableVoices.find((v) =>
            /natural|online|neural/i.test(v.name)
          );
        }

        // Priorité 4: Première voix disponible
        if (!frenchVoice) {
          frenchVoice = availableVoices[0];
        }

        setSettings((prev) => ({ ...prev, selectedVoice: frenchVoice.name }));
      }
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, [settings.selectedVoice, setSettings]);

  const speak = useCallback(() => {
    if (!text.trim()) {
      toast.error("Veuillez entrer du texte à lire");
      return;
    }

    if (utteranceRef.current) {
      speechSynthesis.cancel();
    }

    // Nettoyer le texte pour la synthèse vocale
    const cleanText = cleanTextForTTS(text);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Configurer la voix
    if (settings.selectedVoice) {
      const voice = voices.find((v) => v.name === settings.selectedVoice);
      if (voice) utterance.voice = voice;
    }

    // Configurer les paramètres
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    // Gestion des événements
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentText(text);
      setIsLoading(false);

      // Ajouter à l'historique
      setHistory((prev) => {
        const newHistory = [
          text,
          ...prev.filter((item) => item !== text),
        ].slice(0, 20);
        return newHistory;
      });

      toast.success("Lecture en cours...");
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentText("");
      utteranceRef.current = null;
      toast.success("Lecture terminée");
    };

    utterance.onpause = () => {
      setIsPlaying(false);
      setIsPaused(true);
      toast.info("Lecture en pause");
    };

    utterance.onresume = () => {
      setIsPlaying(true);
      setIsPaused(false);
      toast.success("Lecture reprise");
    };

    utterance.onerror = (event) => {
      // Ne pas afficher l'erreur "interrupted" car c'est normal lors de l'arrêt
      if (event.error !== "interrupted") {
        console.error("Erreur TTS:", event);
        toast.error("Erreur lors de la lecture");
      }

      setIsPlaying(false);
      setIsPaused(false);
      setCurrentText("");
      utteranceRef.current = null;
    };

    setIsLoading(true);
    speechSynthesis.speak(utterance);
  }, [text, settings, voices]);

  const pause = useCallback(() => {
    if (isPlaying) {
      speechSynthesis.pause();
    } else if (isPaused) {
      speechSynthesis.resume();
    }
  }, [isPlaying, isPaused]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentText("");
    utteranceRef.current = null;
    toast.info("Lecture arrêtée");
  }, []);

  const copyText = useCallback(() => {
    if (text.trim()) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success("Texte copié dans le presse-papiers");
        })
        .catch(() => {
          toast.error("Impossible de copier le texte");
        });
    } else {
      toast.warning("Aucun texte à copier");
    }
  }, [text]);

  const clearText = useCallback(() => {
    if (text.trim()) {
      if (confirm("Êtes-vous sûr de vouloir effacer le texte ?")) {
        setText("");
        toast.success("Texte effacé");
      }
    }
  }, [text]);

  const saveText = useCallback(() => {
    if (!text.trim()) {
      toast.error("Aucun texte à sauvegarder");
      return;
    }
    setSaveTextName("");
    setShowSaveBox(true);
  }, [text]);

  const handleSaveText = useCallback(() => {
    if (!saveTextName.trim()) {
      toast.error("Veuillez entrer un nom pour le texte");
      return;
    }

    setIsSavingText(true);
    try {
      const newText: SavedText = {
        id: Date.now().toString(),
        name: saveTextName.trim(),
        content: text,
        updatedAt: new Date(),
      };
      setRawSavedTexts((prev) => [newText, ...prev]);
      setShowSaveBox(false);
      setSaveTextName("");
      toast.success("Texte sauvegardé");
    } finally {
      setIsSavingText(false);
    }
  }, [saveTextName, text, setRawSavedTexts]);

  const loadText = useCallback((savedText: SavedText) => {
    setText(savedText.content);
    toast.success(`Texte "${savedText.name}" chargé`);
  }, []);

  const deleteText = useCallback(
    (id: string) => {
      setRawSavedTexts((prev: SavedText[]) =>
        prev.filter((t: SavedText) => t.id !== id)
      );
      toast.success("Texte supprimé");
    },
    [setRawSavedTexts]
  );

  const resetSettings = useCallback(() => {
    setShowResetDialog(true);
  }, []);

  const handleConfirmReset = useCallback(() => {
    setSettings({
      selectedVoice: "",
      rate: DEFAULT_SETTINGS.rate,
      pitch: DEFAULT_SETTINGS.pitch,
      volume: DEFAULT_SETTINGS.volume,
      clipboardAutoRead: false,
    });
    setText(""); // Vider le texte actuel
    setHistory([]); // Vider l'historique
    setShowResetDialog(false);
    toast.success("Tout a été réinitialisé");
  }, [setSettings, setText, setHistory]);

  const loadSampleText = useCallback((sample: (typeof SAMPLE_TEXTS)[0]) => {
    setText(sample.content);
    toast.success(`Exemple "${sample.title}" chargé`);
  }, []);

  const loadFromHistory = useCallback(
    (historyText: string) => {
      setText(historyText);
      toast.success("Texte chargé depuis l'historique");
    },
    [setText]
  );

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            speak();
            break;
          case " ":
            e.preventDefault();
            pause();
            break;
          case "Escape":
            e.preventDefault();
            stop();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [speak, pause, stop]);

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full px-6 py-8">
        {/* Statut */}
        <div className="flex items-center space-x-4 mb-6">
          <Badge
            variant={isPlaying ? "default" : isPaused ? "secondary" : "outline"}
            className={isPlaying ? "bg-emerald-500" : ""}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : isPlaying ? (
              <Mic className="w-3 h-3 mr-1" />
            ) : isPaused ? (
              <Pause className="w-3 h-3 mr-1" />
            ) : (
              <MicOff className="w-3 h-3 mr-1" />
            )}
            {isLoading
              ? "Chargement..."
              : isPlaying
              ? "Lecture en cours"
              : isPaused
              ? "En pause"
              : "Prêt"}
          </Badge>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {characterCount} caractères • {wordCount} mots
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Zone de texte */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span>Texte à lire</span>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                      <Download className="w-4 h-4" />
                      <span>Glissez-déposez un fichier ici</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyText}
                      disabled={!text.trim()}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearText}
                      disabled={!text.trim()}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Effacer
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative min-h-[200px] rounded-lg border-2 border-dashed transition-all duration-200 ${
                    isDragOver
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Entrez votre texte ici, glissez-déposez un fichier, ou utilisez un exemple ci-dessous..."
                    className="min-h-[200px] resize-none border-0 bg-transparent focus:ring-0"
                  />

                  {/* Backdrop de drop */}
                  {isDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm rounded-lg">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Déposez votre fichier ici
                        </p>
                        <p className="text-sm text-emerald-500 dark:text-emerald-400">
                          Fichiers texte (.txt, .md, .csv, .json) ou images
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Indicateur de chargement */}
                  {(isFileImportLoading ||
                    isImageOCRLoading ||
                    isImageUrlLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-500/10 backdrop-blur-sm rounded-lg">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-spin" />
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {isFileImportLoading && "Import en cours..."}
                          {isImageOCRLoading && "Extraction OCR en cours..."}
                          {isImageUrlLoading &&
                            "Extraction depuis URL en cours..."}
                        </p>
                        <p className="text-sm text-emerald-500 dark:text-emerald-400">
                          Veuillez patienter...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contrôles de lecture */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Contrôles de lecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={speak}
                    disabled={isLoading || !text.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Lire
                  </Button>

                  <Button
                    variant="outline"
                    onClick={pause}
                    disabled={!isPlaying && !isPaused}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    {isPaused ? "Reprendre" : "Pause"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={stop}
                    disabled={!isPlaying && !isPaused}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Arrêter
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  Raccourcis:{" "}
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs dark:text-slate-200">
                    Ctrl+Enter
                  </kbd>{" "}
                  Lire •
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs dark:text-slate-200">
                    Ctrl+Espace
                  </kbd>{" "}
                  Pause •
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs dark:text-slate-200">
                    Ctrl+Echap
                  </kbd>{" "}
                  Arrêter
                </div>
              </CardContent>
            </Card>

            {/* Texte en cours de lecture */}
            {currentText && (
              <Card className="shadow-lg border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                    Texte en cours de lecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed italic bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg">
                    {currentText}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Confidentialité et stockage */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-emerald-500" />
                  Confidentialité et stockage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Stockage côté client :</strong> Toutes vos données
                      (texte actuel, historique, textes sauvegardés, paramètres)
                      sont stockées uniquement dans votre navigateur via le
                      localStorage.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Aucun serveur :</strong> Aucune de vos données
                      n'est envoyée ou stockée sur nos serveurs. Votre
                      confidentialité est garantie.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Contrôle total :</strong> Utilisez le bouton
                      "Réinitialiser" pour supprimer instantanément toutes vos
                      données stockées côté client.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Note :</strong> La suppression des données de
                      votre navigateur (historique, cookies, etc.) peut
                      également effacer vos données sauvegardées.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exemples de textes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Exemples de textes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_TEXTS.map((sample, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-400 cursor-pointer transition-colors"
                      onClick={() => loadSampleText(sample)}
                    >
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {sample.title}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {sample.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historique des synthèses */}
            {history.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RotateCcw className="w-5 h-5 mr-2 text-emerald-500" />
                    Historique des synthèses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {history.map((historyText, index) => (
                      <div
                        key={index}
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-400 cursor-pointer transition-colors"
                        onClick={() => loadFromHistory(historyText)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                              {historyText}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {historyText.length} caractères
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel de paramètres */}
          <div className="space-y-6">
            {/* Sélection de voix */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Voix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sélection de langue */}
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        🌍 Toutes les langues ({voices.length} voix)
                      </SelectItem>
                      {availableLanguages.map((lang) => {
                        const langVoices = voices.filter((voice) =>
                          voice.lang.startsWith(lang)
                        );
                        const langInfo = LANGUAGES.find((l) => l.code === lang);
                        const countryCode = languageToCountry[lang];

                        return (
                          <SelectItem key={lang} value={lang}>
                            <div className="flex items-center space-x-2">
                              {countryCode ? (
                                <ReactCountryFlag
                                  countryCode={countryCode}
                                  svg
                                  style={{
                                    width: "20px",
                                    height: "15px",
                                    borderRadius: "2px",
                                  }}
                                />
                              ) : (
                                <span className="text-lg">🌐</span>
                              )}
                              <span>
                                {langInfo?.name || lang.toUpperCase()}
                              </span>
                              <span className="text-slate-500">
                                ({langVoices.length} voix)
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sélection de voix */}
                <div className="space-y-2">
                  <Label>Voix</Label>
                  <Select
                    value={
                      filteredVoices.some(
                        (voice) => voice.name === settings.selectedVoice
                      )
                        ? settings.selectedVoice
                        : ""
                    }
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, selectedVoice: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une voix" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de lecture */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vitesse */}
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    Vitesse
                    <span className="text-emerald-600 font-bold">
                      {settings.rate}x
                    </span>
                  </Label>
                  <Slider
                    value={[settings.rate]}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, rate: value }))
                    }
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Lent</span>
                    <span>Normal</span>
                    <span>Rapide</span>
                  </div>
                </div>

                <Separator />

                {/* Hauteur */}
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    Hauteur
                    <span className="text-emerald-600 font-bold">
                      {settings.pitch}
                    </span>
                  </Label>
                  <Slider
                    value={[settings.pitch]}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, pitch: value }))
                    }
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Grave</span>
                    <span>Normal</span>
                    <span>Aigu</span>
                  </div>
                </div>

                <Separator />

                {/* Volume */}
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    Volume
                    <span className="text-emerald-600 font-bold">
                      {settings.volume}
                    </span>
                  </Label>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, volume: value }))
                    }
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Silencieux</span>
                    <span>Normal</span>
                    <span>Fort</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClipboardText}
                  disabled={isClipboardLoading}
                >
                  {isClipboardLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Clipboard className="w-4 h-4 mr-2" />
                  )}
                  {isClipboardLoading
                    ? "Récupération..."
                    : "Récupérer du presse-papiers"}
                </Button>

                {/* Import de fichiers */}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".txt,.md,.markdown,.csv,.json,.html,.xml,text/*"
                    onChange={handleFileImport}
                    className="hidden"
                    id="file-import"
                    disabled={isFileImportLoading}
                  />
                  <label
                    htmlFor="file-import"
                    className={`w-full inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      isFileImportLoading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    {isFileImportLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2" />
                    )}
                    {isFileImportLoading
                      ? "Import en cours..."
                      : "Importer un fichier texte"}
                  </label>
                </div>

                {/* OCR depuis image */}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageOCR}
                    className="hidden"
                    id="image-ocr"
                    disabled={isImageOCRLoading}
                  />
                  <label
                    htmlFor="image-ocr"
                    className={`w-full inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      isImageOCRLoading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    {isImageOCRLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Image className="w-4 h-4 mr-2" />
                    )}
                    {isImageOCRLoading
                      ? "Extraction en cours..."
                      : "Extraire le texte d'une image (OCR)"}
                  </label>
                </div>

                {/* OCR depuis URL d'image */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowImageUrlInput(!showImageUrlInput)}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Extraire le texte depuis une URL d'image
                  </Button>

                  {/* Input pour l'URL d'image */}
                  <AnimatePresence>
                    {showImageUrlInput && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                          <div className="flex space-x-2">
                            <Input
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleImageUrlSubmit()
                              }
                              className="flex-1"
                              autoFocus
                              disabled={isImageUrlLoading}
                            />
                            <Button
                              onClick={handleImageUrlSubmit}
                              disabled={!imageUrl.trim() || isImageUrlLoading}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                            >
                              {isImageUrlLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Image className="w-4 h-4 mr-2" />
                              )}
                              {isImageUrlLoading ? "Extraction..." : "Extraire"}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={saveText}
                  disabled={!text.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder le texte
                </Button>

                {/* Box de sauvegarde */}
                <AnimatePresence>
                  {showSaveBox && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                        <div className="flex space-x-2">
                          <Input
                            value={saveTextName}
                            onChange={(e) => setSaveTextName(e.target.value)}
                            placeholder="Nom du texte..."
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSaveText()
                            }
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            onClick={handleSaveText}
                            disabled={!saveTextName.trim() || isSavingText}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                          >
                            {isSavingText ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            {isSavingText ? "Sauvegarde..." : "Sauvegarder"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetSettings}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </CardContent>
            </Card>

            {/* Options */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clipboard className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">Récupération automatique</span>
                  </div>
                  <Switch
                    checked={settings.clipboardAutoRead}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings((prev) => ({
                        ...prev,
                        clipboardAutoRead: e.target.checked,
                      }))
                    }
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Récupère automatiquement le texte copié dans le presse-papiers
                </p>
              </CardContent>
            </Card>

            {/* Textes sauvegardés */}
            {savedTexts.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Textes sauvegardés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedTexts.map((savedText) => (
                      <div
                        key={savedText.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate dark:text-slate-200">
                            {savedText.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {savedText.updatedAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadText(savedText)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteText(savedText.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informations */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Web Speech API supportée</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{voices.length} voix disponibles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {voices.some((v) =>
                      /natural|online|neural/i.test(v.name)
                    ) ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                    <span>
                      {voices.some((v) => /natural|online|neural/i.test(v.name))
                        ? "Voix naturelles disponibles"
                        : "Voix standard uniquement"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {voices.some((v) => /^fr/i.test(v.lang)) ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                    <span>
                      {voices.some((v) => /^fr/i.test(v.lang))
                        ? "Voix françaises disponibles"
                        : "Aucune voix française"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Sauvegarde automatique</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Interface responsive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de confirmation pour la réinitialisation */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser tout</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir réinitialiser tous les paramètres, vider
              le texte actuel et effacer l'historique ? Cette action ne peut pas
              être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmReset}>
              Réinitialiser tout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
