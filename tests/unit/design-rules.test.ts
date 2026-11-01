import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * Les règles de `docs/DESIGN.md`, exécutées.
 *
 * Une règle écrite seulement dans un document finit contournée sans que personne
 * ne le voie. Celles-ci se vérifient sur le code, donc à chaque lancement des
 * tests.
 *
 * Une exception porte toujours sa raison, et un test vérifie qu'aucune n'est
 * devenue inutile : sans cela, la liste grossit seule et finit par tout autoriser.
 */

const ROOT = join(process.cwd(), "src");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx$/.test(name) ? [path] : [];
  });
}

const files = sourceFiles(ROOT).map((path) => ({
  name: relative(ROOT, path).split(sep).join("/"),
  text: readFileSync(path, "utf8"),
}));

/** Les fichiers où une couleur en dur est une donnée de l'outil, pas de l'interface. */
const COLOR_EXCEPTIONS: Record<string, string> = {};

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const HARD_CODED_COLOR = new RegExp(
  `\\b(?:bg|text|border|ring|from|via|to|fill|stroke|divide|outline|shadow|accent|caret|decoration)-(?:(?:${PALETTE})-\\d{2,3}|white|black)\\b`
);

const EMOJI = /\p{Extended_Pictographic}/u;
const ALLOWED_PICTOGRAPHS = /[©®™]/gu;

/** Retire les commentaires : on y parle des règles sans les enfreindre. */
function stripComments(text: string) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

describe("design rules", () => {
  it("should not use hard-coded palette colors in the interface", () => {
    const offenders = files
      .filter(({ name }) => !(name in COLOR_EXCEPTIONS))
      .filter(({ text }) => HARD_CODED_COLOR.test(stripComments(text)))
      .map(({ name }) => name);

    expect(offenders).toEqual([]);
  });

  it("should keep every color exception justified and necessary", () => {
    for (const [name, reason] of Object.entries(COLOR_EXCEPTIONS)) {
      const file = files.find((item) => item.name === name);

      expect(reason.length).toBeGreaterThan(20);
      expect(file, `${name} n'existe plus`).toBeDefined();
      expect(HARD_CODED_COLOR.test(stripComments(file!.text))).toBe(true);
    }
  });

  it("should not use emoji as icons", () => {
    const offenders = files
      .filter(({ text }) =>
        EMOJI.test(stripComments(text).replace(ALLOWED_PICTOGRAPHS, ""))
      )
      .map(({ name }) => name);

    expect(offenders).toEqual([]);
  });

  it("should never animate every property", () => {
    const offenders = files
      .filter(
        ({ text }) =>
          /\btransition-all\b/.test(text) ||
          /\btransition:\s*["']?all\b/.test(text)
      )
      .map(({ name }) => name);

    expect(offenders).toEqual([]);
  });

  it("should not use gradients outside the primary button", () => {
    const offenders = files
      .filter(({ name }) => name !== "components/ui/button.tsx")
      .filter(
        ({ name }) => !(name in COLOR_EXCEPTIONS)
      )
      .filter(({ text }) =>
        /\bbg-(?:gradient|linear|radial|conic)-/.test(stripComments(text))
      )
      .map(({ name }) => name);

    expect(offenders).toEqual([]);
  });
});
