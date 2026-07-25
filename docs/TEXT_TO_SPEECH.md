# Synthèse vocale — pilotage par URL et lecteur

Route : `/tools/text-to-speech` (groupe `(fullscreen)` : hauteur fixe, aucun
défilement de page sur grand écran).

## Paramètres d'URL

L'outil lit ses paramètres **une seule fois au montage**, puis les retire de la
barre d'adresse (`history.replaceState`) : un rafraîchissement ne relit donc pas
un texte périmé.

| Paramètre | Valeurs | Effet |
| --- | --- | --- |
| `text` (ou `t`) | texte percent-encodé | Texte à charger |
| `b64` | base64url d'UTF-8, sans padding | Idem, format compact — prioritaire sur `text` |
| `autoplay` (ou `play`) | `1`, `true`, `yes`, `on`, `oui`, ou vide | Démarre la lecture à l'arrivée |
| `mini` | `1` | Interface « lecteur » épurée |
| `append` | `1` | Ajoute à la suite du texte existant au lieu de le remplacer |
| `rate` | 0.5 – 2 | Vitesse |
| `pitch` | 0.5 – 2 | Hauteur |
| `volume` | 0 – 1 | Volume |
| `voice` | nom exact ou partiel | Voix (ex. `Denise`, `Natural`) |
| `lang` | code BCP 47 | Langue (ex. `fr-FR`), utilisée si `voice` ne donne rien |

Exemples :

```
/tools/text-to-speech?text=Bonjour%20tout%20le%20monde&autoplay=1
/tools/text-to-speech?b64=Qm9uam91cg&autoplay=1&mini=1&rate=1.2
/tools/text-to-speech?b64=…&autoplay=1&voice=Denise&volume=0.8
```

Le bouton **« Copier le lien de lecture auto »** (onglet Réglages) génère ce
format à partir du texte courant.

### Pourquoi `b64` plutôt que `text`

Le percent-encoding coûte jusqu'à 9 caractères par caractère accentué
(`é` → `%C3%A9`), là où le base64url coûte 1,33× sur tout le texte. Pour du
français, `b64` est environ 3 fois plus compact — ce qui compte quand l'URL passe
par une ligne de commande Windows (32 767 caractères maximum).

### Surcharges de session

`rate`, `pitch`, `volume`, `voice` et `lang` fournis par l'URL **ne modifient pas
les réglages enregistrés**. Ils sont signalés par un encart dans l'onglet
Réglages ; toucher un curseur lève la surcharge correspondante, et la croix les
lève toutes.

## Lecteur : ce que fait la Web Speech API, et ce qu'il a fallu construire

La `SpeechSynthesis` du navigateur n'offre ni position, ni durée, ni
déplacement ; et `speechSynthesis.pause()` est ignoré par Chromium sur les voix
distantes (les voix « Natural » d'Edge). Le lecteur
([`src/hooks/use-tts-player.ts`](../src/hooks/use-tts-player.ts)) contourne les
trois limites :

- **Découpage** : le texte est coupé en segments (fins de phrase, puis coupures
  douces sur ponctuation faible à ~240 caractères). Les offsets absolus sont
  conservés, donc toute position du texte est atteignable.
- **Position** : alimentée par les évènements `boundary` quand la voix en émet, et
  interpolée entre deux évènements à partir du débit mesuré. Les voix sans
  `boundary` progressent donc quand même.
- **Pause / reprise / seek** : implémentés par `cancel()` puis relecture depuis
  l'offset voulu. C'est identique sur toutes les voix, locales ou distantes. La
  reprise repart au début du mot courant.
- **Durée** : estimée en caractères par seconde (14,5 × vitesse au départ),
  affinée pendant la lecture réelle. Elle est affichée précédée de `~` : c'est une
  estimation, jamais une mesure.
- **Évènements en vol** : un compteur de génération invalide les rappels des
  utterances annulées, qui arrivent en différé après un `cancel()`.

Raccourcis clavier : `Ctrl+Entrée` lire, `Ctrl+Espace` pause/reprise,
`Ctrl+Échap` arrêter, `Ctrl+←/→` reculer/avancer de 10 s.

## Lecture automatique et politique d'autoplay

Chromium refuse `speechSynthesis.speak()` sur un document qui n'a jamais reçu
d'interaction utilisateur. Trois parades, de la plus transparente à la plus
visible :

1. **PWA déjà ouverte** — le manifeste déclare
   `launch_handler.client_mode = ["focus-existing", "auto"]`. Un nouveau
   lancement ne recharge pas la fenêtre : l'URL arrive dans
   [`src/components/launch-handler.tsx`](../src/components/launch-handler.tsx) via
   `launchQueue`, qui route vers la bonne page ou émet l'évènement
   `just-tools:launch` que l'outil écoute. Le document conservant son interaction
   passée, la lecture démarre sans obstacle.
2. **Frappe système** — le client [`tts-hotkey`](../tts-hotkey/README.md) envoie
   une frappe F24 après avoir mis la fenêtre au premier plan. Une vraie frappe au
   niveau du système compte comme geste utilisateur.
3. **Superposition** — si la lecture est refusée malgré tout (erreur
   `not-allowed`, ou aucun démarrage au bout de 1,2 s), l'outil affiche
   « Le navigateur attend une interaction ». N'importe quel clic ou touche relance
   la lecture là où elle devait commencer.

## Client de raccourci clavier

Le sous-projet Rust [`tts-hotkey/`](../tts-hotkey/README.md) enregistre un
raccourci global (`Ctrl+Alt+S` par défaut), lit le presse-papiers et ouvre cette
URL dans Edge. Cas d'usage d'origine : récupérer par OCR le texte affiché à
l'écran, le copier, puis le faire lire d'une frappe.
