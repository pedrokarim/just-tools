//! Configuration lue depuis `%APPDATA%\just-tools\tts-hotkey.toml`.

use std::fs;
use std::path::PathBuf;

use anyhow::{Context, Result, anyhow};
use serde::{Deserialize, Serialize};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    HOT_KEY_MODIFIERS, MOD_ALT, MOD_CONTROL, MOD_NOREPEAT, MOD_SHIFT, MOD_WIN,
};

/// Comment ouvrir l'outil dans Microsoft Edge.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum LaunchMode {
    /// PWA installée, identifiée par son `app_id` (fenêtre réutilisée).
    Pwa,
    /// Fenêtre applicative sans barre d'adresse (`--app=`), sans installation.
    App,
    /// Onglet classique du navigateur.
    Tab,
}

impl LaunchMode {
    /// Valeur telle qu'écrite dans le fichier de configuration.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Pwa => "pwa",
            Self::App => "app",
            Self::Tab => "tab",
        }
    }
}

/// Échappe une chaîne pour un littéral TOML de base.
///
/// Indispensable pour `edge_path`, dont les antislash doivent être doublés.
fn quote(value: &str) -> String {
    let mut out = String::with_capacity(value.len() + 2);
    out.push('"');

    for character in value.chars() {
        match character {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            _ => out.push(character),
        }
    }

    out.push('"');
    out
}

/// Écrit un flottant en garantissant le point décimal : `1` serait relu comme
/// un entier TOML et refusé pour un champ flottant.
fn number(value: f32) -> String {
    if value.fract() == 0.0 {
        format!("{value:.1}")
    } else {
        format!("{value}")
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Config {
    /// Racine du site, ou URL complète de l'outil.
    pub base_url: String,
    /// Raccourci global, par exemple « Ctrl+Alt+S » ou « Ctrl+Shift+F9 ».
    pub hotkey: String,
    pub launch_mode: LaunchMode,
    /// Chemin de msedge.exe ; détecté automatiquement si absent.
    pub edge_path: Option<String>,
    /// Identifiant de la PWA installée (voir edge://apps), requis en mode `pwa`.
    pub app_id: Option<String>,
    /// Profil Edge à utiliser, par exemple « Default » ou « Profile 1 ».
    pub profile_directory: Option<String>,

    /// Démarrer la lecture dès l'ouverture.
    pub autoplay: bool,
    /// Ouvrir l'interface « lecteur » épurée.
    pub reader_mode: bool,
    pub rate: Option<f32>,
    pub pitch: Option<f32>,
    pub volume: Option<f32>,
    /// Nom exact ou partiel d'une voix (« Denise », « Natural »…).
    pub voice: Option<String>,
    /// Langue forcée (« fr-FR », « en-US »…).
    pub lang: Option<String>,

    /// Longueur maximale envoyée ; au-delà le texte est tronqué.
    pub max_chars: usize,
    /// Aplatir les retours à la ligne et espaces multiples (utile après un OCR).
    pub collapse_whitespace: bool,
    /// Recoller les mots coupés en fin de ligne (« exem-\nple » → « exemple »).
    pub dehyphenate: bool,

    /// Mettre la fenêtre au premier plan après le lancement.
    pub focus_window: bool,
    /// Envoyer une frappe inoffensive pour débloquer la politique d'autoplay
    /// de Chromium (une vraie frappe clavier compte comme geste utilisateur).
    pub send_activation_key: bool,
    /// Délai avant la mise au premier plan et la frappe, en millisecondes.
    pub activation_delay_ms: u64,
    /// Fragment de titre identifiant la fenêtre de l'outil.
    pub window_title_match: String,
    /// Bip système à chaque déclenchement.
    pub beep: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            base_url: "https://just-tools.ascencia.re".to_string(),
            hotkey: "Ctrl+Alt+S".to_string(),
            launch_mode: LaunchMode::App,
            edge_path: None,
            app_id: None,
            profile_directory: None,
            autoplay: true,
            reader_mode: true,
            rate: None,
            pitch: None,
            volume: None,
            voice: None,
            lang: None,
            max_chars: 12_000,
            collapse_whitespace: true,
            dehyphenate: false,
            focus_window: true,
            send_activation_key: true,
            activation_delay_ms: 1_200,
            window_title_match: "Synthèse Vocale".to_string(),
            beep: true,
        }
    }
}

/// Dossier de configuration : `%APPDATA%\just-tools`.
pub fn config_dir() -> Result<PathBuf> {
    let base = dirs::config_dir().ok_or_else(|| anyhow!("dossier de configuration introuvable"))?;
    Ok(base.join("just-tools"))
}

pub fn config_path() -> Result<PathBuf> {
    Ok(config_dir()?.join("tts-hotkey.toml"))
}

pub fn log_path() -> Result<PathBuf> {
    Ok(config_dir()?.join("tts-hotkey.log"))
}

impl Config {
    /// Charge la configuration, en créant un fichier commenté si besoin.
    pub fn load_or_create(detected: Option<(String, String)>) -> Result<Self> {
        let path = config_path()?;

        if !path.exists() {
            // Première exécution : si une PWA Just Tools est installée, son
            // `app_id` et son profil sont repris — `launch_mode` reste sur
            // « app », qui fonctionne partout.
            let mut initial = Self::default();
            if let Some((app_id, profile)) = detected {
                initial.app_id = Some(app_id);
                initial.profile_directory = Some(profile);
            }
            initial.save()?;
        }

        let raw =
            fs::read_to_string(&path).with_context(|| format!("lecture de {}", path.display()))?;

        toml::from_str(&raw).with_context(|| format!("{} est invalide", path.display()))
    }

    /// Écrit la configuration, en conservant les commentaires explicatifs.
    pub fn save(&self) -> Result<()> {
        let path = config_path()?;
        let dir = config_dir()?;

        fs::create_dir_all(&dir).with_context(|| format!("création de {}", dir.display()))?;
        fs::write(&path, self.render())
            .with_context(|| format!("écriture de {}", path.display()))?;

        Ok(())
    }

    /// Rend la configuration en TOML commenté.
    ///
    /// La sérialisation directe par serde produirait un fichier exact mais
    /// muet : les réglages seraient illisibles hors de la fenêtre de
    /// configuration. On écrit donc le fichier à la main, ce qui permet aussi
    /// de laisser en commentaire les réglages optionnels restés vides.
    pub fn render(&self) -> String {
        /// Réglage facultatif : présent, ou montré en exemple commenté.
        fn optional(name: &str, value: Option<String>, example: &str) -> String {
            match value {
                Some(value) => format!("{name} = {value}\n"),
                None => format!("# {name} = {example}\n"),
            }
        }

        let mut out = String::with_capacity(2048);

        out.push_str(
            "# Configuration de tts-hotkey\n\
             #\n\
             # Le raccourci envoie le contenu du presse-papiers vers la synthèse vocale\n\
             # de Just Tools, avec lecture automatique.\n\
             #\n\
             # Ce fichier est réécrit par la fenêtre de configuration (icône de la zone\n\
             # de notification → « Configuration… »). Il reste modifiable à la main :\n\
             # utilisez ensuite « Recharger la configuration » dans le menu de l'icône.\n\
             \n\
             # Racine du site (ou URL complète de l'outil).\n",
        );
        out.push_str(&format!("base_url = {}\n\n", quote(&self.base_url)));

        out.push_str(
            "# Raccourci global. Modificateurs : Ctrl, Alt, Shift, Win.\n\
             # Exemples : \"Ctrl+Alt+S\", \"Ctrl+Shift+F9\", \"Win+Alt+L\".\n",
        );
        out.push_str(&format!("hotkey = {}\n\n", quote(&self.hotkey)));

        out.push_str(
            "# Mode d'ouverture :\n\
             #   \"app\" = fenêtre applicative Edge (--app=), fonctionne sans rien installer\n\
             #   \"pwa\" = PWA installée, réutilise la fenêtre déjà ouverte (renseigner app_id)\n\
             #   \"tab\" = onglet normal du navigateur\n",
        );
        out.push_str(&format!(
            "launch_mode = {}\n\n",
            quote(self.launch_mode.as_str())
        ));

        out.push_str(
            "# Identifiant de la PWA installée, requis pour launch_mode = \"pwa\".\n\
             # Il se lit dans edge://apps (ou via `tts-hotkey.exe --list-apps`).\n",
        );
        out.push_str(&optional(
            "app_id",
            self.app_id.as_deref().map(quote),
            "\"abcdefghijklmnopabcdefghijklmnop\"",
        ));
        out.push('\n');

        out.push_str("# Chemin de msedge.exe si la détection automatique échoue.\n");
        out.push_str(&optional(
            "edge_path",
            self.edge_path.as_deref().map(quote),
            "\"C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe\"",
        ));
        out.push('\n');

        out.push_str("# Profil Edge à utiliser.\n");
        out.push_str(&optional(
            "profile_directory",
            self.profile_directory.as_deref().map(quote),
            "\"Default\"",
        ));
        out.push('\n');

        out.push_str(
            "# --- Lecture ---------------------------------------------------------------\n",
        );
        out.push_str(&format!("autoplay = {}\n", self.autoplay));
        out.push_str(&format!("reader_mode = {}\n", self.reader_mode));
        out.push_str(&optional("rate", self.rate.map(number), "1.2"));
        out.push_str(&optional("pitch", self.pitch.map(number), "1.0"));
        out.push_str(&optional("volume", self.volume.map(number), "1.0"));
        out.push_str(&optional(
            "voice",
            self.voice.as_deref().map(quote),
            "\"Denise\"",
        ));
        out.push_str(&optional(
            "lang",
            self.lang.as_deref().map(quote),
            "\"fr-FR\"",
        ));
        out.push('\n');

        out.push_str(
            "# --- Traitement du texte ---------------------------------------------------\n",
        );
        out.push_str(&format!("max_chars = {}\n", self.max_chars));
        out.push_str(&format!(
            "collapse_whitespace = {}\n",
            self.collapse_whitespace
        ));
        out.push_str(&format!("dehyphenate = {}\n\n", self.dehyphenate));

        out.push_str(
            "# --- Déblocage de la lecture automatique -----------------------------------\n\
             # Chromium refuse de parler sans interaction utilisateur. Après le lancement,\n\
             # le client met la fenêtre au premier plan et envoie une frappe inoffensive\n\
             # (F24), ce qui vaut geste utilisateur et débloque la lecture.\n",
        );
        out.push_str(&format!("focus_window = {}\n", self.focus_window));
        out.push_str(&format!(
            "send_activation_key = {}\n",
            self.send_activation_key
        ));
        out.push_str(&format!(
            "activation_delay_ms = {}\n",
            self.activation_delay_ms
        ));
        out.push_str(&format!(
            "window_title_match = {}\n\n",
            quote(&self.window_title_match)
        ));

        out.push_str("# Bip système à chaque déclenchement.\n");
        out.push_str(&format!("beep = {}\n", self.beep));

        out
    }

    /// Prépare le texte du presse-papiers avant envoi.
    pub fn prepare_text(&self, text: &str) -> String {
        let mut result = text.replace('\u{0}', " ");

        if self.dehyphenate {
            // Mot coupé en fin de ligne : supprimer le tiret et la coupure.
            let mut out = String::with_capacity(result.len());
            let chars: Vec<char> = result.chars().collect();
            let mut index = 0;

            while index < chars.len() {
                let current = chars[index];
                if (current == '-' || current == '\u{ad}')
                    && chars
                        .get(index + 1..)
                        .map(|rest| {
                            let mut rest = rest.iter().peekable();
                            matches!(rest.peek(), Some('\r') | Some('\n'))
                        })
                        .unwrap_or(false)
                {
                    index += 1;
                    while matches!(chars.get(index), Some('\r') | Some('\n') | Some(' ')) {
                        index += 1;
                    }
                    continue;
                }

                out.push(current);
                index += 1;
            }

            result = out;
        }

        if self.collapse_whitespace {
            result = result.split_whitespace().collect::<Vec<_>>().join(" ");
        } else {
            result = result.trim().to_string();
        }

        if self.max_chars > 0 && result.chars().count() > self.max_chars {
            result = result.chars().take(self.max_chars).collect();
        }

        result
    }
}

/// Raccourci clavier résolu en valeurs Win32.
#[derive(Debug, Clone)]
pub struct Hotkey {
    pub modifiers: HOT_KEY_MODIFIERS,
    pub key: u32,
    pub label: String,
}

/// Convertit « Ctrl+Alt+S » en modificateurs et code de touche virtuelle.
pub fn parse_hotkey(spec: &str) -> Result<Hotkey> {
    let mut modifiers = MOD_NOREPEAT;
    let mut key: Option<u32> = None;

    for part in spec.split('+') {
        let token = part.trim();
        if token.is_empty() {
            continue;
        }

        match token.to_ascii_lowercase().as_str() {
            "ctrl" | "control" | "ctl" => modifiers |= MOD_CONTROL,
            "alt" => modifiers |= MOD_ALT,
            "shift" | "maj" => modifiers |= MOD_SHIFT,
            "win" | "super" | "meta" | "cmd" => modifiers |= MOD_WIN,
            other => {
                if key.is_some() {
                    return Err(anyhow!(
                        "raccourci « {spec} » : deux touches principales ({other})"
                    ));
                }
                key = Some(parse_key(other).ok_or_else(|| {
                    anyhow!("raccourci « {spec} » : touche « {other} » inconnue")
                })?);
            }
        }
    }

    let key = key.ok_or_else(|| anyhow!("raccourci « {spec} » : aucune touche principale"))?;

    if modifiers == MOD_NOREPEAT {
        return Err(anyhow!(
            "raccourci « {spec} » : au moins un modificateur (Ctrl, Alt, Shift, Win) est requis"
        ));
    }

    Ok(Hotkey {
        modifiers,
        key,
        label: spec.trim().to_string(),
    })
}

fn parse_key(token: &str) -> Option<u32> {
    // Lettres et chiffres : le code de touche virtuelle est le code ASCII.
    if token.len() == 1 {
        let character = token.chars().next()?;
        if character.is_ascii_alphanumeric() {
            return Some(character.to_ascii_uppercase() as u32);
        }
    }

    // Touches de fonction F1 à F24 (VK_F1 = 0x70).
    if let Some(rest) = token.strip_prefix('f')
        && let Ok(number) = rest.parse::<u32>()
        && (1..=24).contains(&number)
    {
        return Some(0x6F + number);
    }

    if let Some(rest) = token.strip_prefix("num")
        && let Ok(number) = rest.parse::<u32>()
        && number <= 9
    {
        return Some(0x60 + number);
    }

    Some(match token {
        "space" | "espace" => 0x20,
        "enter" | "return" | "entree" | "entrée" => 0x0D,
        "tab" => 0x09,
        "backspace" | "retour" => 0x08,
        "escape" | "esc" | "echap" => 0x1B,
        "insert" | "inser" => 0x2D,
        "delete" | "del" | "suppr" => 0x2E,
        "home" | "origine" => 0x24,
        "end" | "fin" => 0x23,
        "pageup" | "prior" => 0x21,
        "pagedown" | "next" => 0x22,
        "left" | "gauche" => 0x25,
        "up" | "haut" => 0x26,
        "right" | "droite" => 0x27,
        "down" | "bas" => 0x28,
        "pause" => 0x13,
        "printscreen" | "impr" => 0x2C,
        _ => return None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_simple_hotkey() {
        let hotkey = parse_hotkey("Ctrl+Alt+S").unwrap();
        assert_eq!(hotkey.key, 'S' as u32);
        assert!(hotkey.modifiers & MOD_CONTROL == MOD_CONTROL);
        assert!(hotkey.modifiers & MOD_ALT == MOD_ALT);
    }

    #[test]
    fn parses_function_keys() {
        assert_eq!(parse_hotkey("ctrl+shift+f9").unwrap().key, 0x78);
    }

    #[test]
    fn rejects_modifier_only() {
        assert!(parse_hotkey("Ctrl+Alt").is_err());
    }

    #[test]
    fn rejects_unknown_key() {
        assert!(parse_hotkey("Ctrl+Alt+Foo").is_err());
    }

    #[test]
    fn collapses_whitespace_and_truncates() {
        let config = Config {
            max_chars: 10,
            ..Config::default()
        };
        assert_eq!(config.prepare_text("  a \n\n b  "), "a b");
        assert_eq!(config.prepare_text("abcdefghijklmnop").chars().count(), 10);
    }

    /// Le fichier rendu doit se relire à l'identique : c'est ce qui autorise la
    /// fenêtre de configuration à réécrire le fichier sans rien perdre.
    #[test]
    fn rendered_config_round_trips() {
        let config = Config {
            base_url: "https://exemple.fr".into(),
            hotkey: "Ctrl+Shift+F9".into(),
            launch_mode: LaunchMode::Pwa,
            app_id: Some("abcdef".into()),
            edge_path: Some(r"C:\Program Files\Edge\msedge.exe".into()),
            rate: Some(1.0),
            volume: Some(0.75),
            voice: Some(r#"Denise "Natural""#.into()),
            max_chars: 4242,
            dehyphenate: true,
            beep: false,
            ..Config::default()
        };

        let reloaded: Config = toml::from_str(&config.render()).expect("rendu illisible");

        assert_eq!(reloaded.base_url, config.base_url);
        assert_eq!(reloaded.hotkey, config.hotkey);
        assert_eq!(reloaded.launch_mode, LaunchMode::Pwa);
        assert_eq!(reloaded.app_id, config.app_id);
        // Les antislash de Windows doivent survivre à l'échappement TOML.
        assert_eq!(reloaded.edge_path, config.edge_path);
        assert_eq!(reloaded.rate, Some(1.0));
        assert_eq!(reloaded.volume, Some(0.75));
        assert_eq!(reloaded.voice, config.voice);
        assert_eq!(reloaded.max_chars, 4242);
        assert!(reloaded.dehyphenate);
        assert!(!reloaded.beep);
    }

    /// Un réglage laissé vide reste montré en exemple commenté.
    #[test]
    fn renders_empty_options_as_comments() {
        let rendered = Config::default().render();

        assert!(rendered.contains("# voice = \"Denise\""));
        assert!(rendered.contains("# app_id = "));
        assert!(!rendered.contains("\nvoice = "));

        let reloaded: Config = toml::from_str(&rendered).expect("rendu illisible");
        assert_eq!(reloaded.voice, None);
        assert_eq!(reloaded.app_id, None);
    }

    #[test]
    fn dehyphenates_when_enabled() {
        let config = Config {
            dehyphenate: true,
            ..Config::default()
        };
        assert_eq!(config.prepare_text("exem-\nple simple"), "exemple simple");
    }
}
