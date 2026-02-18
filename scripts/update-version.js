const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionFile = path.join(__dirname, '..', 'public', 'version.json');
const packageFile = path.join(__dirname, '..', 'package.json');

function tryGit(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function sanitize(value) {
  const normalized = String(value || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || 'unknown';
}

let packageVersion = '1.0.0';
try {
  if (fs.existsSync(packageFile)) {
    const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    packageVersion = packageData.version || packageVersion;
  }
} catch (error) {
  console.warn('Erreur lors de la lecture du package.json:', error.message);
}

// Lire la version actuelle
let versionData = {
  version: packageVersion,
  buildTime: new Date().toISOString(),
  commitSha: 'unknown',
  gitTag: 'none',
  cacheVersion: 'unknown',
};

try {
  if (fs.existsSync(versionFile)) {
    const existingData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    versionData = { ...versionData, ...existingData };
  }
} catch (error) {
  console.warn('Erreur lors de la lecture du fichier version.json existant:', error.message);
}

// Mettre à jour avec les nouvelles valeurs
versionData.buildTime = new Date().toISOString();
versionData.version = process.env.APP_VERSION || versionData.version || packageVersion;
versionData.commitSha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  tryGit('git rev-parse HEAD') ||
  'unknown';

const shortSha =
  versionData.commitSha && versionData.commitSha !== 'unknown'
    ? versionData.commitSha.substring(0, 8)
    : 'unknown';

const envTag =
  process.env.VERSION_TAG ||
  (process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : null) ||
  null;

versionData.gitTag =
  envTag ||
  tryGit('git describe --tags --exact-match') ||
  tryGit('git describe --tags --abbrev=0') ||
  'none';

const buildStamp = Date.now().toString(36);
versionData.cacheVersion = [
  sanitize(versionData.version),
  sanitize(versionData.gitTag),
  sanitize(shortSha),
  sanitize(buildStamp),
].join('-');

// Écrire le fichier mis à jour
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

console.log('Version mise à jour:', versionData);
