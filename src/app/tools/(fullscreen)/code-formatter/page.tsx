"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  CircleCheck,
  CircleX,
  Download,
  Eraser,
  SlidersHorizontal,
  Upload,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/site/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatSource,
  isFullyFormatted,
  type FormatOptions,
} from "@/lib/code-format";
import { cn } from "@/lib/utils";

interface Language {
  id: string;
  name: string;
  extension: string;
}

const LANGUAGES: Language[] = [
  { id: "javascript", name: "JavaScript", extension: ".js" },
  { id: "typescript", name: "TypeScript", extension: ".ts" },
  { id: "json", name: "JSON", extension: ".json" },
  { id: "html", name: "HTML", extension: ".html" },
  { id: "css", name: "CSS", extension: ".css" },
  { id: "python", name: "Python", extension: ".py" },
  { id: "java", name: "Java", extension: ".java" },
  { id: "cpp", name: "C++", extension: ".cpp" },
  { id: "csharp", name: "C#", extension: ".cs" },
  { id: "php", name: "PHP", extension: ".php" },
  { id: "go", name: "Go", extension: ".go" },
  { id: "rust", name: "Rust", extension: ".rs" },
];

const DEFAULT_OPTIONS: FormatOptions = {
  indentSize: 2,
  useTabs: false,
  maxLineLength: 80,
  removeTrailingWhitespace: true,
  insertFinalNewline: true,
};

const TAB_CHOICE = "tab";

const LINE_OPTIONS = [
  {
    key: "removeTrailingWhitespace",
    label: "Retirer les espaces en fin de ligne",
  },
  { key: "insertFinalNewline", label: "Terminer par un saut de ligne" },
] as const;

const EXAMPLE_LANGUAGE = LANGUAGES[0];
const EXAMPLE =
  'function greet(name){const message = "Bonjour " + name;if (name){console.log(message);}return message;}';

const PANE = "flex min-h-0 min-w-0 flex-col";
const PANE_HEADER =
  "border-border flex h-10 shrink-0 items-center justify-between gap-3 border-b px-3 sm:px-5 lg:px-6";
const PANE_TITLE = "text-fg-muted text-[0.8125rem] font-medium";
const PANE_META = "text-fg-subtle min-w-0 truncate text-xs tabular-nums";
const EDITOR_FIELD =
  "min-h-0 flex-1 resize-none rounded-none! border-0 px-3 py-3 font-mono field-sizing-fixed focus-visible:shadow-[inset_0_0_0_1px_var(--asc-primary)] sm:px-5 lg:px-6";

const formatCount = (count: number, unit: string) =>
  `${count.toLocaleString("fr-FR")} ${unit}${count > 1 ? "s" : ""}`;

const describeSize = (text: string) =>
  `${formatCount(text.length, "caractère")}, ${formatCount(
    text.split("\n").length,
    "ligne"
  )}`;

export default function CodeFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [failure, setFailure] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [optionsOpen, setOptionsOpen] = useState(false);
  // Rejoue l'apparition du résultat à chaque formatage, y compris quand il ne
  // change pas : c'est la confirmation que le geste a été pris en compte.
  const [formatRun, setFormatRun] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const updateOptions = (changes: Partial<FormatOptions>) =>
    setOptions((previous) => ({ ...previous, ...changes }));

  const clearResult = () => {
    setOutput("");
    setFailure(null);
  };

  const runFormat = async (source: string, language: Language) => {
    try {
      setOutput(await formatSource(source, language.id, options));
      setFailure(null);
      setFormatRun((run) => run + 1);
    } catch (error) {
      setOutput("");
      setFailure(
        error instanceof Error ? error.message : "Erreur de formatage inconnue"
      );
    }
  };

  const loadExample = () => {
    setInput(EXAMPLE);
    setSelectedLanguage(EXAMPLE_LANGUAGE);
    runFormat(EXAMPLE, EXAMPLE_LANGUAGE);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Sans cette remise à zéro, réimporter le même fichier ne déclenche rien.
    event.target.value = "";
    if (!file) return;

    try {
      setInput(await file.text());
      clearResult();

      // Détecter le langage d'après l'extension.
      const extension = file.name.split(".").pop()?.toLowerCase();
      const detectedLanguage = LANGUAGES.find(
        (language) => language.extension.slice(1) === extension
      );
      if (detectedLanguage) setSelectedLanguage(detectedLanguage);
    } catch {
      toast.error("Lecture impossible. Vérifie le fichier, puis réessaie.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `formatted${selectedLanguage.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasInput = Boolean(input.trim());

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2 sm:px-5 lg:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Select
            value={selectedLanguage.id}
            onValueChange={(value) => {
              const language = LANGUAGES.find(({ id }) => id === value);
              if (language) setSelectedLanguage(language);
            }}
          >
            <SelectTrigger size="sm" aria-label="Langage" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(({ id, name }) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={options.useTabs ? TAB_CHOICE : String(options.indentSize)}
            onValueChange={(value) =>
              updateOptions(
                value === TAB_CHOICE
                  ? { useTabs: true }
                  : { useTabs: false, indentSize: Number(value) }
              )
            }
          >
            <SelectTrigger size="sm" aria-label="Indentation" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2&nbsp;espaces</SelectItem>
              <SelectItem value="4">4&nbsp;espaces</SelectItem>
              <SelectItem value="8">8&nbsp;espaces</SelectItem>
              <SelectItem value={TAB_CHOICE}>Tabulations</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={optionsOpen ? "soft" : "ghost"}
            size="sm"
            title="Options de formatage"
            aria-expanded={optionsOpen}
            aria-controls="format-options"
            className={cn(!optionsOpen && "border border-transparent")}
            onClick={() => setOptionsOpen(!optionsOpen)}
          >
            <SlidersHorizontal aria-hidden="true" />
            <span className="max-xl:sr-only">Options</span>
          </Button>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:ms-auto">
          <input
            ref={fileInput}
            type="file"
            accept=".js,.ts,.json,.html,.css,.py,.java,.cpp,.cs,.php,.go,.rs,.txt"
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
            <span className="max-xl:sr-only">Importer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Effacer"
            onClick={() => {
              setInput("");
              clearResult();
            }}
            disabled={!input && !output && !failure}
          >
            <Eraser aria-hidden="true" />
            <span className="max-xl:sr-only">Effacer</span>
          </Button>
          <Button
            size="sm"
            onClick={() => runFormat(input, selectedLanguage)}
            disabled={!hasInput}
          >
            <WandSparkles aria-hidden="true" />
            Formater
          </Button>
          <CopyButton
            variant="outline"
            size="sm"
            value={output}
            disabled={!output}
          />
          <Button
            variant="outline"
            size="sm"
            title="Télécharger le code formaté"
            onClick={handleDownload}
            disabled={!output}
          >
            <Download aria-hidden="true" />
            <span className="max-xl:sr-only">Télécharger</span>
          </Button>
        </div>
      </div>

      {optionsOpen && (
        <div
          id="format-options"
          className="border-border asc-animate-step-in flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 border-b px-3 py-2 sm:px-5 lg:px-6"
        >
          <div className="flex min-h-9 min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
            <Label htmlFor="max-line-length" className="font-normal">
              Longueur max. de ligne
            </Label>
            <Input
              id="max-line-length"
              type="number"
              min="0"
              max="200"
              value={options.maxLineLength}
              onChange={(event) =>
                updateOptions({ maxLineLength: Number(event.target.value) })
              }
              className="h-9 w-20 tabular-nums"
            />
            <span className="text-fg-subtle text-xs">0 pour ne pas couper</span>
          </div>

          {LINE_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex min-h-9 min-w-0 cursor-pointer items-center gap-2.5 text-sm"
            >
              <Checkbox
                checked={options[key]}
                onCheckedChange={(checked) =>
                  updateOptions({ [key]: checked === true })
                }
              />
              <span className="text-fg min-w-0">{label}</span>
            </label>
          ))}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
        <section className={PANE}>
          <div className={PANE_HEADER}>
            <label htmlFor="source-code" className={PANE_TITLE}>
              Code source
            </label>
            {input && <span className={PANE_META}>{describeSize(input)}</span>}
          </div>
          <Textarea
            id="source-code"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Colle ton code ici ou importe un fichier…"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={EDITOR_FIELD}
          />
        </section>

        <section
          aria-label="Code formaté"
          className={cn(PANE, "max-md:border-t md:border-s")}
        >
          <div className={PANE_HEADER}>
            <div aria-live="polite" className="flex min-w-0 shrink-0 items-center">
              {failure && (
                <Badge variant="destructive">
                  <CircleX aria-hidden="true" />
                  Formatage impossible
                </Badge>
              )}
              {output && (
                <Badge variant="success">
                  <CircleCheck aria-hidden="true" />
                  Code formaté
                </Badge>
              )}
              {!failure && !output && (
                <span className={PANE_TITLE}>Code formaté</span>
              )}
            </div>
            {isFullyFormatted(selectedLanguage.id) ? (
              output && <span className={PANE_META}>{describeSize(output)}</span>
            ) : (
              <span className={PANE_META}>
                Pour ce langage, seule l&apos;indentation est harmonisée
              </span>
            )}
          </div>

          <div className="bg-surface flex min-h-0 flex-1 flex-col">
            {failure && (
              <div className="asc-animate-step-in flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-3 py-3 sm:px-5 lg:px-6">
                <p className="text-danger text-sm font-semibold">
                  Code {selectedLanguage.name} invalide, rien n&apos;a été
                  reformaté.
                </p>
                <p className="text-fg-muted text-sm">
                  Corrige-le, puis relance le formatage.
                </p>
                <p className="text-fg-subtle font-mono text-xs [overflow-wrap:anywhere]">
                  {failure}
                </p>
              </div>
            )}

            {output && (
              <Textarea
                key={formatRun}
                aria-label="Code formaté"
                value={output}
                readOnly
                spellCheck={false}
                className={cn(EDITOR_FIELD, "asc-animate-fade bg-surface")}
              />
            )}

            {!failure && !output && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto p-6 text-center">
                {hasInput ? (
                  <p className="text-fg-muted max-w-xs text-sm text-pretty">
                    Lance le formatage&nbsp;: le résultat s&apos;affichera ici.
                  </p>
                ) : (
                  <>
                    <p className="text-fg-muted max-w-xs text-sm text-pretty">
                      Colle ton code ou importe un fichier, choisis le langage,
                      puis lance le formatage.
                    </p>
                    <Button variant="outline" size="sm" onClick={loadExample}>
                      Essayer un exemple
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
