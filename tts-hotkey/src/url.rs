//! Construction de l'URL de lecture.
//!
//! Le texte voyage en base64url : bien plus compact que le percent-encoding
//! pour du français accentué (1,33x contre jusqu'à 9x par caractère accentué),
//! ce qui compte quand la ligne de commande Windows est limitée à 32 767
//! caractères.

use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;

use crate::config::Config;

const TOOL_PATH: &str = "/tools/text-to-speech";

/// Encode une valeur de paramètre d'URL (RFC 3986, caractères non réservés).
fn percent_encode(value: &str) -> String {
    let mut out = String::with_capacity(value.len());

    for byte in value.as_bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'.' | b'_' | b'~' => {
                out.push(*byte as char)
            }
            _ => out.push_str(&format!("%{byte:02X}")),
        }
    }

    out
}

/// Construit l'URL complète à ouvrir pour un texte donné.
pub fn build_url(config: &Config, text: &str) -> String {
    let base = config.base_url.trim_end_matches('/');

    let mut url = String::with_capacity(text.len() * 2 + 64);
    url.push_str(base);
    if !base.ends_with(TOOL_PATH) {
        url.push_str(TOOL_PATH);
    }

    url.push_str("?b64=");
    url.push_str(&URL_SAFE_NO_PAD.encode(text.as_bytes()));

    if config.autoplay {
        url.push_str("&autoplay=1");
    }
    if config.reader_mode {
        url.push_str("&mini=1");
    }
    if let Some(rate) = config.rate {
        url.push_str(&format!("&rate={rate}"));
    }
    if let Some(pitch) = config.pitch {
        url.push_str(&format!("&pitch={pitch}"));
    }
    if let Some(volume) = config.volume {
        url.push_str(&format!("&volume={volume}"));
    }
    if let Some(voice) = config.voice.as_deref().filter(|v| !v.is_empty()) {
        url.push_str("&voice=");
        url.push_str(&percent_encode(voice));
    }
    if let Some(lang) = config.lang.as_deref().filter(|v| !v.is_empty()) {
        url.push_str("&lang=");
        url.push_str(&percent_encode(lang));
    }

    url
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn appends_tool_path_once() {
        let config = Config {
            base_url: "https://exemple.fr/tools/text-to-speech".into(),
            reader_mode: false,
            ..Config::default()
        };
        let url = build_url(&config, "a");
        assert_eq!(url.matches("/tools/text-to-speech").count(), 1);
    }

    #[test]
    fn encodes_accents_in_base64url() {
        let config = Config {
            base_url: "https://exemple.fr".into(),
            autoplay: false,
            reader_mode: false,
            ..Config::default()
        };
        let url = build_url(&config, "Été");
        // Aucun caractère nécessitant un échappement d'URL.
        assert!(!url.contains('%'));
        assert!(!url.contains('+'));
        let encoded = url.split("b64=").nth(1).unwrap();
        let decoded = URL_SAFE_NO_PAD.decode(encoded).unwrap();
        assert_eq!(String::from_utf8(decoded).unwrap(), "Été");
    }

    #[test]
    fn percent_encodes_voice_names() {
        let config = Config {
            base_url: "https://exemple.fr".into(),
            voice: Some("Microsoft Denise (Natural)".into()),
            ..Config::default()
        };
        let url = build_url(&config, "a");
        assert!(url.contains("&voice=Microsoft%20Denise%20%28Natural%29"));
    }
}
