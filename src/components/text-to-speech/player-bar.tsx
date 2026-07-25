"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Rewind,
  FastForward,
  Square,
} from "lucide-react";
import { formatDuration, type PlayerStatus } from "@/hooks/use-tts-player";

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
  /** Variante compacte pour le mode lecteur. */
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
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
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
          className="flex-1"
        />

        <span
          className="w-14 shrink-0 font-mono text-xs text-muted-foreground tabular-nums"
          title="Durée estimée à partir du débit mesuré pendant la lecture"
        >
          ~{formatDuration(durationMs)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size={large ? "default" : "sm"}
          onClick={() => onSkip(-10)}
          disabled={disabled || !hasContent}
          title="Reculer de 10 secondes"
        >
          <Rewind className="h-4 w-4" />
          <span className="ml-1 text-xs">10s</span>
        </Button>

        <Button
          onClick={isPlaying || isLoading ? onPause : onPlay}
          disabled={disabled || !hasContent}
          size={large ? "lg" : "default"}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isLoading
            ? "Préparation…"
            : isPlaying
            ? "Pause"
            : status === "paused"
            ? "Reprendre"
            : "Lire"}
        </Button>

        <Button
          variant="outline"
          size={large ? "default" : "sm"}
          onClick={onStop}
          disabled={disabled || status === "idle"}
          title="Arrêter et revenir au début"
        >
          <Square className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size={large ? "default" : "sm"}
          onClick={() => onSkip(10)}
          disabled={disabled || !hasContent}
          title="Avancer de 10 secondes"
        >
          <span className="mr-1 text-xs">10s</span>
          <FastForward className="h-4 w-4" />
        </Button>

        {position > 0 && status === "idle" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSeekChar(0)}
            title="Revenir au début"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        {hasContent && (
          <Badge variant="outline" className="ml-1 font-mono text-[10px]">
            {Math.floor(displayChar)} / {totalChars}
          </Badge>
        )}
      </div>
    </div>
  );
}
