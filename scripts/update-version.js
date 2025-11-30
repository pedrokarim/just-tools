const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '..', 'public', 'version.json');

// Lire la version actuelle
let versionData = { version: '1.0.0', buildTime: new Date().toISOString(), commitSha: 'unknown' };

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
versionData.commitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'unknown';

// Écrire le fichier mis à jour
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

console.log('Version mise à jour:', versionData);
