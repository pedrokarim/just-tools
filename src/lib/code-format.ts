/**
 * Le formatage de code.
 *
 * Prettier analyse réellement le code : il ne peut pas le corrompre, et il refuse
 * ce qu'il ne comprend pas. Il se charge à la demande, pour ne pas alourdir la
 * page de ceux qui ne formatent rien.
 *
 * Pour les langages qu'il ne connaît pas, on n'essaie pas de deviner : on harmonise
 * l'indentation et rien d'autre, sans toucher au contenu des lignes.
 */

import type { Plugin } from "prettier";
import { loadPrettierModule } from "@/lib/prettier-loader";

export interface FormatOptions {
  indentSize: number;
  useTabs: boolean;
  maxLineLength: number;
  removeTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
}

type PrettierParser = "babel" | "typescript" | "json" | "html" | "css";

const PRETTIER_PARSERS: Record<string, PrettierParser> = {
  javascript: "babel",
  typescript: "typescript",
  json: "json",
  html: "html",
  css: "css",
};

/** Vrai quand le langage est réellement analysé, pas seulement réindenté. */
export const isFullyFormatted = (languageId: string) =>
  languageId in PRETTIER_PARSERS;

/** Largeur prêtée à une tabulation pour comparer les retraits entre eux. */
const TAB_WIDTH = 4;

function indentWidth(whitespace: string) {
  return [...whitespace].reduce(
    (width, char) => width + (char === "\t" ? TAB_WIDTH : 1),
    0
  );
}

/** Réécrit les retraits avec l'unité demandée, sans toucher au reste des lignes. */
export function reindent(code: string, indent: string): string {
  const lines = code.split("\n");
  const widths = lines
    .filter((line) => line.trim())
    .map((line) => indentWidth(/^[ \t]*/.exec(line)![0]));

  const positive = widths.filter((width) => width > 0);
  const unit = positive.length > 0 ? Math.min(...positive) : 1;

  return lines
    .map((line) => {
      if (!line.trim()) return "";
      const [whitespace] = /^[ \t]*/.exec(line)!;
      const level = Math.round(indentWidth(whitespace) / unit);
      return indent.repeat(level) + line.slice(whitespace.length);
    })
    .join("\n");
}

/**
 * Les modules de chaque langage, chargés séparément : TypeScript seul pèse plus
 * que tout le reste, et personne ne doit le télécharger pour formater du CSS.
 */
const PLUGINS: Record<PrettierParser, string[]> = {
  babel: ["babel", "estree"],
  json: ["babel", "estree"],
  typescript: ["typescript", "estree"],
  css: ["postcss"],
  html: ["html", "postcss", "babel", "estree"],
};

async function formatWithPrettier(
  code: string,
  parser: PrettierParser,
  options: FormatOptions
) {
  const [prettier, plugins] = await Promise.all([
    loadPrettierModule<typeof import("prettier/standalone")>("standalone"),
    Promise.all(PLUGINS[parser].map((name) => loadPrettierModule<Plugin>(name))),
  ]);

  return prettier.format(code, {
    parser,
    plugins,
    tabWidth: options.indentSize,
    useTabs: options.useTabs,
    // Sans limite demandée, Prettier a tout de même besoin d'une largeur.
    printWidth: options.maxLineLength > 0 ? options.maxLineLength : 10_000,
  });
}

/** Lève une erreur lisible si le code ne s'analyse pas. */
export async function formatSource(
  source: string,
  languageId: string,
  options: FormatOptions
): Promise<string> {
  const code = source.replace(/\r\n/g, "\n");
  const parser = PRETTIER_PARSERS[languageId];

  let formatted: string;
  if (parser) {
    try {
      formatted = await formatWithPrettier(code, parser, options);
    } catch (error) {
      // Prettier joint un extrait du code à son message : la première ligne suffit
      // à l'écran, avec sa position.
      const reason =
        error instanceof Error ? error.message.split("\n")[0] : "erreur inconnue";
      throw new Error(`Code invalide : ${reason}`);
    }
  } else {
    const indent = options.useTabs ? "\t" : " ".repeat(options.indentSize);
    formatted = reindent(code.replace(/^\n+|\s+$/g, ""), indent);
  }

  if (options.removeTrailingWhitespace) {
    formatted = formatted
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");
  }

  formatted = formatted.replace(/\n+$/, "");
  return options.insertFinalNewline ? `${formatted}\n` : formatted;
}
