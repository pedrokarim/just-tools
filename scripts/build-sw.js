const fs = require('fs');
const path = require('path');

const swFile = path.join(__dirname, '..', 'public', 'sw.js');
const versionFile = path.join(__dirname, '..', 'public', 'version.json');

// Lire la version
let versionData = { version: '1.0.0', buildTime: 'unknown', commitSha: 'unknown' };
try {
  if (fs.existsSync(versionFile)) {
    versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
  }
} catch (error) {
  console.warn('Erreur lors de la lecture du fichier version.json:', error.message);
}

// Générer le nom du cache basé sur la version
const cacheVersion = `${versionData.version}-${versionData.commitSha.substring(0, 8)}`;

// Lire le service worker
let swContent = fs.readFileSync(swFile, 'utf8');

// Remplacer la version du cache
swContent = swContent.replace(
  /const CACHE_NAME = 'just-tools-[^']*';/,
  `const CACHE_NAME = 'just-tools-${cacheVersion}';`
);

// Écrire le service worker mis à jour
fs.writeFileSync(swFile, swContent);

console.log('Service Worker mis à jour avec la version:', cacheVersion);
