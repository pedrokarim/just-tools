"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TtsSettings } from "@/lib/tts-store";

/**
 * Lecteur de synthèse vocale à position contrôlable.
 *
 * La Web Speech API ne propose ni seek, ni durée, et `speechSynthesis.pause()`
 * est ignoré par Chromium sur les voix distantes (les voix « Natural » d'Edge).
 * Ce lecteur contourne les trois limites :
 *
 * - le texte est découpé en segments (phrases, puis coupures douces) ;
 * - la position courante est un index de caractère, alimenté par les
 *   évènements `boundary` et interpolée entre deux évènements ;
 * - pause / reprise / seek = `cancel()` puis relecture depuis l'offset voulu,
 *   ce qui fonctionne de façon identique sur toutes les voix ;
 * - la durée est estimée en caractères/seconde, puis affinée pendant la
 *   lecture réelle (elle est donc approchée, jamais annoncée comme exacte).
 */

export type PlayerStatus = "idle" | "loading" | "playing" | "paused";

export interface SpeechOverrides {
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Nom exact ou partiel d'une voix. */
  voice?: string;
  /** Code de langue (« fr », « fr-FR »…). */
  lang?: string;
}

export interface Segment {
  start: number;
  end: number;
}

/** Débit de référence (français, vitesse 1) servant d'estimation initiale. */
const BASE_CHARS_PER_SECOND = 14.5;
const MAX_SEGMENT_LENGTH = 240;
const MIN_CHARS_PER_SECOND = 4;
const MAX_CHARS_PER_SECOND = 60;
/** Délai au-delà duquel une lecture qui n'a pas démarré est jugée bloquée. */
const BLOCKED_GUARD_MS = 1200;
const TICK_MS = 100;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const hasSpeakableContent = (text: string) => /[\p{L}\p{N}]/u.test(text);

function pushSegment(
  out: Segment[],
  text: string,
  start: number,
  end: number,
  maxLength: number
) {
  let cursor = start;

  while (end - cursor > maxLength) {
    const window = text.slice(cursor, cursor + maxLength);

    // Couper en priorité sur une ponctuation faible, sinon sur un espace.
    let breakAt = Math.max(
      window.lastIndexOf(", "),
      window.lastIndexOf("; "),
      window.lastIndexOf(" : "),
      window.lastIndexOf(" — "),
      window.lastIndexOf(" – ")
    );

    if (breakAt < maxLength * 0.4) breakAt = window.lastIndexOf(" ");
    if (breakAt <= 0) breakAt = maxLength;
    else breakAt += 1;

    out.push({ start: cursor, end: cursor + breakAt });
    cursor += breakAt;
  }

  if (end > cursor) out.push({ start: cursor, end });
}

/** Découpe le texte en segments prononçables, offsets absolus conservés. */
export function splitIntoSegments(
  text: string,
  maxLength = MAX_SEGMENT_LENGTH
): Segment[] {
  const segments: Segment[] = [];
  const sentenceEnd = /([.!?…]+["'»)\]]*)(\s+)|\n+/g;

  let start = 0;
  let match: RegExpExecArray | null;

  while ((match = sentenceEnd.exec(text)) !== null) {
    const end = match.index + match[0].length;
    if (end > start) {
      pushSegment(segments, text, start, end, maxLength);
      start = end;
    }
  }

  if (start < text.length) {
    pushSegment(segments, text, start, text.length, maxLength);
  }

  return segments;
}

/**
 * Choisit la meilleure voix pour un nom et/ou une langue.
 * Priorité : nom exact > nom partiel > langue exacte > langue + voix naturelle
 * > langue seule.
 */
export function resolveVoice(
  voices: SpeechSynthesisVoice[],
  criteria: { voice?: string; lang?: string }
): SpeechSynthesisVoice | undefined {
  const { voice, lang } = criteria;

  if (voice) {
    const needle = voice.toLowerCase();
    const exact = voices.find((v) => v.name.toLowerCase() === needle);
    if (exact) return exact;

    const partial = voices.find((v) => v.name.toLowerCase().includes(needle));
    if (partial) return partial;
  }

  if (lang) {
    const needle = lang.toLowerCase();
    const prefix = needle.split("-")[0];

    return (
      voices.find((v) => v.lang.toLowerCase() === needle) ??
      voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(prefix) &&
          /natural|online|neural/i.test(v.name)
      ) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
    );
  }

  return undefined;
}

/** Voix par défaut : français naturel > français > voix naturelle > première. */
export function pickDefaultVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  return (
    voices.find(
      (v) => /^fr/i.test(v.lang) && /natural|online|neural/i.test(v.name)
    ) ??
    voices.find((v) => /^fr/i.test(v.lang)) ??
    voices.find((v) => /natural|online|neural/i.test(v.name)) ??
    voices[0]
  );
}

/** Formate une durée en mm:ss (ou h:mm:ss au-delà d'une heure). */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";

  const total = Math.round(ms / 1000);
  const seconds = total % 60;
  const minutes = Math.floor(total / 60) % 60;
  const hours = Math.floor(total / 3600);

  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

interface UseTtsPlayerOptions {
  settings: TtsSettings;
  /** Surcharges éventuelles issues de l'URL (session uniquement). */
  overrides?: SpeechOverrides;
  /** Appelé quand la lecture démarre réellement (alimente l'historique). */
  onStart?: (text: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  /** Appelé quand le navigateur refuse la lecture faute d'interaction. */
  onBlocked?: () => void;
}

export function useTtsPlayer({
  settings,
  overrides,
  onStart,
  onEnd,
  onError,
  onBlocked,
}: UseTtsPlayerOptions) {
  const speechAvailable =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // Sans Web Speech API, rien n'est à attendre : la lecture automatique doit
  // pouvoir échouer tout de suite plutôt que de rester en suspens.
  const [voicesReady, setVoicesReady] = useState(!speechAvailable);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [source, setSourceState] = useState("");
  const [position, setPosition] = useState(0);
  const [wordRange, setWordRange] = useState<{ start: number; length: number } | null>(
    null
  );
  const [charsPerSecond, setCharsPerSecond] = useState(BASE_CHARS_PER_SECOND);
  /** Lecture refusée par la politique d'autoplay : une interaction est requise. */
  const [blocked, setBlocked] = useState(false);

  const sourceRef = useRef("");
  const segmentsRef = useRef<Segment[]>([]);
  /** Position de reprise (début du mot courant lors d'une pause). */
  const cursorRef = useRef(0);
  const positionRef = useRef(0);
  /** Fin du segment en cours de lecture : borne l'interpolation. */
  const chunkEndRef = useRef(0);
  /** Ancre d'interpolation : dernière position connue et son horodatage. */
  const anchorRef = useRef<{ char: number; at: number } | null>(null);
  /** Mesure du débit réel : position et instant du début de la lecture. */
  const measureRef = useRef<{ char: number; at: number } | null>(null);
  const cpsRef = useRef(BASE_CHARS_PER_SECOND);
  const cpsRateRef = useRef(1);
  /**
   * Génération courante : incrémentée à chaque pause / arrêt / seek, ce qui
   * neutralise les évènements des utterances annulées (ils arrivent en différé).
   */
  const generationRef = useRef(0);
  const guardRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);
  const pendingRef = useRef<number | null>(null);
  const startFromRef = useRef<(from: number) => void>(() => {});

  // Les valeurs changeantes sont recopiées dans des refs pour que les
  // gestionnaires d'évènements des utterances (créés une fois par segment)
  // voient toujours l'état courant sans reconstruire `startFrom`.
  const callbacksRef = useRef({ onStart, onEnd, onError, onBlocked });
  const settingsRef = useRef(settings);
  const overridesRef = useRef(overrides);
  const voicesRef = useRef<SpeechSynthesisVoice[]>(voices);

  useEffect(() => {
    callbacksRef.current = { onStart, onEnd, onError, onBlocked };
  }, [onStart, onEnd, onError, onBlocked]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    overridesRef.current = overrides;
  }, [overrides]);

  useEffect(() => {
    voicesRef.current = voices;
  }, [voices]);

  const effectiveRate = overrides?.rate ?? settings.rate;

  // --- Chargement des voix -------------------------------------------------
  // Edge/Chrome peuplent la liste de façon asynchrone et n'émettent pas
  // toujours `voiceschanged` : on complète par quelques relances.
  useEffect(() => {
    if (!speechAvailable) return;

    let attempts = 0;
    let interval: ReturnType<typeof setInterval> | null = null;

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const load = () => {
      const available = speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        setVoicesReady(true);
        stopPolling();
      }
    };

    speechSynthesis.addEventListener("voiceschanged", load);
    load();

    if (speechSynthesis.getVoices().length === 0) {
      interval = setInterval(() => {
        attempts += 1;
        load();
        // Au bout de ~2,5 s la liste est considérée comme définitive, même
        // vide, pour ne pas retarder indéfiniment une lecture automatique.
        if (attempts >= 10) {
          stopPolling();
          setVoicesReady(true);
        }
      }, 250);
    }

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", load);
      stopPolling();
    };
  }, [speechAvailable]);

  // Le débit de référence suit la vitesse demandée.
  useEffect(() => {
    if (cpsRateRef.current !== effectiveRate) {
      cpsRateRef.current = effectiveRate;
      cpsRef.current = BASE_CHARS_PER_SECOND * effectiveRate;
      setCharsPerSecond(cpsRef.current);
    }
  }, [effectiveRate]);

  const clearGuard = useCallback(() => {
    if (guardRef.current) {
      clearTimeout(guardRef.current);
      guardRef.current = null;
    }
  }, []);

  /** Neutralise les évènements en vol et vide la file de synthèse. */
  const abortCurrent = useCallback(() => {
    generationRef.current += 1;
    clearGuard();
    anchorRef.current = null;
    measureRef.current = null;
    startedRef.current = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  }, [clearGuard]);

  const applyPosition = useCallback((char: number, word?: number) => {
    positionRef.current = char;
    setPosition(char);
    if (word !== undefined && word > 0) {
      setWordRange({ start: Math.floor(char), length: word });
    }
  }, []);

  const startFrom = useCallback(
    (from: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        callbacksRef.current.onError?.("unsupported");
        return;
      }

      const text = sourceRef.current;
      const segments = segmentsRef.current;

      if (!text || segments.length === 0) return;

      let cursor = clamp(from, 0, text.length);
      let index = segments.findIndex((segment) => cursor < segment.end);

      // Sauter les segments sans contenu prononçable (espaces, ponctuation).
      while (
        index >= 0 &&
        index < segments.length &&
        !hasSpeakableContent(
          text.slice(Math.max(cursor, segments[index].start), segments[index].end)
        )
      ) {
        cursor = segments[index].end;
        index += 1;
      }

      if (index < 0 || index >= segments.length) {
        // Plus rien à lire : fin de parcours.
        cursorRef.current = text.length;
        applyPosition(text.length);
        setWordRange(null);
        setStatus("idle");
        callbacksRef.current.onEnd?.();
        return;
      }

      const segment = segments[index];
      const sliceStart = Math.max(cursor, segment.start);
      const chunk = text.slice(sliceStart, segment.end);

      const generation = generationRef.current;
      const current = settingsRef.current;
      const active = overridesRef.current;
      const list = voicesRef.current;

      const utterance = new SpeechSynthesisUtterance(chunk);

      // Ordre : surcharge d'URL, puis voix enregistrée, puis meilleure voix
      // disponible. Ce dernier repli compte : lors d'une toute première visite
      // avec lecture automatique, `selectedVoice` n'est pas encore écrit.
      const voice =
        resolveVoice(list, { voice: active?.voice, lang: active?.lang }) ??
        (active?.voice || active?.lang
          ? undefined
          : resolveVoice(list, { voice: current.selectedVoice }) ??
            pickDefaultVoice(list));

      if (voice) utterance.voice = voice;
      if (active?.lang) utterance.lang = active.lang;

      utterance.rate = active?.rate ?? current.rate;
      utterance.pitch = active?.pitch ?? current.pitch;
      utterance.volume = active?.volume ?? current.volume;

      cursorRef.current = sliceStart;
      chunkEndRef.current = segment.end;
      startedRef.current = false;
      applyPosition(sliceStart);

      const isFirstChunk = sliceStart === 0;

      utterance.onstart = () => {
        if (generation !== generationRef.current) return;

        startedRef.current = true;
        clearGuard();
        pendingRef.current = null;
        setBlocked(false);
        setStatus("playing");

        const now = performance.now();
        anchorRef.current = { char: sliceStart, at: now };
        if (!measureRef.current) {
          measureRef.current = { char: sliceStart, at: now };
        }

        if (isFirstChunk) {
          callbacksRef.current.onStart?.(text);
        }
      };

      utterance.onboundary = (event) => {
        if (generation !== generationRef.current) return;

        const absolute = sliceStart + event.charIndex;
        if (absolute < positionRef.current) return;

        anchorRef.current = { char: absolute, at: performance.now() };
        applyPosition(absolute, event.charLength);

        // Affiner le débit réel une fois la mesure suffisamment longue.
        const measure = measureRef.current;
        if (measure) {
          const elapsed = (performance.now() - measure.at) / 1000;
          const done = absolute - measure.char;
          if (elapsed > 1.5 && done > 40) {
            const measured = done / elapsed;
            const next = clamp(
              cpsRef.current * 0.7 + measured * 0.3,
              MIN_CHARS_PER_SECOND,
              MAX_CHARS_PER_SECOND
            );
            cpsRef.current = next;
            setCharsPerSecond(next);
          }
        }
      };

      utterance.onend = () => {
        if (generation !== generationRef.current) return;

        clearGuard();
        cursorRef.current = segment.end;
        applyPosition(segment.end);

        if (segment.end >= text.length) {
          setWordRange(null);
          setStatus("idle");
          callbacksRef.current.onEnd?.();
          return;
        }

        startFromRef.current(segment.end);
      };

      utterance.onerror = (event) => {
        if (generation !== generationRef.current) return;

        clearGuard();

        // Conséquence normale d'un arrêt volontaire.
        if (event.error === "interrupted" || event.error === "canceled") return;

        if (event.error === "not-allowed") {
          pendingRef.current = sliceStart;
          setStatus("idle");
          setBlocked(true);
          callbacksRef.current.onBlocked?.();
          return;
        }

        setStatus("idle");
        callbacksRef.current.onError?.(event.error);
      };

      setStatus("loading");
      speechSynthesis.speak(utterance);

      // Filet de sécurité : certains Chromium ne signalent pas le refus par une
      // erreur, la lecture ne démarre simplement jamais.
      guardRef.current = setTimeout(() => {
        if (generation !== generationRef.current) return;
        if (
          !startedRef.current &&
          !speechSynthesis.speaking &&
          !speechSynthesis.pending
        ) {
          pendingRef.current = sliceStart;
          setStatus("idle");
          setBlocked(true);
          callbacksRef.current.onBlocked?.();
        }
      }, BLOCKED_GUARD_MS);
    },
    [applyPosition, clearGuard]
  );

  // `startFrom` s'appelle récursivement (segment suivant) : la ref casse le
  // cycle de dépendances.
  useEffect(() => {
    startFromRef.current = startFrom;
  }, [startFrom]);

  /** Définit le texte à lire. Un changement de contenu réinitialise la position. */
  const setSource = useCallback(
    (text: string) => {
      if (text === sourceRef.current) return;

      abortCurrent();
      sourceRef.current = text;
      segmentsRef.current = splitIntoSegments(text);
      cursorRef.current = 0;
      chunkEndRef.current = 0;
      positionRef.current = 0;

      setSourceState(text);
      setPosition(0);
      setWordRange(null);
      setStatus("idle");
      setBlocked(false);
      pendingRef.current = null;
    },
    [abortCurrent]
  );

  /** Démarre ou reprend la lecture depuis la position courante. */
  const play = useCallback(() => {
    const text = sourceRef.current;
    if (!text) return false;

    abortCurrent();
    setBlocked(false);

    const from = cursorRef.current >= text.length ? 0 : cursorRef.current;
    startFromRef.current(from);
    return true;
  }, [abortCurrent]);

  /** Lit un texte immédiatement (remplace la source courante). */
  const playText = useCallback(
    (text: string) => {
      setSource(text);
      if (!text.trim()) return false;

      abortCurrent();
      setBlocked(false);
      cursorRef.current = 0;
      startFromRef.current(0);
      return true;
    },
    [abortCurrent, setSource]
  );

  const pause = useCallback(() => {
    if (status !== "playing" && status !== "loading") return;

    // Reprendre au début du mot courant : le plus naturel à l'oreille.
    const resumeAt = Math.floor(positionRef.current);
    abortCurrent();
    cursorRef.current = resumeAt;
    applyPosition(resumeAt);
    setStatus("paused");
  }, [abortCurrent, applyPosition, status]);

  const togglePause = useCallback(() => {
    if (status === "playing" || status === "loading") {
      pause();
    } else {
      play();
    }
  }, [pause, play, status]);

  const stop = useCallback(() => {
    abortCurrent();
    cursorRef.current = 0;
    applyPosition(0);
    setWordRange(null);
    setStatus("idle");
    setBlocked(false);
    pendingRef.current = null;
  }, [abortCurrent, applyPosition]);

  /** Déplace la tête de lecture (index de caractère). */
  const seekToChar = useCallback(
    (char: number) => {
      const text = sourceRef.current;
      if (!text) return;

      const target = clamp(Math.floor(char), 0, text.length);
      const wasPlaying = status === "playing" || status === "loading";

      abortCurrent();
      cursorRef.current = target;
      applyPosition(target);
      setWordRange(null);

      if (wasPlaying && target < text.length) {
        startFromRef.current(target);
      } else if (!wasPlaying) {
        setStatus(status === "paused" ? "paused" : "idle");
      } else {
        setStatus("idle");
      }
    },
    [abortCurrent, applyPosition, status]
  );

  const seekToRatio = useCallback(
    (ratio: number) => {
      seekToChar(clamp(ratio, 0, 1) * sourceRef.current.length);
    },
    [seekToChar]
  );

  /** Avance ou recule d'un nombre de secondes (converti en caractères). */
  const skipSeconds = useCallback(
    (seconds: number) => {
      seekToChar(positionRef.current + seconds * cpsRef.current);
    },
    [seekToChar]
  );

  /** Relance une lecture refusée (depuis une interaction utilisateur). */
  const retryBlocked = useCallback(() => {
    const pending = pendingRef.current;
    setBlocked(false);
    if (pending === null) return false;

    pendingRef.current = null;
    abortCurrent();
    cursorRef.current = pending;
    startFromRef.current(pending);
    return true;
  }, [abortCurrent]);

  const dismissBlocked = useCallback(() => {
    pendingRef.current = null;
    setBlocked(false);
  }, []);

  // Interpolation de la position entre deux évènements `boundary` — et seule
  // source de progression pour les voix qui n'en émettent aucun.
  useEffect(() => {
    if (status !== "playing") return;

    const interval = setInterval(() => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const elapsed = (performance.now() - anchor.at) / 1000;
      const projected = anchor.char + elapsed * cpsRef.current;
      const capped = Math.min(projected, chunkEndRef.current);

      if (capped > positionRef.current) {
        positionRef.current = capped;
        setPosition(capped);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [status]);

  // Lecture refusée : la première interaction, quelle qu'elle soit, sert de
  // geste déclencheur.
  useEffect(() => {
    if (!blocked) return;

    const handler = () => {
      retryBlocked();
    };

    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [blocked, retryBlocked]);

  // Ne pas laisser une voix continuer après avoir quitté l'outil.
  useEffect(() => {
    return () => {
      generationRef.current += 1;
      if (guardRef.current) clearTimeout(guardRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const totalChars = source.length;

  const timings = useMemo(() => {
    const cps = charsPerSecond || BASE_CHARS_PER_SECOND;
    return {
      currentTimeMs: (position / cps) * 1000,
      durationMs: (totalChars / cps) * 1000,
      progress: totalChars > 0 ? clamp(position / totalChars, 0, 1) : 0,
    };
  }, [charsPerSecond, position, totalChars]);

  return {
    voices,
    voicesReady,
    status,
    source,
    /** Position courante en caractères (flottante, interpolée). */
    position,
    totalChars,
    /** Mot en cours de prononciation, si la voix émet des `boundary`. */
    wordRange,
    blocked,
    isPlaying: status === "playing",
    isPaused: status === "paused",
    isLoading: status === "loading",
    isActive: status === "playing" || status === "loading" || status === "paused",
    charsPerSecond,
    ...timings,
    setSource,
    play,
    playText,
    pause,
    togglePause,
    stop,
    seekToChar,
    seekToRatio,
    skipSeconds,
    retryBlocked,
    dismissBlocked,
  };
}
