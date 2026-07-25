# tts-hotkey

Client Windows du raccourci « presse-papiers → synthèse vocale ». Il vit dans la
zone de notification, écoute un raccourci global, et envoie le contenu du
presse-papiers vers l'outil de synthèse vocale de Just Tools, qui démarre la
lecture tout seul.

```
Ctrl+Alt+S  →  presse-papiers  →  base64url  →  Edge  →  /tools/text-to-speech?b64=…&autoplay=1
```

## Compilation

```sh
cd tts-hotkey
cargo build --release
# binaire : target/release/tts-hotkey.exe
```

Le binaire est autonome (icône embarquée, aucune DLL à côté). Copiez-le où vous
voulez, par exemple `%LOCALAPPDATA%\Programs\tts-hotkey\`.

## Premier lancement

```sh
.\tts-hotkey.exe
```

Une icône apparaît dans la zone de notification. Le fichier de configuration est
créé au premier démarrage dans :

```
%APPDATA%\just-tools\tts-hotkey.toml
```

Si la PWA Just Tools est déjà installée dans Edge, son `app_id` et son profil y
sont pré-remplis automatiquement.

Pour démarrer avec Windows : menu de l'icône → **Démarrer avec Windows**
(ou `tts-hotkey.exe --install-autostart`).

## Menu de l'icône

| Entrée | Effet |
| --- | --- |
| Lire le presse-papiers | Déclenche l'envoi sans passer par le raccourci |
| Ouvrir la configuration | Ouvre le fichier TOML dans l'éditeur associé |
| Recharger la configuration | Applique le fichier sans redémarrer (réenregistre le raccourci si besoin) |
| Ouvrir le journal | `%APPDATA%\just-tools\tts-hotkey.log` |
| Démarrer avec Windows | Bascule l'entrée de démarrage automatique |
| Quitter | Libère le raccourci et ferme |

## Ligne de commande

| Option | Effet |
| --- | --- |
| *(aucune)* | Mode résident : icône + raccourci global |
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

## Développement

```sh
cargo test          # analyse du raccourci, préparation du texte, construction d'URL
cargo clippy
cargo run -- --print-url "Bonjour"
```

En profil `debug`, le binaire garde une console (journal visible directement).
En `release`, il est fenêtré et journalise uniquement dans le fichier.
