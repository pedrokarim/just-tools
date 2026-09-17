//! Démarrage automatique via `HKCU\...\CurrentVersion\Run`.

use anyhow::{Context, Result};
use winreg::RegKey;
use winreg::enums::{HKEY_CURRENT_USER, KEY_READ, KEY_WRITE};

const RUN_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
const VALUE_NAME: &str = "just-tools-tts-hotkey";

/// Commande inscrite au démarrage.
///
/// On privilégie la copie installée : une entrée pointant vers
/// `target\release\tts-hotkey.exe` devient orpheline au premier `cargo clean`.
fn executable() -> Result<String> {
    let path = crate::install::preferred_executable()
        .context("chemin de l'exécutable introuvable")?;
    Ok(format!("\"{}\"", path.display()))
}

/// Chemin actuellement inscrit au démarrage, s'il existe.
pub fn registered_target() -> Option<String> {
    RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(RUN_KEY, KEY_READ)
        .and_then(|key| key.get_value::<String, _>(VALUE_NAME))
        .ok()
}

pub fn is_enabled() -> bool {
    RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(RUN_KEY, KEY_READ)
        .and_then(|key| key.get_value::<String, _>(VALUE_NAME))
        .is_ok()
}

pub fn enable() -> Result<()> {
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(RUN_KEY, KEY_WRITE)
        .context("ouverture de la clé de démarrage")?;

    key.set_value(VALUE_NAME, &executable()?)
        .context("écriture de la valeur de démarrage")?;

    Ok(())
}

pub fn disable() -> Result<()> {
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(RUN_KEY, KEY_WRITE)
        .context("ouverture de la clé de démarrage")?;

    match key.delete_value(VALUE_NAME) {
        Ok(()) => Ok(()),
        // Absent : l'état voulu est déjà atteint.
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error).context("suppression de la valeur de démarrage"),
    }
}

pub fn toggle() -> Result<bool> {
    if is_enabled() {
        disable()?;
        Ok(false)
    } else {
        enable()?;
        Ok(true)
    }
}
