"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface ReaderTextProps {
  /** Texte nettoyé, identique à celui envoyé à la synthèse. */
  source: string;
  /** Position de lecture en caractères. */
  position: number;
  /** Mot en cours, si la voix émet des évènements `boundary`. */
  wordRange: { start: number; length: number } | null;
  /** Clic dans le texte : déplace la tête de lecture. */
  onSeekChar?: (char: number) => void;
  /** Suivre automatiquement la lecture par défilement. */
  autoScroll?: boolean;
  className?: string;
  /** Classe de taille de police du texte. */
  textClassName?: string;
}

/** Délai pendant lequel un défilement manuel désactive le suivi automatique. */
const MANUAL_SCROLL_GRACE_MS = 4000;

interface CaretPosition {
  node: Node;
  offset: number;
}

/**
 * Position du texte sous le curseur. `caretPositionFromPoint` est la version
 * standard (Chromium récent, Firefox) ; `caretRangeFromPoint` le fallback
 * WebKit/Chromium historique.
 */
function caretFromPoint(x: number, y: number): CaretPosition | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number
    ) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };

  const position = doc.caretPositionFromPoint?.(x, y);
  if (position) {
    return { node: position.offsetNode, offset: position.offset };
  }

  const range = doc.caretRangeFromPoint?.(x, y);
  if (range) {
    return { node: range.startContainer, offset: range.startOffset };
  }

  return null;
}

export function ReaderText({
  source,
  position,
  wordRange,
  onSeekChar,
  autoScroll = true,
  className,
  textClassName = "text-base leading-relaxed",
}: ReaderTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const manualScrollRef = useRef(0);

  const cursor = Math.floor(position);

  // Le mot courant n'est affiché que s'il est cohérent avec la position :
  // certaines voix n'émettent aucun `boundary`, on se rabat alors sur un
  // simple dégradé lu / non lu.
  const highlight = useMemo(() => {
    if (
      wordRange &&
      wordRange.length > 0 &&
      wordRange.start >= 0 &&
      wordRange.start <= source.length &&
      Math.abs(wordRange.start - cursor) < 80
    ) {
      return {
        start: wordRange.start,
        end: Math.min(wordRange.start + wordRange.length, source.length),
      };
    }
    return null;
  }, [cursor, source.length, wordRange]);

  const before = highlight ? source.slice(0, highlight.start) : source.slice(0, cursor);
  const word = highlight ? source.slice(highlight.start, highlight.end) : "";
  const after = highlight ? source.slice(highlight.end) : source.slice(cursor);

  // Suivi automatique, désactivé temporairement si l'utilisateur défile lui-même.
  useEffect(() => {
    if (!autoScroll || !wordRef.current) return;
    if (performance.now() - manualScrollRef.current < MANUAL_SCROLL_GRACE_MS) {
      return;
    }

    const container = containerRef.current;
    const target = wordRef.current;
    if (!container) return;

    const containerBox = container.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();

    const isVisible =
      targetBox.top >= containerBox.top + 8 &&
      targetBox.bottom <= containerBox.bottom - 8;

    if (!isVisible) {
      container.scrollTop +=
        targetBox.top - containerBox.top - containerBox.height / 2;
    }
  }, [autoScroll, before.length]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!onSeekChar) return;

      const container = containerRef.current;
      if (!container) return;

      // Un clic destiné à sélectionner du texte ne doit pas déplacer la lecture.
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return;

      const caret = caretFromPoint(event.clientX, event.clientY);
      const node = caret?.node ?? selection?.anchorNode ?? null;
      const offset = caret?.offset ?? selection?.anchorOffset ?? 0;

      if (!node || !container.contains(node)) return;

      // Cumuler la longueur des nœuds texte précédant le point cliqué.
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let total = 0;
      let current = walker.nextNode();

      while (current) {
        if (current === node) {
          onSeekChar(total + offset);
          return;
        }
        total += current.textContent?.length ?? 0;
        current = walker.nextNode();
      }
    },
    [onSeekChar]
  );

  return (
    <div
      ref={containerRef}
      onScroll={() => {
        manualScrollRef.current = performance.now();
      }}
      onClick={handleClick}
      className={cn(
        "overflow-y-auto whitespace-pre-wrap break-words",
        onSeekChar && "cursor-text",
        className
      )}
      title={onSeekChar ? "Cliquez dans le texte pour y déplacer la lecture" : undefined}
    >
      <p className={textClassName}>
        <span className="text-muted-foreground/60">{before}</span>
        {word && (
          <span
            ref={wordRef}
            className="rounded bg-emerald-400/30 px-0.5 font-medium text-foreground ring-1 ring-emerald-500/40"
          >
            {word}
          </span>
        )}
        <span className="text-foreground">{after}</span>
      </p>
    </div>
  );
}
