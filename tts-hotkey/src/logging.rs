//! Journal minimal : le binaire n'ayant pas de console en mode fenêtré, toutes
//! les actions sont tracées dans `%APPDATA%\just-tools\tts-hotkey.log`.

use std::fs::{self, OpenOptions};
use std::io::Write;

use windows::Win32::System::SystemInformation::GetLocalTime;

use crate::config;

/// Au-delà de cette taille, le journal est réinitialisé au démarrage.
const MAX_LOG_BYTES: u64 = 256 * 1024;

pub fn rotate_if_needed() {
    if let Ok(path) = config::log_path()
        && let Ok(metadata) = fs::metadata(&path)
        && metadata.len() > MAX_LOG_BYTES
    {
        let _ = fs::remove_file(&path);
    }
}

fn timestamp() -> String {
    let now = unsafe { GetLocalTime() };
    format!(
        "{:04}-{:02}-{:02} {:02}:{:02}:{:02}",
        now.wYear, now.wMonth, now.wDay, now.wHour, now.wMinute, now.wSecond
    )
}

/// Écrit une ligne dans le journal, et sur la sortie d'erreur si une console
/// est attachée (lancement depuis un terminal).
pub fn log(message: &str) {
    let line = format!("[{}] {}", timestamp(), message);
    eprintln!("{line}");

    let Ok(path) = config::log_path() else { return };

    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(&path) {
        let _ = writeln!(file, "{line}");
    }
}

macro_rules! log_line {
    ($($arg:tt)*) => { $crate::logging::log(&format!($($arg)*)) };
}

pub(crate) use log_line;
