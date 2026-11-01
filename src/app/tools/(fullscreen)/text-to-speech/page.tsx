"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { CopyButton } from "@/components/site/copy-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import {
  ArrowRightLeft,
  BookOpen,
  ClipboardPaste,
  Eye,
  Languages,
  Loader2,
  Maximize2,
  Pause,
  Pencil,
  Play,
  Trash2,
  Upload,
  Volume2,
  X } from "lucide-react";
import { TRANSLATION_LANGUAGES } from "@/lib/language-data";
import { cleanTextForTTS } from "@/lib/text-processing";
import { detectLanguage, translateText } from "@/lib/translation";
import {
  extractTextFromImage,
  getClipboardText,
  importTextFile } from "@/lib/file-import";
import {
  DEFAULT_SETTINGS,
  SAMPLE_TEXTS,
  ttsHistoryAtom,
  ttsSavedTextsAtom,
  ttsSettingsAtom,
  ttsTextAtom,
  type SavedText } from "@/lib/tts-store";
import {
  buildTtsUrl,
  parseTtsParams,
  stripTtsParams,
  type TtsLaunchParams } from "@/lib/tts-params";
import {
  pickDefaultVoice,
  useTtsPlayer,
  type SpeechOverrides } from "@/hooks/use-tts-player";
import { PlayerBar } from "@/components/text-to-speech/player-bar";
import { ReaderText } from "@/components/text-to-speech/reader-text";
import { SettingsPanel } from "@/components/text-to-speech/settings-panel";
import { ImportPanel } from "@/components/text-to-speech/import-panel";
import { LibraryPanel } from "@/components/text-to-speech/library-panel";
import { cn } from "@/lib/utils";

/** Évènement émis par le gestionnaire de lancement PWA (voir launch-handler). */
const LAUNCH_EVENT = "just-tools:launch";

/** L'exemple de l'état vide : assez long pour entendre la voix. */
const ARRIVAL_SAMPLE = SAMPLE_TEXTS[1];

const PANEL_CLASS = "min-h-0 overflow-y-auto px-4 pb-4";

/** Les langues s'écrivent en toutes lettres : un drapeau emoji n'est pas un libellé. */
const LANGUAGE_ITEMS = TRANSLATION_LANGUAGES.map((lang) => (
  <SelectItem key={lang.code} value={lang.code}>
    {lang.nativeName ?? lang.name}
  </SelectItem>
));

const countOf = (count: number, noun: string) =>
  `${count.toLocaleString("fr-FR")} ${noun}${count > 1 ? "s" : ""}`;

export default function TextToSpeech() {
  const [settings, setSettings] = useAtom(ttsSettingsAtom);
  const [text, setText] = useAtom(ttsTextAtom);
  const [rawSavedTexts, setRawSavedTexts] = useAtom(ttsSavedTextsAtom);
  const [history, setHistory] = useAtom(ttsHistoryAtom);

  const [overrides, setOverrides] = useState<SpeechOverrides | undefined>();
  const [readerMode, setReaderMode] = useState(false);
  const [followMode, setFollowMode] = useState(true);
  const [pendingAutoplay, setPendingAutoplay] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");

  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const [showSaveBox, setShowSaveBox] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [originalText, setOriginalText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Le texte courant est lu par des effets asynchrones (lecture automatique,
  // historique) : une ref évite de les relancer à chaque frappe.
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const savedTexts = useMemo(
    () =>
      rawSavedTexts.map((item) => ({
        ...item,
        updatedAt: new Date(item.updatedAt),
      })),
    [rawSavedTexts]
  );

  const handleStart = useCallback(
    (spoken: string) => {
      const entry = textRef.current.trim() || spoken;
      setHistory((prev) =>
        [entry, ...prev.filter((item) => item !== entry)].slice(0, 20)
      );
    },
    [setHistory]
  );

  const handleError = useCallback((error: string) => {
    console.error("Erreur de synthèse vocale:", error);
    toast.error(
      error === "unsupported"
        ? "Ton navigateur ne propose pas la synthèse vocale. Essaie avec Edge ou Chrome."
        : "La lecture a échoué. Relance-la ou choisis une autre voix."
    );
  }, []);

  const player = useTtsPlayer({
    settings,
    overrides,
    onStart: handleStart,
    onError: handleError,
  });

  const {
    voices,
    voicesReady,
    status,
    source,
    position,
    totalChars,
    wordRange,
    blocked,
    isActive,
    charsPerSecond,
    currentTimeMs,
    durationMs,
    setSource,
    play,
    playText,
    pause,
    stop,
    seekToChar,
    skipSeconds,
    retryBlocked,
    dismissBlocked,
  } = player;

  // Le lecteur travaille sur le texte nettoyé (retours à la ligne aplatis).
  useEffect(() => {
    setSource(cleanTextForTTS(text));
  }, [setSource, text]);

  // Voix par défaut au premier chargement.
  useEffect(() => {
    if (settings.selectedVoice || voices.length === 0) return;
    const preferred = pickDefaultVoice(voices);
    if (preferred) {
      setSettings((prev) => ({ ...prev, selectedVoice: preferred.name }));
    }
  }, [settings.selectedVoice, setSettings, voices]);

  // --- Paramètres d'URL / lancement PWA -----------------------------------
  const applyLaunchParams = useCallback(
    (search: string) => {
      const params: TtsLaunchParams = parseTtsParams(search);
      if (!params.hasAny) return;

      if (params.text) {
        const incoming = params.text;
        setText((prev) =>
          params.append && prev.trim() ? `${prev}\n\n${incoming}` : incoming
        );
      }

      const nextOverrides: SpeechOverrides = {};
      if (params.rate !== undefined) nextOverrides.rate = params.rate;
      if (params.pitch !== undefined) nextOverrides.pitch = params.pitch;
      if (params.volume !== undefined) nextOverrides.volume = params.volume;
      if (params.voice) nextOverrides.voice = params.voice;
      if (params.lang) nextOverrides.lang = params.lang;

      setOverrides(
        Object.keys(nextOverrides).length > 0 ? nextOverrides : undefined
      );

      if (params.mini) setReaderMode(true);
      if (params.autoplay) setPendingAutoplay(true);
    },
    [setText]
  );

  const appliedRef = useRef(false);

  useEffect(() => {
    // En mode strict React, les effets sont joués deux fois en développement :
    // sans ce garde, un `append` dupliquerait le texte.
    if (!appliedRef.current) {
      appliedRef.current = true;
      applyLaunchParams(window.location.search);

      // Nettoyer l'URL : un rafraîchissement ne doit pas relire un texte périmé.
      const cleaned = stripTtsParams(window.location.search);
      if (cleaned !== window.location.search) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${cleaned}${window.location.hash}`
        );
      }
    }

    const handleLaunch = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === "string") applyLaunchParams(detail);
    };

    window.addEventListener(LAUNCH_EVENT, handleLaunch);
    return () => window.removeEventListener(LAUNCH_EVENT, handleLaunch);
  }, [applyLaunchParams]);

  // Lecture automatique : attendre que les voix soient connues.
  useEffect(() => {
    if (!pendingAutoplay || !voicesReady) return;

    const cleaned = cleanTextForTTS(textRef.current);
    setPendingAutoplay(false);

    if (!cleaned) {
      toast.warning("Aucun texte à lire n'a été transmis");
      return;
    }

    playText(cleaned);
  }, [pendingAutoplay, playText, voicesReady]);

  // Récupération automatique du presse-papiers sur copier/coller dans la page.
  useEffect(() => {
    if (!settings.clipboardAutoRead) return;

    const handler = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.trim()) setText(clipboardText);
      } catch {
        // Permission refusée : rien à faire, l'utilisateur peut coller à la main.
      }
    };

    document.addEventListener("copy", handler);
    document.addEventListener("paste", handler);

    return () => {
      document.removeEventListener("copy", handler);
      document.removeEventListener("paste", handler);
    };
  }, [settings.clipboardAutoRead, setText]);

  // --- Actions -------------------------------------------------------------
  const handleClearText = useCallback(() => {
    if (!text.trim()) return;
    setText("");
    setOriginalText("");
    toast.success("Texte effacé");
  }, [setText, text]);

  const handlePaste = useCallback(async () => {
    try {
      await getClipboardText(setText);
    } catch (error) {
      // `getClipboardText` a déjà prévenu l'utilisateur.
      console.error("Erreur clipboard:", error);
    }
  }, [setText]);

  /** Le clic vaut geste utilisateur : la lecture part sans être bloquée. */
  const handlePlaySample = useCallback(() => {
    setText(ARRIVAL_SAMPLE.content);
    playText(cleanTextForTTS(ARRIVAL_SAMPLE.content));
  }, [playText, setText]);

  const getShareLink = useCallback(() => {
    const url = buildTtsUrl(window.location.origin, {
      text: cleanTextForTTS(text),
      autoplay: true,
      mini: readerMode,
      rate: overrides?.rate,
      voice: settings.selectedVoice || undefined,
    });

    if (url.length > 8000) {
      toast.warning(
        "Ce lien est très long : certains navigateurs le tronquent au-delà de 8 000 caractères."
      );
    }

    return url;
  }, [overrides?.rate, readerMode, settings.selectedVoice, text]);

  /**
   * Toucher un réglage lève la surcharge d'URL correspondante, sinon le
   * curseur semblerait bloqué sur la valeur imposée.
   */
  const handleClearOverride = useCallback(
    (keys: (keyof SpeechOverrides)[]) => {
      setOverrides((prev) => {
        if (!prev) return prev;

        const next = { ...prev };
        keys.forEach((key) => delete next[key]);

        return Object.keys(next).length > 0 ? next : undefined;
      });
    },
    []
  );

  const handleTranslate = useCallback(async () => {
    if (!text.trim()) {
      toast.error("Écris d'abord un texte à traduire.");
      return;
    }

    setIsTranslating(true);
    try {
      let actualSource = sourceLanguage;

      if (sourceLanguage === "auto") {
        actualSource = await detectLanguage(text);
        toast.info(
          `Langue détectée : ${
            TRANSLATION_LANGUAGES.find((item) => item.code === actualSource)
              ?.name || actualSource
          }`
        );
      }

      const translated = await translateText(text, actualSource, targetLanguage);

      if (translated && translated !== text) {
        setOriginalText(text);
        setText(translated);
        toast.success("Texte traduit");
      } else {
        toast.warning("Le texte semble déjà dans la langue cible");
      }
    } catch (error) {
      console.error("Erreur de traduction:", error);
      toast.error("Le service de traduction ne répond pas. Réessaie dans un instant.");
    } finally {
      setIsTranslating(false);
    }
  }, [setText, sourceLanguage, targetLanguage, text]);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      const file = event.dataTransfer.files[0];
      if (!file) return;

      setIsImporting(true);
      try {
        if (file.type.startsWith("image/")) {
          await extractTextFromImage(file, setText);
        } else {
          await importTextFile(file, setText);
        }
      } catch (error) {
        console.error("Erreur lors du dépôt du fichier:", error);
      } finally {
        setIsImporting(false);
      }
    },
    [setText]
  );

  const handleConfirmSave = useCallback(() => {
    if (!saveName.trim()) {
      toast.error("Donne un nom à ce texte.");
      return;
    }

    setIsSaving(true);
    try {
      const entry: SavedText = {
        id: Date.now().toString(),
        name: saveName.trim(),
        content: text,
        updatedAt: new Date(),
      };
      setRawSavedTexts((prev) => [entry, ...prev]);
      setShowSaveBox(false);
      setSaveName("");
      toast.success("Texte sauvegardé");
    } finally {
      setIsSaving(false);
    }
  }, [saveName, setRawSavedTexts, text]);

  const handleConfirmReset = useCallback(() => {
    stop();
    setSettings({
      selectedVoice: "",
      rate: DEFAULT_SETTINGS.rate,
      pitch: DEFAULT_SETTINGS.pitch,
      volume: DEFAULT_SETTINGS.volume,
      clipboardAutoRead: false,
    });
    setText("");
    setHistory([]);
    setOverrides(undefined);
    setOriginalText("");
    setShowResetDialog(false);
    toast.success("Tout a été réinitialisé");
  }, [setHistory, setSettings, setText, stop]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;

      switch (event.key) {
        case "Enter":
          event.preventDefault();
          play();
          break;
        case " ":
          event.preventDefault();
          if (status === "playing" || status === "loading") pause();
          else play();
          break;
        case "Escape":
          event.preventDefault();
          stop();
          break;
        case "ArrowLeft":
          event.preventDefault();
          skipSeconds(-10);
          break;
        case "ArrowRight":
          event.preventDefault();
          skipSeconds(10);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pause, play, skipSeconds, status, stop]);

  const hasText = Boolean(text.trim());
  const characterCount = countOf(text.length, "caractère");
  const wordCount = countOf(
    hasText ? text.trim().split(/\s+/).length : 0,
    "mot"
  );
  const showReaderText = followMode && isActive && source.length > 0;

  return (
    // Les colonnes suivent la place réelle de l'outil, pas celle de la fenêtre :
    // le rail en prend 256 px, ou 64 une fois réduit.
    <div className="@container relative flex h-full min-w-0 flex-col overflow-hidden">
      {/* La même barre dans les deux modes : le bouton de bascule ne bouge pas.
          Le mode lecteur n'y garde que lui. */}
      <div
        className={cn(
          "flex h-12 shrink-0 items-center gap-2 px-3 @2xl:px-4",
          !readerMode && "border-border border-b"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {!readerMode && isActive && (
            <Badge variant={status === "playing" ? "success" : "secondary"}>
              {status === "loading" ? (
                <Loader2 className="asc-animate-spin" aria-hidden="true" />
              ) : status === "playing" ? (
                <Volume2 aria-hidden="true" />
              ) : (
                <Pause aria-hidden="true" />
              )}
              {status === "loading"
                ? "Préparation…"
                : status === "playing"
                ? "Lecture"
                : "En pause"}
            </Badge>
          )}

          {!readerMode && hasText && (
            <span
              className="text-fg-muted min-w-0 truncate text-[0.8125rem] tabular-nums"
              title={`${characterCount}, ${wordCount}`}
            >
              <span className="@max-md:hidden">{characterCount}, </span>
              {wordCount}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!readerMode && isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFollowMode((prev) => !prev)}
              title={
                followMode
                  ? "Revenir à l'édition du texte"
                  : "Suivre la lecture mot à mot"
              }
            >
              {followMode ? (
                <Pencil aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
              <span className="@max-md:sr-only">
                {followMode ? "Éditer" : "Suivre"}
              </span>
            </Button>
          )}

          {!readerMode && hasText && (
            <>
              <CopyButton
                value={text}
                iconOnly
                variant="ghost"
                size="icon-sm"
                label="Copier le texte"
                copiedLabel="Texte copié"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleClearText}
                aria-label="Effacer le texte"
                title="Effacer le texte"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReaderMode((prev) => !prev)}
            title="Basculer entre l'outil complet et le lecteur épuré"
          >
            {readerMode ? (
              <Maximize2 aria-hidden="true" />
            ) : (
              <BookOpen aria-hidden="true" />
            )}
            <span className="@max-md:sr-only">
              {readerMode ? "Outil complet" : "Mode lecteur"}
            </span>
          </Button>
        </div>
      </div>

      {readerMode ? (
        /* --- Mode lecteur épuré --- */
        source ? (
          <ReaderText
            source={source}
            position={position}
            wordRange={wordRange}
            onSeekChar={seekToChar}
            className="min-h-0 flex-1 px-4 pb-6"
            textClassName="mx-auto max-w-2xl text-lg leading-loose @2xl:text-xl"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            <div className="mx-auto flex h-full max-w-2xl flex-col items-start justify-center gap-3">
              <p className="text-fg text-lg font-semibold">Aucun texte à lire</p>
              <p className="text-fg-muted text-sm leading-relaxed">
                Écris-en un dans l&apos;outil complet, ou ouvre ce mode avec le
                texte dans l&apos;adresse&nbsp;:{" "}
                <code className="bg-surface rounded-xs px-1 font-mono text-xs break-all">
                  ?text=…&amp;autoplay=1&amp;mini=1
                </code>
              </p>
              <Button variant="secondary" onClick={() => setReaderMode(false)}>
                Écrire un texte
              </Button>
            </div>
          </div>
        )
      ) : (
        /* --- Outil complet : une seule colonne qui défile tant que la place
           manque, puis deux colonnes qui défilent chacune de leur côté --- */
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-x-hidden overflow-y-auto @4xl:grid-cols-[minmax(0,1fr)_22rem] @4xl:grid-rows-[minmax(0,1fr)] @4xl:overflow-hidden">
          <div
            className="relative flex min-h-[50dvh] min-w-0 flex-col @4xl:min-h-0"
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              // Passer d'un enfant à l'autre déclenche aussi cet évènement.
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsDragOver(false);
              }
            }}
          >
            {showReaderText ? (
              <ReaderText
                source={source}
                position={position}
                wordRange={wordRange}
                onSeekChar={seekToChar}
                className="asc-animate-fade min-h-0 flex-1 p-4"
              />
            ) : (
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                aria-label="Texte à lire"
                placeholder="Écris ou colle ton texte ici. Tu peux aussi y déposer un fichier ou une image."
                // Même rythme que `ReaderText` : passer de l'édition au suivi ne
                // décale pas le texte. `leading` après `text-base`, que
                // tailwind-merge retirerait sinon.
                className="field-sizing-fixed min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent p-4 text-base leading-relaxed focus-visible:shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--asc-primary)_16%,transparent)]"
              />
            )}

            {originalText && (
              <div className="border-border bg-surface flex min-w-0 shrink-0 items-start gap-2 border-t py-2 ps-4 pe-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-fg-muted text-xs font-medium">
                    Texte original
                  </p>
                  <p className="text-fg-muted max-h-20 overflow-y-auto text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {originalText}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOriginalText("")}
                  aria-label="Masquer le texte original"
                  title="Masquer le texte original"
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
            )}

            {hasText ? (
              <div className="border-border flex min-w-0 shrink-0 items-center gap-2 border-t px-3 py-2">
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger
                    size="sm"
                    aria-label="Langue du texte"
                    className="min-w-0 flex-1 @2xl:max-w-44"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Détecter</SelectItem>
                    {LANGUAGE_ITEMS}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    if (sourceLanguage === "auto") return;
                    setSourceLanguage(targetLanguage);
                    setTargetLanguage(sourceLanguage);
                  }}
                  disabled={sourceLanguage === "auto"}
                  aria-label="Inverser les langues"
                  title="Inverser les langues"
                >
                  <ArrowRightLeft aria-hidden="true" />
                </Button>

                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger
                    size="sm"
                    aria-label="Langue de traduction"
                    className="min-w-0 flex-1 @2xl:max-w-44"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>{LANGUAGE_ITEMS}</SelectContent>
                </Select>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  {isTranslating ? (
                    <Loader2 className="asc-animate-spin" aria-hidden="true" />
                  ) : (
                    <Languages aria-hidden="true" />
                  )}
                  <span className="@max-md:sr-only">Traduire</span>
                </Button>
              </div>
            ) : (
              <div className="border-border flex min-w-0 shrink-0 flex-wrap items-center gap-2 border-t px-3 py-2">
                <Button variant="secondary" size="sm" onClick={handlePaste}>
                  <ClipboardPaste aria-hidden="true" />
                  Coller
                </Button>
                <Button variant="ghost" size="sm" onClick={handlePlaySample}>
                  <Play aria-hidden="true" />
                  Écouter un exemple
                </Button>
              </div>
            )}

            {isDragOver && (
              <div className="asc-animate-fade border-primary bg-primary-soft text-primary-soft-fg rounded-card pointer-events-none absolute inset-2 flex flex-col items-center justify-center gap-1 border-2 border-dashed p-4 text-center">
                <Upload size={16} aria-hidden="true" />
                <p className="text-sm font-semibold">Dépose ton fichier ici</p>
                <p className="text-xs">
                  Texte (.txt, .md, .csv, .json) ou image à lire par OCR
                </p>
              </div>
            )}

            {isImporting && (
              <div className="asc-animate-fade bg-bg/90 text-fg absolute inset-0 flex items-center justify-center gap-2 p-4">
                <Loader2
                  size={16}
                  className="asc-animate-spin"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">Import en cours…</p>
              </div>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="border-border min-h-0 min-w-0 gap-0 border-t @4xl:border-s @4xl:border-t-0"
          >
            <div className="shrink-0 p-3">
              <TabsList className="w-full">
                <TabsTrigger value="settings">Réglages</TabsTrigger>
                <TabsTrigger value="import">Import</TabsTrigger>
                <TabsTrigger value="library">Bibliothèque</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="settings" className={PANEL_CLASS}>
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                voices={voices}
                overrides={overrides}
                onClearOverrides={() => setOverrides(undefined)}
                onClearOverride={handleClearOverride}
                onReset={() => setShowResetDialog(true)}
                getShareLink={getShareLink}
                canCopyLink={hasText}
              />
            </TabsContent>

            <TabsContent value="import" className={PANEL_CLASS}>
              <ImportPanel
                onText={setText}
                onAppendText={(incoming) =>
                  setText((prev) =>
                    prev.trim() ? `${prev}\n\n${incoming}` : incoming
                  )
                }
              />
            </TabsContent>

            <TabsContent value="library" className={PANEL_CLASS}>
              <LibraryPanel
                savedTexts={savedTexts}
                history={history}
                canSave={hasText}
                showSaveBox={showSaveBox}
                saveName={saveName}
                isSaving={isSaving}
                onSaveNameChange={setSaveName}
                onRequestSave={() => {
                  setSaveName("");
                  setShowSaveBox((prev) => !prev);
                }}
                onConfirmSave={handleConfirmSave}
                onLoad={(content) => {
                  setText(content);
                  toast.success("Texte chargé");
                }}
                onDelete={(id) => {
                  setRawSavedTexts((prev) =>
                    prev.filter((item) => item.id !== id)
                  );
                  toast.success("Texte supprimé");
                }}
                onClearHistory={() => {
                  setHistory([]);
                  toast.success("Historique vidé");
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Le lecteur reste à portée quel que soit l'endroit où l'on a défilé. */}
      <div className="border-border shrink-0 border-t px-4 py-3">
        <div className={cn("min-w-0", readerMode && "mx-auto max-w-2xl")}>
          <PlayerBar
            status={status}
            position={position}
            totalChars={totalChars}
            currentTimeMs={currentTimeMs}
            durationMs={durationMs}
            charsPerSecond={charsPerSecond}
            onPlay={play}
            onPause={pause}
            onStop={stop}
            onSeekChar={seekToChar}
            onSkip={skipSeconds}
            size={readerMode ? "large" : "default"}
          />
        </div>
      </div>

      {/* Lecture automatique refusée par le navigateur */}
      {blocked && (
        <div className="asc-animate-fade bg-overlay absolute inset-0 z-(--z-overlay) flex items-center justify-center p-4">
          <Card
            data-tts-unblock-prompt className="asc-animate-rise shadow-card max-h-full w-full max-w-md gap-3 overflow-y-auto p-6">
            <h2 className="text-fg text-lg leading-snug font-semibold">
              Ton navigateur attend un geste de ta part
            </h2>
            <p className="text-fg-muted text-sm leading-relaxed">
              Il refuse de démarrer une synthèse vocale sans interaction. Un clic
              n&apos;importe où suffit à lancer la lecture.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={retryBlocked}>
                <Play aria-hidden="true" />
                Lancer la lecture
              </Button>
              <Button variant="outline" onClick={dismissBlocked}>
                Annuler
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tout réinitialiser&nbsp;?</DialogTitle>
            <DialogDescription>
              Tes réglages, le texte courant et l&apos;historique seront effacés.
              Tes textes sauvegardés sont conservés. Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmReset}>
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
