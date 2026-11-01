"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Pause, Play, RotateCcw, Square } from "lucide-react";
import { formatDuration, type PlayerStatus } from "@/hooks/use-tts-player";
import { cn } from "@/lib/utils";

interface PlayerBarProps {
  status: PlayerStatus;
  /** Position courante en caractères. */
  position: number;
  totalChars: number;
  currentTimeMs: number;
  durationMs: number;
  charsPerSecond: number;
  disabled?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeekChar: (char: number) => void;
  onSkip: (seconds: number) => void;
  /** Variante du mode lecteur : toujours sur deux lignes, bouton agrandi. */
  size?: "default" | "large";
}

export function PlayerBar({
  status,
  position,
  totalChars,
  currentTimeMs,
  durationMs,
  charsPerSecond,
  disabled = false,
  onPlay,
  onPause,
  onStop,
  onSeekChar,
  onSkip,
  size = "default",
}: PlayerBarProps) {
  // Pendant le glissement on affiche la position visée sans relancer la voix
  // à chaque pixel : le seek n'est appliqué qu'au relâchement.
  const [scrubbing, setScrubbing] = useState<number | null>(null);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const displayChar = scrubbing ?? position;
  const displayTimeMs =
    scrubbing !== null
      ? (scrubbing / (charsPerSecond || 1)) * 1000
      : currentTimeMs;

  const large = size === "large";
  const hasContent = totalChars > 0;

  return (
    <div
      className={cn(
        // Les commandes viennent d'abord dans le DOM : le clavier les atteint
        // avant le curseur, même quand celui-ci s'affiche au-dessus.
        "flex min-w-0 flex-col-reverse gap-3",
        !large && "@3xl:flex-row @3xl:items-center @3xl:gap-6"
      )}
    >
      <div className="flex shrink-0 items-center justify-center gap-1.5">
        <Button
          variant="ghost"
          className="px-3 tabular-nums"
          onClick={() => onSkip(-10)}
          disabled={disabled || !hasContent}
          aria-label="Reculer de 10 secondes"
          title="Reculer de 10 secondes"
        >
          −10&nbsp;s
        </Button>

        <Button
          onClick={isPlaying || isLoading ? onPause : onPlay}
          disabled={disabled || !hasContent}
          size={large ? "lg" : "default"}
          // Largeur fixe : le libellé change sans décaler les boutons voisins.
          className="min-w-36"
        >
          {isLoading ? (
            <Loader2 className="asc-animate-spin" aria-hidden="true" />
          ) : isPlaying ? (
            <Pause aria-hidden="true" />
          ) : (
            <Play aria-hidden="true" />
          )}
          {isLoading
            ? "Préparation…"
            : isPlaying
            ? "Pause"
            : status === "paused"
            ? "Reprendre"
            : "Lire"}
        </Button>

        {/* Un seul emplacement : « arrêter » et « revenir au début » ne servent
            jamais en même temps, et le rang de boutons ne bouge pas. */}
        {status === "idle" && position > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSeekChar(0)}
            aria-label="Revenir au début"
            title="Revenir au début"
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            disabled={disabled || status === "idle"}
            aria-label="Arrêter"
            title="Arrêter et revenir au début"
          >
            <Square aria-hidden="true" />
          </Button>
        )}

        <Button
          variant="ghost"
          className="px-3 tabular-nums"
          onClick={() => onSkip(10)}
          disabled={disabled || !hasContent}
          aria-label="Avancer de 10 secondes"
          title="Avancer de 10 secondes"
        >
          +10&nbsp;s
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="text-fg-muted min-w-10 shrink-0 text-end font-mono text-xs tabular-nums">
          {formatDuration(displayTimeMs)}
        </span>

        <Slider
          value={[Math.min(displayChar, Math.max(totalChars, 1))]}
          min={0}
          max={Math.max(totalChars, 1)}
          step={1}
          disabled={disabled || !hasContent}
          aria-label="Position de lecture"
          onValueChange={([value]) => setScrubbing(value)}
          onValueCommit={([value]) => {
            setScrubbing(null);
            onSeekChar(value);
          }}
          className="min-w-0 flex-1"
        />

        <span
          className="text-fg-muted min-w-12 shrink-0 font-mono text-xs tabular-nums"
          title="Durée estimée à partir du débit mesuré pendant la lecture"
        >
          ~{formatDuration(durationMs)}
        </span>
      </div>
    </div>
  );
}
