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

/// Contenu du fichier créé à la première exécution. Si une PWA Just Tools est
/// détectée, son `app_id` et son profil sont pré-remplis — `launch_mode` reste
/// sur « app », qui fonctionne partout ; passer en « pwa » ne demande alors plus
/// qu'un mot à changer.
fn default_config_contents(detected: Option<(String, String)>) -> String {
    match detected {
        Some((app_id, profile)) => DEFAULT_CONFIG_TEMPLATE
            .replace(
                "# app_id = \"abcdefghijklmnopabcdefghijklmnop\"",
                &format!("app_id = \"{app_id}\"  # PWA détectée automatiquement"),
            )
            .replace(
                "# profile_directory = \"Default\"",
                &format!("profile_directory = \"{profile}\""),
            ),
        None => DEFAULT_CONFIG_TEMPLATE.to_string(),
    }
}

impl Config {
    /// Charge la configuration, en créant un fichier commenté si besoin.
    pub fn load_or_create(detected: Option<(String, String)>) -> Result<Self> {
        let path = config_path()?;

        if !path.exists() {
            let dir = config_dir()?;
            fs::create_dir_all(&dir).with_context(|| format!("création de {}", dir.display()))?;
            fs::write(&path, default_config_contents(detected))
                .with_context(|| format!("écriture de {}", path.display()))?;
        }

        let raw =
            fs::read_to_string(&path).with_context(|| format!("lecture de {}", path.display()))?;

        toml::from_str(&raw).with_context(|| format!("{} est invalide", path.display()))
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

const DEFAULT_CONFIG_TEMPLATE: &str = r##"# Configuration de tts-hotkey
#
# Le raccourci envoie le contenu du presse-papiers vers la synthèse vocale
# de Just Tools, avec lecture automatique.
# Modifiez ce fichier puis utilisez « Recharger la configuration » dans le menu
# de l'icône de la zone de notification.

# Racine du site (ou URL complète de l'outil).
base_url = "https://just-tools.ascencia.re"

# Raccourci global. Modificateurs : Ctrl, Alt, Shift, Win.
# Exemples : "Ctrl+Alt+S", "Ctrl+Shift+F9", "Win+Alt+L".
hotkey = "Ctrl+Alt+S"

# Mode d'ouverture :
#   "app" = fenêtre applicative Edge (--app=), fonctionne sans rien installer
#   "pwa" = PWA installée, réutilise la fenêtre déjà ouverte (renseigner app_id)
#   "tab" = onglet normal du navigateur
launch_mode = "app"

# Identifiant de la PWA installée, requis pour launch_mode = "pwa".
# Il se lit dans edge://apps (ou via `tts-hotkey.exe --list-apps`).
# app_id = "abcdefghijklmnopabcdefghijklmnop"

# Chemin de msedge.exe si la détection automatique échoue.
# edge_path = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"

# Profil Edge à utiliser.
# profile_directory = "Default"

# --- Lecture ---------------------------------------------------------------
autoplay = true
reader_mode = true
# rate = 1.2
# pitch = 1.0
# volume = 1.0
# voice = "Denise"
# lang = "fr-FR"

# --- Traitement du texte ---------------------------------------------------
max_chars = 12000
collapse_whitespace = true
dehyphenate = false

# --- Déblocage de la lecture automatique -----------------------------------
# Chromium refuse de parler sans interaction utilisateur. Après le lancement,
# le client met la fenêtre au premier plan et envoie une frappe inoffensive
# (F24), ce qui vaut geste utilisateur et débloque la lecture.
focus_window = true
send_activation_key = true
activation_delay_ms = 1200
window_title_match = "Synthèse Vocale"

# Bip système à chaque déclenchement.
beep = true
"##;

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

    #[test]
    fn dehyphenates_when_enabled() {
        let config = Config {
            dehyphenate: true,
            ..Config::default()
        };
        assert_eq!(config.prepare_text("exem-\nple simple"), "exemple simple");
    }
}
