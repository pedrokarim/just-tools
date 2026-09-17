# tts-hotkey

Client Windows du raccourci « presse-papiers → synthèse vocale ». Il vit dans la
zone de notification, écoute un raccourci global, et envoie le contenu du
presse-papiers vers l'outil de synthèse vocale de Just Tools, qui démarre la
lecture tout seul.

```
Ctrl+Alt+S  →  presse-papiers  →  base64url  →  Edge  →  /tools/text-to-speech?b64=…&autoplay=1
```

Tout se règle dans une fenêtre de configuration : raccourci, voix, démarrage
avec Windows et installation. Voir **Fenêtre de configuration** plus bas.

## Compilation

```sh
cd tts-hotkey
cargo build --release
# binaire : target/release/tts-hotkey.exe
```

Le binaire est autonome : icône, manifeste et interface de configuration y sont
embarqués, aucune DLL à côté.

## Installation

```sh
.\tts-hotkey.exe --install
```

Ou, depuis l'interface : **Démarrage → Installer**.

L'installation ne demande aucun privilège administrateur. Elle :

1. copie le binaire dans `%LOCALAPPDATA%\Programs\tts-hotkey\` ;
2. crée **Synthèse vocale (Just Tools)** dans le menu Démarrer, où la recherche
   Windows le trouve.

`--uninstall` défait exactement cela, et retire l'entrée de démarrage. La
configuration et le journal sont conservés : ils vivent dans
`%APPDATA%\just-tools\` et représentent votre travail.

> Le démarrage automatique vise toujours la **copie installée**. Sans
> installation il pointerait vers `target\release\`, que le premier
> `cargo clean` fait disparaître.

## Premier lancement

```sh
.\tts-hotkey.exe
```

La fenêtre de configuration s'ouvre d'elle-même la première fois : c'est le seul
moment où l'on est certain que les réglages, et donc le démarrage automatique,
sont vus. Le fichier de configuration est créé au même instant dans :

```
%APPDATA%\just-tools\tts-hotkey.toml
```

Si la PWA Just Tools est déjà installée dans Edge, son `app_id` et son profil y
sont pré-remplis automatiquement.

Une icône reste ensuite dans la zone de notification.

> **L'icône est introuvable ?** Windows 11 masque par défaut les nouvelles
> icônes dans le débordement, derrière le chevron `^` de la barre des tâches.
> Faites-la glisser dans la zone visible, ou passez par *Paramètres →
> Personnalisation → Barre des tâches → Autres icônes de la barre d'état
> système*.

## Fenêtre de configuration

Elle s'ouvre par un **clic gauche sur l'icône**, par le menu (clic droit →
**Configuration…**), ou par `tts-hotkey.exe --settings`.

L'interface est une page rendue par WebView2, le moteur qui accompagne Edge –
déjà requis par ailleurs. Elle suit le thème clair ou sombre de Windows.

| Section | Contenu |
| --- | --- |
| Général | Raccourci (capturé au clavier), adresse du site, mode d'ouverture, PWA, profil et navigateur |
| Lecture | Lecture automatique, mode lecteur, débit, hauteur, volume, voix, langue, traitement du texte |
| Démarrage | Démarrage automatique et installation, avec leur état réel |
| Avancé | Déblocage de la lecture automatique, bip, accès au fichier et au journal |

**Tester maintenant** envoie le presse-papiers avec les réglages en cours
d'édition, sans les enregistrer.

Navigation au clavier : `Ctrl+1` à `Ctrl+4` entre les sections, `Échap` pour
annuler.

## Menu de l'icône

| Entrée | Effet |
| --- | --- |
| Configuration… | Ouvre la fenêtre de réglages |
| Lire le presse-papiers | Déclenche l'envoi sans passer par le raccourci |
| Recharger la configuration | Applique le fichier TOML sans redémarrer (réenregistre le raccourci si besoin) |
| Ouvrir le fichier de configuration | Ouvre le TOML dans l'éditeur associé |
| Ouvrir le journal | `%APPDATA%\just-tools\tts-hotkey.log` |
| Démarrer avec Windows | Bascule l'entrée de démarrage automatique |
| Quitter | Libère le raccourci et ferme |

## Ligne de commande

| Option | Effet |
| --- | --- |
| *(aucune)* | Mode résident : icône + raccourci global |
| `--settings` | Ouvre la fenêtre de configuration puis quitte |
| `--install` / `--uninstall` | Installation locale et raccourci du menu Démarrer |
| `--once` | Envoie le presse-papiers immédiatement puis quitte |
| `--text "…"` | Envoie un texte précis puis quitte |
| `--print-url ["…"]` | Affiche l'URL qui serait ouverte, sans rien lancer |
| `--list-apps` | Liste les PWA Edge installées et leur `app_id` |
| `--config-path` | Affiche le chemin du fichier de configuration |
| `--install-autostart` / `--uninstall-autostart` | Démarrage automatique |
| `--help` | Aide |

`--print-url` est l'outil de diagnostic à utiliser en premier : il montre
exactement ce qui serait envoyé, sans ouvrir de fenêtre.

## Configuration

Le fichier est réécrit par la fenêtre de configuration, commentaires compris. Il
reste modifiable à la main : utilisez ensuite **Recharger la configuration**
dans le menu de l'icône.

```toml
base_url = "https://just-tools.ascencia.re"
hotkey = "Ctrl+Alt+S"
launch_mode = "app"        # "app" | "pwa" | "tab"
autoplay = true
reader_mode = true         # interface « lecteur » épurée (&mini=1)
max_chars = 12000
collapse_whitespace = true
focus_window = true
send_activation_key = true
activation_delay_ms = 1200
window_title_match = "Synthèse Vocale"
beep = true
```

Réglages optionnels : `rate`, `pitch`, `volume`, `voice`, `lang`, `edge_path`,
`app_id`, `profile_directory`, `dehyphenate`.

### Raccourci

Modificateurs : `Ctrl`, `Alt`, `Shift`, `Win` (au moins un est requis).
Touches : `A`–`Z`, `0`–`9`, `F1`–`F24`, `Num0`–`Num9`, `Space`, `Enter`, `Tab`,
`Escape`, `Insert`, `Delete`, `Home`, `End`, `PageUp`, `PageDown`, flèches,
`Pause`, `PrintScreen`.

Exemples : `"Ctrl+Alt+S"`, `"Ctrl+Shift+F9"`, `"Win+Alt+L"`.

Si le raccourci est déjà pris par une autre application, l'enregistrement échoue
et une boîte de dialogue l'indique — choisissez-en un autre.

### Modes d'ouverture

| Mode | Commande Edge | Quand l'utiliser |
| --- | --- | --- |
| `app` *(défaut)* | `--app=<url>` | Fonctionne partout, aucune installation requise. Ouvre une fenêtre applicative sans barre d'adresse. Une nouvelle fenêtre par déclenchement. |
| `pwa` | `--app-id=<id> --app-launch-url-for-shortcuts-menu-item=<url>` | Réutilise la fenêtre de la PWA installée grâce à `launch_handler: focus-existing` du manifeste. Nécessite `app_id` (voir `--list-apps`). |
| `tab` | `<url>` | Onglet classique. |

Le mode `pwa` est le plus agréable à l'usage (une seule fenêtre, réutilisée, et
la lecture automatique n'est jamais bloquée puisque le document n'est pas
rechargé), mais il dépend d'un commutateur interne de Chromium. En cas de doute,
restez en `app`.

## Pourquoi une frappe est envoyée après le lancement

Chromium refuse `speechSynthesis.speak()` sur un document qui n'a jamais reçu
d'interaction utilisateur (politique d'autoplay, depuis Chrome 71). Un site ne
peut pas contourner ça — mais un programme natif, si : après le lancement, le
client met la fenêtre au premier plan et envoie une frappe **F24** via
`SendInput`. Comme il s'agit d'une vraie frappe au niveau du système, Chromium la
compte comme geste utilisateur et la lecture démarre.

F24 est utilisée parce qu'aucun clavier courant ne la possède : aucun risque
d'effet de bord dans la page. Si vous préférez vous en passer, mettez
`send_activation_key = false` — la page affichera alors « Cliquez pour lancer la
lecture » quand le navigateur bloque, et n'importe quel clic suffira.

Ordre de robustesse, du meilleur au pire :

1. `launch_mode = "pwa"` avec la fenêtre déjà ouverte → le document conserve son
   interaction passée, rien à débloquer ;
2. frappe F24 après mise au premier plan → débloque un document neuf ;
3. superposition « Cliquez pour lancer la lecture » → dernier recours, un clic.

## Limites connues

- **Longueur** : la ligne de commande Windows est limitée à 32 767 caractères.
  `max_chars = 12000` laisse une marge confortable ; au-delà le texte est tronqué
  (l'événement est écrit dans le journal).
- **Edge uniquement** : le lancement passe par `msedge.exe`. Pour un autre
  navigateur Chromium, renseignez `edge_path` avec son exécutable — les
  commutateurs `--app=` et `--app-id=` sont les mêmes.
- **Fenêtre par déclenchement** en mode `app` : chaque appui ouvre une fenêtre.
  Passez en `pwa` pour n'en avoir qu'une.
- **WebView2 requis** pour la fenêtre de configuration. Il accompagne Edge et
  est présent d'office sur Windows 11 ; le raccourci, lui, fonctionne sans.
- **Raccourci confisqué** : certaines combinaisons `Win+…` sont réservées par
  le système (`Win+L` verrouille la session) et n'atteignent jamais un
  programme, quel qu'il soit.

## Développement

```sh
cargo test          # analyse du raccourci, préparation du texte, rendu du TOML, URL
cargo clippy
cargo run -- --print-url "Bonjour"
cargo run -- --settings      # fenêtre de configuration seule
```

En profil `debug`, le binaire garde une console (journal visible directement).
En `release`, il est fenêtré et journalise uniquement dans le fichier.

### Organisation

| Fichier | Rôle |
| --- | --- |
| `src/main.rs` | Boucle de messages, raccourci global, zone de notification |
| `src/settings.rs` | Fenêtre hôte Win32 et pont vers la page de configuration |
| `assets/settings.html` | L'interface : structure, styles et comportement |
| `src/install.rs` | Copie locale, raccourci du menu Démarrer, désinstallation |
| `src/config.rs` | Lecture, écriture et rendu commenté du TOML |
| `build.rs` | Icône, manifeste et métadonnées embarqués dans l'exécutable |

L'interface dialogue avec l'hôte par messages : la page émet
`postMessage({type, …})`, l'hôte répond en appelant `window.host.*`. Ajouter un
réglage demande donc trois points de contact – le champ dans la page, sa lecture
dans `collect()`, et son écriture dans `Config`.

Le manifeste (`assets/tts-hotkey.manifest`) déclare la prise en charge de la
densité d'écran et les contrôles communs ; sans lui, la fenêtre est floue sur un
écran à forte densité.
