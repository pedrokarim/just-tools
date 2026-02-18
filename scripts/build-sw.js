const fs = require('fs');
const path = require('path');

const swFile = path.join(__dirname, '..', 'public', 'sw.js');
const versionFile = path.join(__dirname, '..', 'public', 'version.json');

// Lire la version
let versionData = {
  version: '1.0.0',
  buildTime: 'unknown',
  commitSha: 'unknown',
  gitTag: 'none',
  cacheVersion: 'unknown',
};
try {
  if (fs.existsSync(versionFile)) {
    versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
  }
} catch (error) {
  console.warn('Erreur lors de la lecture du fichier version.json:', error.message);
}

const shortSha =
  versionData.commitSha && versionData.commitSha !== 'unknown'
    ? versionData.commitSha.substring(0, 8)
    : 'unknown';

// Prioriser la version de cache générée dans update-version.js
const cacheVersion =
  versionData.cacheVersion && versionData.cacheVersion !== 'unknown'
    ? versionData.cacheVersion
    : `${versionData.version}-${versionData.gitTag || 'none'}-${shortSha}`;

const appVersionLabel = `${versionData.version} (${versionData.gitTag || 'none'} - ${shortSha})`;

// Lire le service worker
let swContent = fs.readFileSync(swFile, 'utf8');

// Remplacer la version du cache
swContent = swContent.replace(
  /const CACHE_NAME = 'just-tools-[^']*';/,
  `const CACHE_NAME = 'just-tools-${cacheVersion}';`
);
swContent = swContent.replace(/const APP_VERSION = '[^']*';/, `const APP_VERSION = '${appVersionLabel}';`);

// Écrire le service worker mis à jour
fs.writeFileSync(swFile, swContent);

console.log('Service Worker mis à jour avec la version:', appVersionLabel);
console.log('Nom de cache SW:', `just-tools-${cacheVersion}`);
