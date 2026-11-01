"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  CircleCheck,
  CircleX,
  Download,
  Eraser,
  Upload,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/site/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ErrorLocation {
  line: number;
  column: number;
}

type ValidationResult =
  | {
      isValid: true;
      formatted: string;
      size: number;
      depth: number;
      keys: number;
    }
  | { isValid: false; error: string; location: ErrorLocation | null };

const INDENT_SIZES = [2, 4, 8];

// Assez court pour que le bouton « Formater » ait un effet visible.
const EXAMPLE =
  '{"outil":"Just Tools","version":3,"gratuit":true,"auteur":null,"formats":["json","csv"],"limites":{"taille":1048576,"fichiers":[{"nom":"exemple.json","lignes":12}]}}';

// Au-delà, découper le document en milliers de nœuds ralentirait chaque frappe :
// le résultat reste lisible sans couleurs.
const HIGHLIGHT_LIMIT = 100_000;

const EXCERPT_RADIUS = 40;
const V8_CONTEXT_RADIUS = 10;

// Le groupe capturant garde les jetons dans `split` : ils tombent sur les indices
// impairs, le texte qui les sépare sur les pairs.
const TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/;

const PANE = "flex min-h-0 min-w-0 flex-col";
const PANE_HEADER =
  "border-border flex h-10 shrink-0 items-center justify-between gap-3 border-b px-3 sm:px-5 lg:px-6";
const PANE_TITLE = "text-fg-muted text-[0.8125rem] font-medium";
const PANE_META = "text-fg-subtle min-w-0 truncate text-xs tabular-nums";

const formatCount = (count: number, unit: string) =>
  `${count.toLocaleString("fr-FR")}\u00a0${unit}${count > 1 ? "s" : ""}`;

const formatSize = (bytes: number) =>
  `${(bytes / 1024).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}\u00a0Ko`;

function getDepth(value: unknown, currentDepth = 0): number {
  if (value === null || typeof value !== "object") return currentDepth;

  return Object.values(value).reduce<number>(
    (deepest, child) => Math.max(deepest, getDepth(child, currentDepth + 1)),
    currentDepth
  );
}

function countKeys(value: unknown): number {
  if (value === null || typeof value !== "object") return 0;

  return Object.values(value).reduce<number>(
    (count, child) => count + countKeys(child),
    Object.keys(value).length
  );
}

function findErrorOffset(message: string, source: string): number | null {
  const position = message.match(/position (\d+)/);
  if (position) return Number(position[1]);
  if (message.includes("end of JSON input")) return source.length;

  // Sur un jeton inattendu, Chrome ne donne pas de position mais cite les dix
  // caractères de part et d'autre, précédés de points de suspension.
  const context = message.match(/\.\.\."([\s\S]*)"(?:\.\.\.)? is not valid JSON/);
  const index = context ? source.indexOf(context[1]) : -1;
  return index === -1 ? null : index + V8_CONTEXT_RADIUS;
}

/**
 * Retrouve la position de l'erreur dans le message du navigateur, dont le format
 * dépend du moteur. Sans position exploitable (Safari, ou un document très court
 * sous Chrome), seul le message du moteur reste affiché.
 */
function locateError(message: string, source: string): ErrorLocation | null {
  const explicit = message.match(/line (\d+) column (\d+)/);
  if (explicit) {
    return { line: Number(explicit[1]), column: Number(explicit[2]) };
  }

  const offset = findErrorOffset(message, source);
  if (offset === null) return null;

  const before = source.slice(0, offset);
  return {
    line: before.split("\n").length,
    column: before.length - before.lastIndexOf("\n"),
  };
}

function validateJson(source: string, indentSize: number): ValidationResult {
  try {
    const parsed: unknown = JSON.parse(source);

    return {
      isValid: true,
      formatted: JSON.stringify(parsed, null, indentSize),
      size: new Blob([source]).size,
      depth: getDepth(parsed),
      keys: countKeys(parsed),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur de validation inconnue";
    return {
      isValid: false,
      error: message,
      location: locateError(message, source),
    };
  }
}

function getTokenClass(token: string) {
  if (token.endsWith(":")) return "text-fg font-medium";
  if (token.startsWith('"')) return "text-accent";
  if (/^(true|false|null)$/.test(token)) return "text-warning";
  return "text-link";
}

function highlightJson(json: string): ReactNode[] {
  return json.split(TOKEN_PATTERN).map((part, index) =>
    index % 2 === 0 ? (
      part
    ) : (
      <span key={index} className={getTokenClass(part)}>
        {part}
      </span>
    )
  );
}

function FormattedJson({ json }: { json: string }) {
  const content = useMemo(
    () => (json.length > HIGHLIGHT_LIMIT ? json : highlightJson(json)),
    [json]
  );

  return (
    <pre
      tabIndex={0}
      aria-label="JSON formaté"
      className="text-fg-muted min-h-0 flex-1 overflow-auto px-3 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] focus-visible:-outline-offset-2 sm:px-5 lg:px-6"
    >
      {content}
    </pre>
  );
}

/** Le passage fautif, centré sur l'erreur : un JSON minifié tient sur une ligne. */
function ErrorExcerpt({
  source,
  location,
}: {
  source: string;
  location: ErrorLocation;
}) {
  const line = (source.split("\n")[location.line - 1] ?? "").trimEnd();
  const index = Math.min(location.column - 1, line.length);
  const start = Math.max(0, index - EXCERPT_RADIUS);
  const end = index + 1 + EXCERPT_RADIUS;

  if (!line) return null;

  return (
    <pre className="bg-bg border-border rounded-field text-fg shrink-0 border px-3 py-2 font-mono text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
      {start > 0 && "…"}
      {line.slice(start, index)}
      {line[index] && (
        <mark className="bg-danger-soft text-danger-soft-fg rounded-xs">
          {line[index]}
        </mark>
      )}
      {line.slice(index + 1, end)}
      {end < line.length && "…"}
    </pre>
  );
}

function ErrorDetail({
  error,
  location,
  source,
}: {
  error: string;
  location: ErrorLocation | null;
  source: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-3 py-3 sm:px-5 lg:px-6">
      <p className="text-danger text-sm font-semibold">
        {location
          ? `Erreur à la ligne\u00a0${location.line}, colonne\u00a0${location.column}`
          : "Erreur de syntaxe"}
      </p>
      {location && <ErrorExcerpt source={source} location={location} />}
      <p className="text-fg-muted text-sm">
        Corrige ce passage&nbsp;: la validation reprend à chaque frappe.
      </p>
      <p className="text-fg-subtle font-mono text-xs [overflow-wrap:anywhere]">
        {error}
      </p>
    </div>
  );
}

export default function JsonValidator() {
  const [input, setInput] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const fileInput = useRef<HTMLInputElement>(null);

  // État dérivé de la saisie : un calcul mémoïsé évite un rendu en cascade à
  // chaque frappe, là où un `useState` alimenté par un effet en provoquait un.
  const result = useMemo(
    () => (input.trim() ? validateJson(input, indentSize) : null),
    [input, indentSize]
  );
  const formatted = result?.isValid ? result.formatted : "";
  const location = result && !result.isValid ? result.location : null;

  const summary = result?.isValid
    ? [
        formatSize(result.size),
        `profondeur\u00a0${result.depth}`,
        formatCount(result.keys, "clé"),
      ].join(", ")
    : "";

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Sans cette remise à zéro, réimporter le même fichier ne déclenche rien.
    event.target.value = "";
    if (!file) return;

    try {
      setInput(await file.text());
    } catch {
      toast.error("Lecture impossible. Vérifie le fichier, puis réessaie.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2 sm:px-5 lg:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            title="Importer un fichier"
            onClick={() => fileInput.current?.click()}
          >
            <Upload aria-hidden="true" />
            <span className="max-sm:sr-only">Importer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Effacer"
            onClick={() => setInput("")}
            disabled={!input}
          >
            <Eraser aria-hidden="true" />
            <span className="max-sm:sr-only">Effacer</span>
          </Button>
          <Select
            value={String(indentSize)}
            onValueChange={(value) => setIndentSize(Number(value))}
          >
            <SelectTrigger size="sm" aria-label="Indentation" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDENT_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}&nbsp;espaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:ms-auto">
          <Button
            size="sm"
            title="Remplacer la saisie par le JSON formaté"
            onClick={() => setInput(formatted)}
            disabled={!formatted || input === formatted}
          >
            <WandSparkles aria-hidden="true" />
            Formater
          </Button>
          <CopyButton
            variant="outline"
            size="sm"
            value={formatted}
            disabled={!formatted}
          />
          <Button
            variant="outline"
            size="sm"
            title="Télécharger le JSON formaté"
            onClick={handleDownload}
            disabled={!formatted}
          >
            <Download aria-hidden="true" />
            <span className="max-sm:sr-only">Télécharger</span>
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
        <section className={PANE}>
          <div className={PANE_HEADER}>
            <label htmlFor="json-input" className={PANE_TITLE}>
              JSON à valider
            </label>
            {input && (
              <span className={PANE_META}>
                {formatCount(input.length, "caractère")},{" "}
                {formatCount(input.split("\n").length, "ligne")}
              </span>
            )}
          </div>
          <Textarea
            id="json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Colle ton JSON ici ou importe un fichier…"
            aria-invalid={result ? !result.isValid : undefined}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="min-h-0 flex-1 resize-none rounded-none! border-0 px-3 py-3 font-mono field-sizing-fixed focus-visible:shadow-[inset_0_0_0_1px_var(--asc-primary)] sm:px-5 lg:px-6"
          />
        </section>

        <section
          aria-label="Résultat"
          className={`${PANE} max-md:border-t md:border-s`}
        >
          <div className={PANE_HEADER}>
            <div aria-live="polite" className="flex min-w-0 shrink-0 items-center">
              {!result && <span className={PANE_TITLE}>Résultat</span>}
              {result?.isValid && (
                <Badge variant="success">
                  <CircleCheck aria-hidden="true" />
                  JSON valide
                </Badge>
              )}
              {result && !result.isValid && (
                <Badge variant="destructive">
                  <CircleX aria-hidden="true" />
                  {location
                    ? `JSON invalide, ligne\u00a0${location.line}`
                    : "JSON invalide"}
                </Badge>
              )}
            </div>
            {summary && (
              <span className={PANE_META} title={summary}>
                {summary}
              </span>
            )}
          </div>

          <div className="bg-surface flex min-h-0 flex-1 flex-col">
            {result ? (
              // Ce conteneur survit au passage de valide à invalide : l'apparition
              // ne se joue qu'une fois, jamais à chaque frappe.
              <div className="asc-animate-step-in flex min-h-0 flex-1 flex-col">
                {result.isValid ? (
                  <FormattedJson json={result.formatted} />
                ) : (
                  <ErrorDetail
                    error={result.error}
                    location={result.location}
                    source={input}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto p-6 text-center">
                <p className="text-fg-muted max-w-xs text-sm text-pretty">
                  Colle ton JSON ou importe un fichier&nbsp;: il est vérifié à
                  chaque frappe et reformaté ici.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(EXAMPLE)}
                >
                  Essayer un exemple
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
