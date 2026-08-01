"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
  ArrowRightLeft,
  BookOpen,
  Copy,
  Eye,
  Languages,
  Library,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Pause,
  Pencil,
  Settings,
  Trash2,
  Upload,
  Volume2,
  X } from "lucide-react";
import { TRANSLATION_LANGUAGES } from "@/lib/language-data";
import { cleanTextForTTS } from "@/lib/text-processing";
import { detectLanguage, translateText } from "@/lib/translation";
import {
  extractTextFromImage,
  importTextFile } from "@/lib/file-import";
import {
  DEFAULT_SETTINGS,
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
  formatDuration,
  pickDefaultVoice,
  useTtsPlayer,
  type SpeechOverrides } from "@/hooks/use-tts-player";
import { PlayerBar } from "@/components/text-to-speech/player-bar";
import { ReaderText } from "@/components/text-to-speech/reader-text";
import { SettingsPanel } from "@/components/text-to-speech/settings-panel";
import { ImportPanel } from "@/components/text-to-speech/import-panel";
import { LibraryPanel } from "@/components/text-to-speech/library-panel";

/** Évènement émis par le gestionnaire de lancement PWA (voir launch-handler). */
const LAUNCH_EVENT = "just-tools:launch";

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
  const [linkCopied, setLinkCopied] = useState(false);

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
        ? "La synthèse vocale n'est pas disponible dans ce navigateur"
        : "Erreur lors de la lecture"
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
  const handleCopyText = useCallback(() => {
    if (!text.trim()) return;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Texte copié"))
      .catch(() => toast.error("Impossible de copier le texte"));
  }, [text]);

  const handleClearText = useCallback(() => {
    if (!text.trim()) return;
    setText("");
    setOriginalText("");
    toast.success("Texte effacé");
  }, [setText, text]);

  const handleCopyLink = useCallback(() => {
    const cleaned = cleanTextForTTS(text);
    if (!cleaned) return;

    const url = buildTtsUrl(window.location.origin, {
      text: cleaned,
      autoplay: true,
      mini: readerMode,
      rate: overrides?.rate,
      voice: settings.selectedVoice || undefined,
    });

    navigator.clipboard
      .writeText(url)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        if (url.length > 8000) {
          toast.warning(
            "Lien copié, mais très long : certains navigateurs tronquent au-delà de ~8 000 caractères"
          );
        } else {
          toast.success("Lien de lecture automatique copié");
        }
      })
      .catch(() => toast.error("Impossible de copier le lien"));
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
      toast.error("Aucun texte à traduire");
      return;
    }

    setIsTranslating(true);
    try {
      let actualSource = sourceLanguage;

      if (sourceLanguage === "auto") {
        actualSource = await detectLanguage(text);
        toast.info(
          `Langue détectée : ${
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
      toast.error("Erreur lors de la traduction, service indisponible");
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
      toast.error("Veuillez nommer le texte");
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

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const activeVoiceName =
    overrides?.voice || settings.selectedVoice || "voix par défaut";
  const showReaderText = followMode && isActive && source.length > 0;

  const statusBadge = (
    <Badge
      variant={
        status === "playing"
          ? "default"
          : status === "paused"
          ? "secondary"
          : "outline"
      }
      className={status === "playing" ? "bg-emerald-500" : ""}
    >
      {status === "loading" ? (
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      ) : status === "playing" ? (
        <Mic className="mr-1 h-3 w-3" />
      ) : status === "paused" ? (
        <Pause className="mr-1 h-3 w-3" />
      ) : (
        <MicOff className="mr-1 h-3 w-3" />
      )}
      {status === "loading"
        ? "Préparation…"
        : status === "playing"
        ? "Lecture"
        : status === "paused"
        ? "En pause"
        : "Prêt"}
    </Badge>
  );

  const playerBar = (size: "default" | "large") => (
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
      size={size}
    />
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Barre d'état */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2">
        {statusBadge}

        <span className="text-sm text-muted-foreground">
          {characterCount} caractères • {wordCount} mots
          {totalChars > 0 && ` • ~${formatDuration(durationMs)}`}
        </span>

        <span className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <Volume2 className="h-3.5 w-3.5" />
          <span className="max-w-[220px] truncate">{activeVoiceName}</span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          {isActive && (
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
                <Pencil className="mr-1 h-4 w-4" />
              ) : (
                <Eye className="mr-1 h-4 w-4" />
              )}
              {followMode ? "Éditer" : "Suivre"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReaderMode((prev) => !prev)}
            title="Basculer entre l'outil complet et le lecteur épuré"
          >
            {readerMode ? (
              <Maximize2 className="mr-1 h-4 w-4" />
            ) : (
              <BookOpen className="mr-1 h-4 w-4" />
            )}
            {readerMode ? "Outil complet" : "Mode lecteur"}
          </Button>
        </div>
      </div>

      {readerMode ? (
        /* --- Mode lecteur épuré --- */
        <div className="flex min-h-0 flex-1 items-center justify-center p-4">
          <Card className="flex h-full w-full max-w-3xl flex-col gap-4 py-4">
            <CardContent className="flex min-h-0 flex-1 flex-col px-5">
              {source ? (
                <ReaderText
                  source={source}
                  position={position}
                  wordRange={wordRange}
                  onSeekChar={seekToChar}
                  className="min-h-0 flex-1 pr-2"
                  textClassName="text-lg leading-loose"
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <MicOff className="h-10 w-10" />
                  <p>Aucun texte à lire.</p>
                  <p className="max-w-sm text-xs">
                    Ce mode est conçu pour être ouvert avec un texte dans
                    l&apos;URL (
                    <code className="rounded bg-muted px-1">?text=…&amp;autoplay=1</code>
                    ).
                  </p>
                </div>
              )}
            </CardContent>
            <div className="px-5">{playerBar("large")}</div>
          </Card>
        </div>
      ) : (
        /* --- Outil complet, sans défilement de page sur grand écran --- */
        <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:overflow-hidden">
          <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Colonne texte + lecture */}
            <div className="flex min-h-[55vh] flex-col gap-3 lg:min-h-0">
              <Card className="flex min-h-0 flex-1 flex-col gap-3 py-4">
                <CardHeader className="px-4">
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
                    <span>{showReaderText ? "Lecture en cours" : "Texte à lire"}</span>
                    <span className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyText}
                        disabled={!text.trim()}
                      >
                        <Copy className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Copier</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearText}
                        disabled={!text.trim()}
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Effacer</span>
                      </Button>
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex min-h-0 flex-1 flex-col gap-2 px-4">
                  <div
                    className={`relative flex min-h-0 flex-1 flex-col rounded-lg border-2 border-dashed transition-colors ${
                      isDragOver
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-transparent"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setIsDragOver(false);
                    }}
                  >
                    {showReaderText ? (
                      <ReaderText
                        source={source}
                        position={position}
                        wordRange={wordRange}
                        onSeekChar={seekToChar}
                        className="min-h-0 flex-1 rounded-lg border bg-muted/30 p-3"
                      />
                    ) : (
                      <Textarea
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Entrez votre texte, glissez-déposez un fichier ou une image, ou utilisez l'onglet Import…"
                        className="min-h-0 flex-1 resize-none"
                      />
                    )}

                    {isDragOver && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-emerald-500/10 backdrop-blur-sm">
                        <div className="text-center">
                          <Upload className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
                          <p className="font-medium text-emerald-600 dark:text-emerald-400">
                            Déposez votre fichier
                          </p>
                          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                            Texte (.txt, .md, .csv, .json) ou image (OCR)
                          </p>
                        </div>
                      </div>
                    )}

                    {isImporting && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm">
                        <div className="text-center">
                          <Loader2 className="mx-auto mb-2 h-10 w-10 animate-spin text-emerald-500" />
                          <p className="text-sm font-medium">Import en cours…</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {originalText && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/20">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                          <Languages className="h-3 w-3" />
                          Texte original
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => setOriginalText("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="max-h-16 overflow-y-auto text-xs text-amber-700 dark:text-amber-300">
                        {originalText}
                      </div>
                    </div>
                  )}

                  {/* Traduction */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={sourceLanguage}
                      onValueChange={setSourceLanguage}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">🔍 Auto</SelectItem>
                        {TRANSLATION_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-1">
                              <span>{lang.flag}</span>
                              <span className="text-xs">
                                {lang.code.toUpperCase()}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        if (sourceLanguage === "auto") return;
                        setSourceLanguage(targetLanguage);
                        setTargetLanguage(sourceLanguage);
                      }}
                      disabled={sourceLanguage === "auto"}
                      title="Inverser les langues"
                    >
                      <ArrowRightLeft className="h-3 w-3" />
                    </Button>

                    <Select
                      value={targetLanguage}
                      onValueChange={setTargetLanguage}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSLATION_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-1">
                              <span>{lang.flag}</span>
                              <span className="text-xs">
                                {lang.code.toUpperCase()}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      className="h-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      onClick={handleTranslate}
                      disabled={!text.trim() || isTranslating}
                    >
                      {isTranslating ? (
                        <Loader2 className="h-3 w-3 animate-spin sm:mr-2" />
                      ) : (
                        <Languages className="h-3 w-3 sm:mr-2" />
                      )}
                      <span className="hidden sm:inline">Traduire</span>
                    </Button>

                    <span className="ml-auto hidden text-xs text-muted-foreground xl:block">
                      <kbd className="rounded bg-muted px-1.5 py-0.5">
                        Ctrl+Entrée
                      </kbd>{" "}
                      lire •{" "}
                      <kbd className="rounded bg-muted px-1.5 py-0.5">
                        Ctrl+Espace
                      </kbd>{" "}
                      pause •{" "}
                      <kbd className="rounded bg-muted px-1.5 py-0.5">
                        Ctrl+←/→
                      </kbd>{" "}
                      ±10 s
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shrink-0 py-3">
                <CardContent className="px-4">{playerBar("default")}</CardContent>
              </Card>
            </div>

            {/* Colonne panneaux */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex min-h-[50vh] flex-col lg:min-h-0"
            >
              <TabsList className="grid w-full shrink-0 grid-cols-3">
                <TabsTrigger value="settings">
                  <Settings className="mr-1 h-4 w-4" />
                  Réglages
                </TabsTrigger>
                <TabsTrigger value="import">
                  <Upload className="mr-1 h-4 w-4" />
                  Import
                </TabsTrigger>
                <TabsTrigger value="library">
                  <Library className="mr-1 h-4 w-4" />
                  Bibliothèque
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="settings"
                className="min-h-0 flex-1 overflow-y-auto rounded-lg border p-4"
              >
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                  voices={voices}
                  overrides={overrides}
                  onClearOverrides={() => setOverrides(undefined)}
                  onClearOverride={handleClearOverride}
                  onReset={() => setShowResetDialog(true)}
                  onCopyLink={handleCopyLink}
                  linkCopied={linkCopied}
                  canCopyLink={Boolean(text.trim())}
                />
              </TabsContent>

              <TabsContent
                value="import"
                className="min-h-0 flex-1 overflow-y-auto rounded-lg border p-4"
              >
                <ImportPanel
                  onText={setText}
                  onAppendText={(incoming) =>
                    setText((prev) =>
                      prev.trim() ? `${prev}\n\n${incoming}` : incoming
                    )
                  }
                />
              </TabsContent>

              <TabsContent
                value="library"
                className="min-h-0 flex-1 overflow-y-auto rounded-lg border p-4"
              >
                <LibraryPanel
                  savedTexts={savedTexts}
                  history={history}
                  canSave={Boolean(text.trim())}
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
        </div>
      )}

      {/* Lecture automatique refusée par le navigateur */}
      {blocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="mx-4 max-w-md py-5 text-center">
            <CardContent className="space-y-3 px-6">
              <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
              <h2 className="text-lg font-semibold">
                Le navigateur attend une interaction
              </h2>
              <p className="text-sm text-muted-foreground">
                Chromium refuse de démarrer une synthèse vocale sans geste de
                l&apos;utilisateur. Un clic — n&apos;importe où — suffit à lancer
                la lecture.
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <Button
                  onClick={retryBlocked}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Lancer la lecture
                </Button>
                <Button variant="outline" onClick={dismissBlocked}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser tout</DialogTitle>
            <DialogDescription>
              Réglages, texte courant et historique seront effacés. Les textes
              sauvegardés sont conservés. Cette action est irréversible.
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
