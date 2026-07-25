//! Lecture du presse-papiers Windows.

use anyhow::{Result, anyhow};

/// Nombre de tentatives d'ouverture : le presse-papiers est une ressource
/// globale qu'une autre application peut détenir un court instant.
const OPEN_ATTEMPTS: usize = 10;

pub fn read_text() -> Result<String> {
    let text = clipboard_win::get_clipboard_string()
        .map_err(|error| anyhow!("presse-papiers illisible ({error})"))?;

    Ok(text)
}

/// Variante tolérante : réessaie si le presse-papiers est verrouillé.
pub fn read_text_with_retry() -> Result<String> {
    let mut last_error = None;

    for attempt in 0..OPEN_ATTEMPTS {
        match read_text() {
            Ok(text) => return Ok(text),
            Err(error) => {
                last_error = Some(error);
                std::thread::sleep(std::time::Duration::from_millis(20 * (attempt as u64 + 1)));
            }
        }
    }

    Err(last_error.unwrap_or_else(|| anyhow!("presse-papiers illisible")))
}
