/**
 * `bun run version:show` — dit d'où vient la version et si le dépôt est
 * cohérent, sans rien écrire.
 */

const { getVersionInfo } = require("./version");

const info = getVersionInfo();

console.log("");
console.log(`  Version      ${info.version}   (source : package.json)`);
console.log(`  Tag attendu  ${info.expectedTag}`);
console.log(`  Tag du HEAD  ${info.actualTag ?? "— (aucun tag sur ce commit)"}`);
console.log(`  Commit       ${info.shortSha ?? "— (pas d'historique Git)"}`);
console.log(`  Cache SW     just-tools-${info.cacheVersion}`);
console.log("");

if (info.taggedRelease === true) {
  console.log(`  ✓ HEAD est la release ${info.expectedTag}.`);
} else if (info.taggedRelease === false && info.actualTag) {
  console.log(
    `  ⚠ HEAD porte ${info.actualTag}, pas ${info.expectedTag} — dérive entre package.json et les tags.`
  );
} else if (info.taggedRelease === false) {
  console.log(
    `  · Commits en cours depuis ${info.expectedTag}. Lance /release pour publier.`
  );
} else {
  console.log("  · Pas d'historique Git ici : cohérence des tags non vérifiée.");
}
console.log("");
