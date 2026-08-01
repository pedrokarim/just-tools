/**
 * Source de vérité de la version : le champ `version` de package.json.
 *
 * Le tag Git `vX.Y.Z` en est le miroir — c'est `/release` qui bosse : il bump
 * package.json, commit, pose le tag, pousse. On ne lit donc jamais le tag pour
 * *décider* de la version, seulement pour la confirmer et signaler une dérive.
 *
 * Cette direction n'est pas un choix esthétique : le Dockerfile exclut `.git`
 * (.dockerignore), donc aucune commande git ne répond pendant le build de
 * l'image. Seul package.json y est présent. Toute info tirée de Git est un
 * bonus qui doit se dégrader proprement.
 *
 * Utilisé par scripts/update-version.js, scripts/build-sw.js et next.config.ts.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.join(__dirname, "..");

function tryGit(command) {
  try {
    return execSync(command, {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

/** Rend une valeur utilisable dans un nom de cache (CacheStorage). */
function sanitize(value) {
  const normalized = String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "unknown";
}

function readPackageVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
    );
    if (pkg.version) return pkg.version;
  } catch (error) {
    console.warn("[version] package.json illisible :", error.message);
  }
  return "0.0.0";
}

function getVersionInfo() {
  // APP_VERSION permet de forcer la version depuis la CI sans toucher au dépôt.
  const version = process.env.APP_VERSION || readPackageVersion();

  // Distinguer « Git absent » (Docker, tarball) de « ce commit n'est pas
  // taggé » : sans ça, les deux cas remonteraient le même signal et on
  // avertirait à tort.
  const gitAvailable = tryGit("git rev-parse --git-dir") !== null;

  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    tryGit("git rev-parse HEAD") ||
    null;

  const shortSha = commitSha ? commitSha.substring(0, 8) : null;

  // Le tag attendu se déduit de la version ; on ne consulte Git que pour voir
  // si la réalité correspond.
  const expectedTag = `v${version}`;
  const actualTag =
    process.env.VERSION_TAG ||
    (process.env.GITHUB_REF_TYPE === "tag"
      ? process.env.GITHUB_REF_NAME
      : null) ||
    tryGit("git describe --tags --exact-match") ||
    null;

  // true = HEAD est la release attendue ; false = dérive ou commits en cours ;
  // null = invérifiable faute d'historique Git.
  const canVerify = gitAvailable || actualTag !== null;
  const taggedRelease = canVerify ? actualTag === expectedTag : null;

  // Volontairement déterministe : même commit et même version ⇒ même nom de
  // cache. L'ancienne formule y injectait `Date.now()`, ce qui invalidait le
  // cache de tous les visiteurs à chaque rebuild, même sans changement.
  const cacheVersion = [sanitize(version), sanitize(shortSha || "nogit")].join(
    "-"
  );

  return {
    version,
    expectedTag,
    actualTag,
    taggedRelease,
    gitAvailable,
    commitSha,
    shortSha,
    cacheVersion,
    // Libellé lisible : « 2.2.1 (fa4dde09) », ou « 2.2.1 » sans Git.
    label: shortSha ? `${version} (${shortSha})` : version,
  };
}

module.exports = { getVersionInfo, sanitize };
