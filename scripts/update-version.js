/**
 * Génère public/version.json à partir de scripts/version.js.
 *
 * Le fichier est réécrit intégralement. L'ancienne version fusionnait le
 * version.json existant par-dessus les valeurs fraîches
 * (`{ ...nouvelles, ...existantes }`) : l'ancien l'emportait, et la version
 * est restée figée à 1.0.0 pendant que package.json avançait jusqu'à 2.2.1.
 */

const fs = require("fs");
const path = require("path");
const { getVersionInfo } = require("./version");

const info = getVersionInfo();
const versionFile = path.join(__dirname, "..", "public", "version.json");

const payload = {
  version: info.version,
  buildTime: new Date().toISOString(),
  commitSha: info.commitSha,
  gitTag: info.actualTag,
  cacheVersion: info.cacheVersion,
};

fs.mkdirSync(path.dirname(versionFile), { recursive: true });
fs.writeFileSync(versionFile, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`[version] ${info.label} → public/version.json`);

if (info.taggedRelease === false) {
  console.warn(
    info.actualTag
      ? `[version] ⚠ HEAD porte ${info.actualTag} alors que package.json annonce ${info.version} ` +
          `(tag attendu ${info.expectedTag}) — dérive entre package.json et les tags.`
      : `[version] Build hors release : commits en cours depuis ${info.expectedTag}.`
  );
} else if (info.taggedRelease === null) {
  console.log("[version] Tag non vérifiable (pas d'historique Git ici).");
}
