/**
 * Copie les fichiers de Prettier dans `public/vendor/prettier/`, tels que publiés.
 *
 * Ils ne passent pas par le bundler : le minifieur de Next casse `plugins/babel`
 * (déjà minifié), et l'outil plantait en production sur « ha is not defined »,
 * alors que tous les tests passaient. Servis tels quels, ils se chargent à la
 * demande par un `import()` natif (voir `src/lib/prettier-loader.ts`).
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = path.join(root, "node_modules", "prettier");
const target = path.join(root, "public", "vendor", "prettier");

const FILES = [
  ["standalone.mjs", "standalone.mjs"],
  ["plugins/babel.mjs", "babel.mjs"],
  ["plugins/estree.mjs", "estree.mjs"],
  ["plugins/typescript.mjs", "typescript.mjs"],
  ["plugins/postcss.mjs", "postcss.mjs"],
  ["plugins/html.mjs", "html.mjs"],
];

fs.mkdirSync(target, { recursive: true });
for (const [from, to] of FILES) {
  fs.copyFileSync(path.join(source, from), path.join(target, to));
}
console.log(`Prettier copié dans public/vendor/prettier (${FILES.length} fichiers)`);
