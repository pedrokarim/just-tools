/**
 * Génère public/sw.js à partir de scripts/sw-template.js.
 *
 * Auparavant, ce script réécrivait public/sw.js *sur place* — un fichier suivi
 * par Git. Chaque build laissait donc le dépôt sale et un diff parasite dans
 * les commits. Le gabarit est la source, la sortie est ignorée par Git.
 */

const fs = require("fs");
const path = require("path");
const { getVersionInfo } = require("./version");

const info = getVersionInfo();
const templateFile = path.join(__dirname, "sw-template.js");
const outputFile = path.join(__dirname, "..", "public", "sw.js");

const cacheName = `just-tools-${info.cacheVersion}`;

const banner = [
  "// Fichier généré — NE PAS ÉDITER.",
  "// Source : scripts/sw-template.js — régénéré par scripts/build-sw.js à chaque build.",
  `// Version ${info.label}, généré le ${new Date().toISOString()}.`,
].join("\n");

const output = fs
  .readFileSync(templateFile, "utf8")
  .replace("__BANNER__", banner)
  .replace("__CACHE_NAME__", cacheName)
  .replace("__APP_VERSION__", info.label);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, output);

console.log(`[sw] ${info.label} — cache « ${cacheName} » → public/sw.js`);
