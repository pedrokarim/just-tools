//! tts-hotkey — raccourci clavier global qui envoie le presse-papiers vers la
//! synthèse vocale de Just Tools, avec lecture automatique.
//!
//! Le programme vit dans la zone de notification : il enregistre un raccourci
//! système, lit le presse-papiers, construit l'URL de l'outil et l'ouvre dans
//! Microsoft Edge.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod autostart;
mod clipboard;
mod config;
mod launcher;
mod logging;
mod url;

use std::sync::{Arc, Mutex};

use anyhow::{Context, Result, anyhow};
use tray_icon::menu::{CheckMenuItem, Menu, MenuEvent, MenuItem, PredefinedMenuItem};
use tray_icon::{TrayIcon, TrayIconBuilder};
use windows::Win32::Foundation::HWND;
use windows::Win32::System::Console::{ATTACH_PARENT_PROCESS, AttachConsole};
// MessageBeep est exposé par windows-rs sous Diagnostics::Debug.
use windows::Win32::System::Diagnostics::Debug::MessageBeep;
use windows::Win32::UI::Input::KeyboardAndMouse::{RegisterHotKey, UnregisterHotKey};
use windows::Win32::UI::WindowsAndMessaging::{
    DispatchMessageW, GetMessageW, MB_ICONERROR, MB_OK, MSG, MessageBoxW, PostQuitMessage,
    TranslateMessage, WM_HOTKEY,
};
use windows::core::PCWSTR;

use crate::config::{Config, parse_hotkey};
use crate::logging::log_line;

const HOTKEY_ID: i32 = 1;

fn main() {
    // Permet d'afficher les messages quand le binaire est lancé depuis un
    // terminal, alors qu'il est compilé en application fenêtrée.
    unsafe {
        let _ = AttachConsole(ATTACH_PARENT_PROCESS);
    }

    logging::rotate_if_needed();

    if let Err(error) = run() {
        let message = format!("{error:#}");
        log_line!("erreur fatale : {message}");
        show_error(&message);
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    let args: Vec<String> = std::env::args().skip(1).collect();

    match args.first().map(String::as_str) {
        None => run_tray(),
        Some("--help" | "-h" | "/?") => {
            print_help();
            Ok(())
        }
        Some("--once") => {
            let config = load_config()?;
            wait_for_activation(trigger(&config));
            Ok(())
        }
        Some("--text") => {
            let text = args
                .get(1)
                .ok_or_else(|| anyhow!("--text attend le texte à lire en argument"))?;
            let config = load_config()?;
            wait_for_activation(send_text(&config, text));
            Ok(())
        }
        Some("--print-url") => {
            let config = load_config()?;
            let text = match args.get(1) {
                Some(value) => value.clone(),
                None => clipboard::read_text_with_retry()?,
            };
            println!("{}", url::build_url(&config, &config.prepare_text(&text)));
            Ok(())
        }
        Some("--list-apps") => {
            let apps = launcher::list_installed_apps();
            if apps.is_empty() {
                println!(
                    "Aucune PWA Edge détectée. Installez le site depuis Edge \
                     (menu ⋯ → Applications → Installer ce site en tant qu'application)."
                );
            } else {
                println!("PWA Edge installées :");
                for app in apps {
                    println!("  {}  [{}]  {}", app.id, app.profile, app.name);
                }
            }
            Ok(())
        }
        Some("--config-path") => {
            println!("{}", config::config_path()?.display());
            Ok(())
        }
        Some("--install-autostart") => {
            autostart::enable()?;
            println!("Démarrage automatique activé.");
            Ok(())
        }
        Some("--uninstall-autostart") => {
            autostart::disable()?;
            println!("Démarrage automatique désactivé.");
            Ok(())
        }
        Some(other) => Err(anyhow!(
            "option inconnue : {other}\nUtilisez --help pour la liste des options."
        )),
    }
}

fn print_help() {
    println!(
        r#"tts-hotkey — presse-papiers → synthèse vocale de Just Tools

Sans argument, le programme s'installe dans la zone de notification et
enregistre le raccourci défini dans sa configuration.

Options :
  --once                  Envoie le presse-papiers immédiatement, puis quitte
  --text <texte>          Envoie un texte précis, puis quitte
  --print-url [texte]     Affiche l'URL qui serait ouverte (diagnostic)
  --list-apps             Liste les PWA Edge installées et leur app_id
  --config-path           Affiche le chemin du fichier de configuration
  --install-autostart     Lance le programme à l'ouverture de session
  --uninstall-autostart   Retire le démarrage automatique
  --help                  Affiche cette aide"#
    );
}

fn load_config() -> Result<Config> {
    // À la première exécution, pré-remplir la PWA Just Tools si elle est déjà
    // installée dans Edge.
    let detected = if config::config_path()?.exists() {
        None
    } else {
        launcher::detect_just_tools_app()
    };

    if let Some(app) = &detected {
        log_line!(
            "PWA détectée : {} (app_id {}, profil {})",
            app.name,
            app.id,
            app.profile
        );
    }

    Config::load_or_create(detected.map(|app| (app.id, app.profile)))
}

/// Envoie un texte déjà connu vers l'outil.
///
/// Retourne le thread chargé de focaliser la fenêtre et de débloquer la lecture
/// automatique : en mode ponctuel il faut l'attendre, sinon le processus se
/// termine avant qu'il n'ait agi.
#[must_use]
fn send_text(config: &Config, text: &str) -> Option<std::thread::JoinHandle<()>> {
    let prepared = config.prepare_text(text);

    if prepared.is_empty() {
        log_line!("rien à lire : le texte est vide");
        return None;
    }

    let target = url::build_url(config, &prepared);
    log_line!(
        "envoi de {} caractères ({} octets d'URL)",
        prepared.chars().count(),
        target.len()
    );

    match launcher::launch(config, &target) {
        Ok(()) => launcher::spawn_activation(config),
        Err(error) => {
            log_line!("échec du lancement : {error:#}");
            None
        }
    }
}

/// Déclenchement : lecture du presse-papiers puis envoi.
#[must_use]
fn trigger(config: &Config) -> Option<std::thread::JoinHandle<()>> {
    if config.beep {
        unsafe {
            let _ = MessageBeep(MB_OK);
        }
    }

    match clipboard::read_text_with_retry() {
        Ok(text) if !text.trim().is_empty() => send_text(config, &text),
        Ok(_) => {
            log_line!("presse-papiers vide : rien à lire");
            None
        }
        Err(error) => {
            log_line!("lecture du presse-papiers impossible : {error:#}");
            None
        }
    }
}

/// Attend la fin de l'activation : indispensable avant de quitter le processus.
fn wait_for_activation(handle: Option<std::thread::JoinHandle<()>>) {
    if let Some(handle) = handle
        && handle.join().is_err()
    {
        log_line!("le thread d'activation s'est interrompu");
    }
}

fn register_hotkey(spec: &str) -> Result<String> {
    let hotkey = parse_hotkey(spec)?;

    unsafe { RegisterHotKey(None, HOTKEY_ID, hotkey.modifiers, hotkey.key) }.with_context(|| {
        format!(
            "impossible d'enregistrer le raccourci « {} » — il est probablement déjà utilisé par \
             une autre application",
            hotkey.label
        )
    })?;

    Ok(hotkey.label)
}

fn load_tray_icon() -> Result<tray_icon::Icon> {
    // L'icône de l'outil est embarquée dans le binaire.
    const PNG: &[u8] = include_bytes!("../../public/assets/images/icon-text-to-speech-192.png");

    let image = image::load_from_memory(PNG)
        .context("décodage de l'icône embarquée")?
        .resize_exact(32, 32, image::imageops::FilterType::Lanczos3)
        .into_rgba8();

    let (width, height) = image.dimensions();
    tray_icon::Icon::from_rgba(image.into_raw(), width, height)
        .context("construction de l'icône de la zone de notification")
}

struct TrayMenu {
    _tray: TrayIcon,
    speak: MenuItem,
    open_config: MenuItem,
    reload: MenuItem,
    open_log: MenuItem,
    autostart: CheckMenuItem,
    quit: MenuItem,
}

fn build_tray(hotkey_label: &str) -> Result<TrayMenu> {
    let speak = MenuItem::new(
        format!("Lire le presse-papiers ({hotkey_label})"),
        true,
        None,
    );
    let open_config = MenuItem::new("Ouvrir la configuration", true, None);
    let reload = MenuItem::new("Recharger la configuration", true, None);
    let open_log = MenuItem::new("Ouvrir le journal", true, None);
    let autostart_item =
        CheckMenuItem::new("Démarrer avec Windows", true, autostart::is_enabled(), None);
    let quit = MenuItem::new("Quitter", true, None);

    let menu = Menu::new();
    menu.append_items(&[
        &speak,
        &PredefinedMenuItem::separator(),
        &open_config,
        &reload,
        &open_log,
        &PredefinedMenuItem::separator(),
        &autostart_item,
        &PredefinedMenuItem::separator(),
        &quit,
    ])
    .context("construction du menu")?;

    let tray = TrayIconBuilder::new()
        .with_menu(Box::new(menu))
        .with_tooltip(format!("Just Tools — synthèse vocale ({hotkey_label})"))
        .with_icon(load_tray_icon()?)
        .with_menu_on_left_click(true)
        .build()
        .context("création de l'icône de la zone de notification")?;

    Ok(TrayMenu {
        _tray: tray,
        speak,
        open_config,
        reload,
        open_log,
        autostart: autostart_item,
        quit,
    })
}

fn run_tray() -> Result<()> {
    let config = Arc::new(Mutex::new(load_config()?));

    let hotkey_label = {
        let guard = config.lock().unwrap();
        register_hotkey(&guard.hotkey)?
    };

    let tray = build_tray(&hotkey_label)?;
    log_line!("démarré, raccourci actif : {hotkey_label}");

    let menu_events = MenuEvent::receiver();
    let mut message = MSG::default();

    loop {
        let result = unsafe { GetMessageW(&mut message, None, 0, 0) };
        if result.0 <= 0 {
            break;
        }

        if message.message == WM_HOTKEY && message.wParam.0 as i32 == HOTKEY_ID {
            let current = config.lock().unwrap().clone();
            // Mode résident : l'activation se poursuit en tâche de fond, la
            // boucle de messages ne doit pas l'attendre.
            drop(trigger(&current));
        }

        unsafe {
            let _ = TranslateMessage(&message);
            DispatchMessageW(&message);
        }

        // Les clics de menu sont livrés par un canal, alimenté pendant le
        // traitement des messages ci-dessus.
        while let Ok(event) = menu_events.try_recv() {
            if event.id == *tray.speak.id() {
                let current = config.lock().unwrap().clone();
                drop(trigger(&current));
            } else if event.id == *tray.open_config.id() {
                open_path(config::config_path());
            } else if event.id == *tray.reload.id() {
                reload_config(&config, &tray);
            } else if event.id == *tray.open_log.id() {
                if let Ok(path) = config::log_path()
                    && !path.exists()
                {
                    logging::log("journal créé");
                }
                open_path(config::log_path());
            } else if event.id == *tray.autostart.id() {
                match autostart::toggle() {
                    Ok(enabled) => {
                        tray.autostart.set_checked(enabled);
                        log_line!(
                            "démarrage automatique {}",
                            if enabled { "activé" } else { "désactivé" }
                        );
                    }
                    Err(error) => {
                        tray.autostart.set_checked(autostart::is_enabled());
                        log_line!("modification du démarrage automatique impossible : {error:#}");
                    }
                }
            } else if event.id == *tray.quit.id() {
                log_line!("arrêt demandé");
                unsafe { PostQuitMessage(0) };
            }
        }
    }

    unsafe {
        let _ = UnregisterHotKey(None, HOTKEY_ID);
    }

    Ok(())
}

fn open_path(path: Result<std::path::PathBuf>) {
    match path {
        Ok(path) => {
            if let Err(error) = launcher::open_with_shell(&path) {
                log_line!("ouverture de {} impossible : {error:#}", path.display());
            }
        }
        Err(error) => log_line!("chemin introuvable : {error:#}"),
    }
}

/// Recharge la configuration et réenregistre le raccourci s'il a changé.
fn reload_config(config: &Arc<Mutex<Config>>, tray: &TrayMenu) {
    let reloaded = match load_config() {
        Ok(value) => value,
        Err(error) => {
            log_line!("configuration invalide, ancienne version conservée : {error:#}");
            show_error(&format!("Configuration invalide :\n\n{error:#}"));
            return;
        }
    };

    let mut guard = config.lock().unwrap();
    let previous_hotkey = guard.hotkey.clone();

    if reloaded.hotkey != previous_hotkey {
        unsafe {
            let _ = UnregisterHotKey(None, HOTKEY_ID);
        }

        match register_hotkey(&reloaded.hotkey) {
            Ok(label) => {
                tray.speak
                    .set_text(format!("Lire le presse-papiers ({label})"));
                log_line!("nouveau raccourci : {label}");
            }
            Err(error) => {
                log_line!("nouveau raccourci refusé : {error:#}");
                show_error(&format!("{error:#}"));

                // Revenir à l'ancien raccourci pour ne pas rester sans rien.
                if let Err(error) = register_hotkey(&previous_hotkey) {
                    log_line!("ancien raccourci irrécupérable : {error:#}");
                }
                return;
            }
        }
    }

    *guard = reloaded;
    log_line!("configuration rechargée");
}

fn to_wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

fn show_error(message: &str) {
    let text = to_wide(message);
    let title = to_wide("tts-hotkey");

    unsafe {
        MessageBoxW(
            Some(HWND::default()),
            PCWSTR(text.as_ptr()),
            PCWSTR(title.as_ptr()),
            MB_ICONERROR | MB_OK,
        );
    }
}
