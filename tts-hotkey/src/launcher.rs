//! Ouverture de l'outil dans Microsoft Edge et déblocage de la lecture
//! automatique.

use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread;
use std::time::Duration;

use anyhow::{Context, Result, anyhow};
use windows::Win32::Foundation::{HWND, LPARAM};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP, SendInput, VIRTUAL_KEY,
};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GetWindowTextW, IsIconic, IsWindowVisible, SW_RESTORE, SetForegroundWindow,
    ShowWindow,
};
use windows::core::BOOL;

use crate::config::{Config, LaunchMode};
use crate::logging::log_line;

/// Touche envoyée pour valider une interaction utilisateur auprès de Chromium.
/// F24 n'est présente sur aucun clavier courant : aucun risque d'effet de bord.
const VK_F24: u16 = 0x87;

/// Une PWA Edge installée, telle que détectée sur le disque.
#[derive(Debug, Clone)]
pub struct InstalledApp {
    pub id: String,
    pub name: String,
    pub profile: String,
}

/// Emplacements habituels de msedge.exe.
fn edge_candidates() -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    for variable in ["ProgramFiles(x86)", "ProgramFiles", "LOCALAPPDATA"] {
        if let Ok(root) = std::env::var(variable) {
            candidates.push(
                PathBuf::from(root)
                    .join("Microsoft")
                    .join("Edge")
                    .join("Application")
                    .join("msedge.exe"),
            );
        }
    }

    candidates
}

/// Résout le chemin de msedge.exe (configuration puis détection).
pub fn resolve_edge(config: &Config) -> Result<PathBuf> {
    if let Some(configured) = config.edge_path.as_deref().filter(|p| !p.is_empty()) {
        let path = PathBuf::from(configured);
        if path.is_file() {
            return Ok(path);
        }
        return Err(anyhow!(
            "edge_path pointe vers un fichier inexistant : {configured}"
        ));
    }

    edge_candidates()
        .into_iter()
        .find(|path| path.is_file())
        .ok_or_else(|| {
            anyhow!("msedge.exe introuvable — renseignez « edge_path » dans la configuration")
        })
}

/// Racine des données utilisateur d'Edge.
fn edge_user_data() -> Option<PathBuf> {
    std::env::var("LOCALAPPDATA").ok().map(|root| {
        PathBuf::from(root)
            .join("Microsoft")
            .join("Edge")
            .join("User Data")
    })
}

/// Liste les PWA installées en inspectant les dossiers `Web Applications`
/// d'Edge. Le nom de l'application est déduit du fichier `.ico` déposé par Edge.
pub fn list_installed_apps() -> Vec<InstalledApp> {
    let mut apps = Vec::new();

    let Some(user_data) = edge_user_data() else {
        return apps;
    };

    let Ok(profiles) = std::fs::read_dir(&user_data) else {
        return apps;
    };

    for profile in profiles.flatten() {
        let profile_name = profile.file_name().to_string_lossy().to_string();
        if profile_name != "Default" && !profile_name.starts_with("Profile") {
            continue;
        }

        let web_apps = profile.path().join("Web Applications");
        let Ok(entries) = std::fs::read_dir(&web_apps) else {
            continue;
        };

        for entry in entries.flatten() {
            let folder = entry.file_name().to_string_lossy().to_string();
            // Edge nomme les dossiers `_crx__<app_id>`.
            let Some(id) = folder
                .strip_prefix("_crx__")
                .or_else(|| folder.strip_prefix("_crx_"))
            else {
                continue;
            };

            let name = std::fs::read_dir(entry.path())
                .ok()
                .and_then(|files| {
                    files.flatten().find_map(|file| {
                        let file_name = file.file_name().to_string_lossy().to_string();
                        file_name.strip_suffix(".ico").map(|stem| stem.to_string())
                    })
                })
                .unwrap_or_else(|| "(nom inconnu)".to_string());

            apps.push(InstalledApp {
                id: id.to_string(),
                name,
                profile: profile_name.clone(),
            });
        }
    }

    apps
}

/// Cherche la PWA Just Tools parmi les applications installées.
pub fn detect_just_tools_app() -> Option<InstalledApp> {
    list_installed_apps()
        .into_iter()
        .find(|app| app.name.to_lowercase().contains("just tools"))
}

/// Lance l'URL dans Edge selon le mode configuré.
pub fn launch(config: &Config, url: &str) -> Result<()> {
    let edge = resolve_edge(config)?;
    let mut command = Command::new(&edge);

    if let Some(profile) = config
        .profile_directory
        .as_deref()
        .filter(|value| !value.is_empty())
    {
        command.arg(format!("--profile-directory={profile}"));
    }

    let mode = match config.launch_mode {
        LaunchMode::Pwa if config.app_id.as_deref().unwrap_or("").is_empty() => {
            log_line!(
                "launch_mode = \"pwa\" mais app_id est vide : repli sur le mode fenêtre applicative"
            );
            LaunchMode::App
        }
        other => other,
    };

    match mode {
        LaunchMode::Pwa => {
            let app_id = config.app_id.as_deref().unwrap_or_default();
            command.arg(format!("--app-id={app_id}"));
            command.arg(format!("--app-launch-url-for-shortcuts-menu-item={url}"));
        }
        LaunchMode::App => {
            command.arg(format!("--app={url}"));
        }
        LaunchMode::Tab => {
            command.arg(url);
        }
    }

    command
        .spawn()
        .with_context(|| format!("lancement de {}", edge.display()))?;

    Ok(())
}

struct EnumContext {
    needle: String,
    found: Option<HWND>,
}

unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let context = unsafe { &mut *(lparam.0 as *mut EnumContext) };

    if !unsafe { IsWindowVisible(hwnd) }.as_bool() {
        return BOOL(1);
    }

    let mut buffer = [0u16; 512];
    let length = unsafe { GetWindowTextW(hwnd, &mut buffer) };
    if length <= 0 {
        return BOOL(1);
    }

    let title = String::from_utf16_lossy(&buffer[..length as usize]).to_lowercase();
    if title.contains(&context.needle) {
        context.found = Some(hwnd);
        return BOOL(0); // arrêter l'énumération
    }

    BOOL(1)
}

/// Cherche une fenêtre visible dont le titre contient `needle`.
pub fn find_window(needle: &str) -> Option<HWND> {
    let mut context = EnumContext {
        needle: needle.to_lowercase(),
        found: None,
    };

    // EnumWindows renvoie une erreur quand le rappel interrompt l'énumération :
    // ce n'est pas un échec ici.
    let _ = unsafe {
        EnumWindows(
            Some(enum_windows_proc),
            LPARAM(&mut context as *mut EnumContext as isize),
        )
    };

    context.found
}

/// Met la fenêtre au premier plan.
pub fn focus_window(hwnd: HWND) {
    unsafe {
        if IsIconic(hwnd).as_bool() {
            let _ = ShowWindow(hwnd, SW_RESTORE);
        }
        let _ = SetForegroundWindow(hwnd);
    }
}

/// Envoie une frappe F24 : une vraie frappe clavier vaut geste utilisateur pour
/// Chromium, ce qui autorise `speechSynthesis.speak()` sur un document neuf.
pub fn send_activation_key() {
    let keyboard_input = |flags| INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 {
            ki: KEYBDINPUT {
                wVk: VIRTUAL_KEY(VK_F24),
                wScan: 0,
                dwFlags: flags,
                time: 0,
                dwExtraInfo: 0,
            },
        },
    };

    let inputs = [
        keyboard_input(Default::default()),
        keyboard_input(KEYEVENTF_KEYUP),
    ];

    let sent = unsafe { SendInput(&inputs, std::mem::size_of::<INPUT>() as i32) };
    if sent as usize != inputs.len() {
        log_line!(
            "SendInput n'a envoyé que {sent} évènement(s) sur {}",
            inputs.len()
        );
    }
}

/// Après le lancement : attendre l'ouverture, focaliser, débloquer l'autoplay.
///
/// Exécuté dans un thread dédié pour ne pas figer la boucle de messages du mode
/// résident. En mode ponctuel (`--once`), l'appelant doit joindre le handle
/// retourné, sinon le processus se termine avant que le thread ait agi.
#[must_use = "en mode ponctuel, le handle doit être joint avant de quitter"]
pub fn spawn_activation(config: &Config) -> Option<thread::JoinHandle<()>> {
    if !config.focus_window && !config.send_activation_key {
        return None;
    }

    let delay = Duration::from_millis(config.activation_delay_ms);
    let needle = config.window_title_match.clone();
    let focus = config.focus_window;
    let activate = config.send_activation_key;

    Some(thread::spawn(move || {
        thread::sleep(delay);

        // La fenêtre peut mettre un peu plus longtemps à apparaître.
        let mut window = find_window(&needle);
        for _ in 0..10 {
            if window.is_some() {
                break;
            }
            thread::sleep(Duration::from_millis(200));
            window = find_window(&needle);
        }

        match window {
            Some(hwnd) => {
                if focus {
                    focus_window(hwnd);
                    thread::sleep(Duration::from_millis(120));
                }
                if activate {
                    send_activation_key();
                }
                log_line!(
                    "fenêtre « {needle} » trouvée (focus : {focus}, frappe d'activation : {activate})"
                );
            }
            None => log_line!(
                "fenêtre « {needle} » introuvable : lecture automatique laissée au navigateur"
            ),
        }
    }))
}

/// Ouvre un fichier avec l'application associée (configuration, journal).
pub fn open_with_shell(path: &Path) -> Result<()> {
    Command::new("cmd")
        .args(["/C", "start", "", &path.to_string_lossy()])
        .spawn()
        .with_context(|| format!("ouverture de {}", path.display()))?;
    Ok(())
}
