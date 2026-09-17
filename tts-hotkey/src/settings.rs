//! Fenêtre de configuration.
//!
//! L'interface est une page embarquée, rendue par WebView2. Le choix se
//! justifie ici plus qu'ailleurs : le programme exige déjà Edge pour
//! fonctionner, donc le moteur de rendu est acquis, et l'interface peut
//! reprendre l'identité visuelle de Just Tools sans la réinventer en GDI.
//!
//! La fenêtre hôte reste une fenêtre Win32 ordinaire : le programme possède sa
//! propre boucle de messages (raccourci global et zone de notification), qu'une
//! boîte à outils voudrait posséder à sa place.
//!
//! ```text
//! page HTML  --postMessage-->  canal  -->  boucle de messages  -->  actions
//!            <--evaluate_script--------------------------------------'
//! ```
//!
//! La fenêtre est modale : tant qu'elle est ouverte, le raccourci global est
//! libéré par l'appelant, ce qui permet de le capturer au clavier.

use std::num::NonZeroIsize;
use std::sync::mpsc::{Receiver, Sender, channel};

use anyhow::{Context, Result, anyhow};
use raw_window_handle::{
    HandleError, HasWindowHandle, RawWindowHandle, Win32WindowHandle, WindowHandle,
};
use serde::Serialize;
use windows::Win32::Foundation::{HINSTANCE, HWND, LPARAM, LRESULT, RECT, WPARAM};
use windows::Win32::Graphics::Dwm::{DWMWA_USE_IMMERSIVE_DARK_MODE, DwmSetWindowAttribute};
use windows::Win32::System::LibraryLoader::GetModuleHandleW;
use windows::Win32::UI::Controls::Dialogs::{GetOpenFileNameW, OFN_FILEMUSTEXIST, OPENFILENAMEW};
use windows::Win32::UI::HiDpi::GetDpiForWindow;
use windows::Win32::UI::WindowsAndMessaging::*;
use windows::core::{PCWSTR, PWSTR, w};
use wry::dpi::{LogicalPosition, LogicalSize};
use wry::{Rect, WebView, WebViewBuilder};

use crate::config::Config;
use crate::logging::log_line;
use crate::{autostart, install, launcher};

const WINDOW_CLASS: PCWSTR = w!("TtsHotkeySettings");

/// Page de l'interface, embarquée dans le binaire.
const PAGE: &str = include_str!("../assets/settings.html");

// Taille logique de départ ; la fenêtre reste redimensionnable, la page s'y
// adapte.
const WINDOW_W: i32 = 940;
const WINDOW_H: i32 = 680;
const MIN_W: i32 = 720;
const MIN_H: i32 = 520;

/// Ce que l'utilisateur a décidé en fermant la fenêtre.
pub enum Outcome {
    Cancelled,
    /// Réglages enregistrés : l'appelant doit recharger et réenregistrer le
    /// raccourci.
    Saved(Box<Config>),
    /// Désinstallation demandée : le programme doit se terminer.
    Quit,
}

/// État de l'installation et du démarrage, tel qu'affiché par la page.
#[derive(Serialize)]
struct State {
    autostart: bool,
    autostart_target: Option<String>,
    installed: bool,
    running_from_install: bool,
    has_shortcut: bool,
    installed_path: String,
    current_path: String,
}

fn current_state() -> State {
    let status = install::status().ok();

    State {
        autostart: autostart::is_enabled(),
        autostart_target: autostart::registered_target(),
        installed: status.as_ref().is_some_and(|status| status.installed),
        running_from_install: status
            .as_ref()
            .is_some_and(|status| status.running_from_install),
        has_shortcut: status.as_ref().is_some_and(|status| status.has_shortcut),
        installed_path: status
            .as_ref()
            .map(|status| status.installed_exe.display().to_string())
            .unwrap_or_default(),
        current_path: status
            .as_ref()
            .map(|status| status.current_exe.display().to_string())
            .unwrap_or_default(),
    }
}

/// Enveloppe la fenêtre hôte pour que la WebView puisse s'y attacher.
struct Host(HWND);

impl HasWindowHandle for Host {
    fn window_handle(&self) -> std::result::Result<WindowHandle<'_>, HandleError> {
        let raw = NonZeroIsize::new(self.0.0 as isize).ok_or(HandleError::Unavailable)?;
        let handle = Win32WindowHandle::new(raw);

        // La fenêtre vit aussi longtemps que la WebView : l'emprunt est valide.
        Ok(unsafe { WindowHandle::borrow_raw(RawWindowHandle::Win32(handle)) })
    }
}

/// Données attachées à la fenêtre, pour redimensionner la WebView.
struct Attached {
    webview: Option<WebView>,
    dpi_scale: f64,
}

fn to_wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

/// Windows est-il en thème sombre pour les applications ?
fn prefers_dark() -> bool {
    winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey(r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize")
        .and_then(|key| key.get_value::<u32, _>("AppsUseLightTheme"))
        .map(|light| light == 0)
        .unwrap_or(false)
}

/// Ouvre la fenêtre et rend la main à sa fermeture.
///
/// L'appelant doit avoir libéré le raccourci global : sans cela la combinaison
/// n'atteindrait jamais le champ de capture.
pub fn open(current: &Config) -> Result<Outcome> {
    let instance: HINSTANCE = unsafe { GetModuleHandleW(None) }
        .context("module courant introuvable")?
        .into();

    unsafe { register_class(instance)? };

    let mut attached = Box::new(Attached {
        webview: None,
        dpi_scale: 1.0,
    });

    let hwnd = unsafe { create_window(instance, &mut attached)? };
    let host = Host(hwnd);

    let (sender, receiver) = channel::<String>();
    let webview = build_webview(&host, sender)?;

    attached.webview = Some(webview);
    unsafe { resize_webview(hwnd, &attached) };

    unsafe {
        let _ = ShowWindow(hwnd, SW_SHOW);
        let _ = SetForegroundWindow(hwnd);
    }

    let outcome = run(hwnd, &attached, &receiver, current);

    // La WebView doit être détruite avant la fenêtre qui l'héberge.
    attached.webview = None;
    unsafe {
        if IsWindow(Some(hwnd)).as_bool() {
            SetWindowLongPtrW(hwnd, GWLP_USERDATA, 0);
            let _ = DestroyWindow(hwnd);
        }
    }

    outcome
}

unsafe fn register_class(instance: HINSTANCE) -> Result<()> {
    unsafe {
        let mut existing = WNDCLASSEXW {
            cbSize: size_of::<WNDCLASSEXW>() as u32,
            ..Default::default()
        };

        if GetClassInfoExW(Some(instance), WINDOW_CLASS, &mut existing).is_ok() {
            return Ok(());
        }

        let class = WNDCLASSEXW {
            cbSize: size_of::<WNDCLASSEXW>() as u32,
            lpfnWndProc: Some(window_proc),
            hInstance: instance,
            hCursor: LoadCursorW(None, IDC_ARROW).unwrap_or_default(),
            lpszClassName: WINDOW_CLASS,
            hIcon: application_icon(instance),
            hIconSm: application_icon(instance),
            ..Default::default()
        };

        if RegisterClassExW(&class) == 0 {
            return Err(anyhow!("enregistrement de la classe de fenêtre impossible"));
        }

        Ok(())
    }
}

/// Icône embarquée par le script de compilation.
///
/// L'identifiant dépend du générateur de ressources ; on essaie les valeurs
/// usuelles avant de laisser le système choisir l'icône par défaut.
fn application_icon(instance: HINSTANCE) -> HICON {
    for id in [1usize, 0x101] {
        if let Ok(icon) = unsafe { LoadIconW(Some(instance), PCWSTR(id as *const u16)) } {
            return icon;
        }
    }
    HICON::default()
}

unsafe fn create_window(instance: HINSTANCE, attached: &mut Attached) -> Result<HWND> {
    let title = to_wide("Synthèse vocale (Just Tools)");

    let hwnd = unsafe {
        CreateWindowExW(
            WINDOW_EX_STYLE::default(),
            WINDOW_CLASS,
            PCWSTR(title.as_ptr()),
            WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            WINDOW_W,
            WINDOW_H,
            None,
            None,
            Some(instance),
            Some(attached as *mut Attached as *mut _),
        )
    }
    .context("création de la fenêtre de configuration")?;

    let dpi = unsafe { GetDpiForWindow(hwnd) }.max(96);
    attached.dpi_scale = f64::from(dpi) / 96.0;

    // Barre de titre sombre quand Windows l'est : sans cela, une barre blanche
    // surmonte une interface sombre.
    if prefers_dark() {
        let enabled = windows::core::BOOL(1);
        unsafe {
            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWA_USE_IMMERSIVE_DARK_MODE,
                &enabled as *const _ as *const _,
                size_of::<windows::core::BOOL>() as u32,
            );
        }
    }

    unsafe { apply_size(hwnd, attached.dpi_scale) };

    Ok(hwnd)
}

/// Donne à la fenêtre sa taille logique et la centre.
unsafe fn apply_size(hwnd: HWND, scale: f64) {
    let width = (f64::from(WINDOW_W) * scale) as i32;
    let height = (f64::from(WINDOW_H) * scale) as i32;

    let mut desired = RECT {
        left: 0,
        top: 0,
        right: width,
        bottom: height,
    };

    unsafe {
        let _ = AdjustWindowRectEx(
            &mut desired,
            WS_OVERLAPPEDWINDOW,
            false,
            WINDOW_EX_STYLE::default(),
        );

        let outer_width = desired.right - desired.left;
        let outer_height = desired.bottom - desired.top;
        let x = (GetSystemMetrics(SM_CXSCREEN) - outer_width) / 2;
        let y = (GetSystemMetrics(SM_CYSCREEN) - outer_height) / 2;

        let _ = SetWindowPos(
            hwnd,
            None,
            x.max(0),
            y.max(0),
            outer_width,
            outer_height,
            SWP_NOZORDER | SWP_NOACTIVATE,
        );
    }
}

fn build_webview(host: &Host, sender: Sender<String>) -> Result<WebView> {
    let dark = prefers_dark();

    // Le thème est décidé ici plutôt que par la seule requête de média :
    // WebView2 ne suit pas toujours le réglage de Windows.
    let page = if dark {
        PAGE.replacen(
            "<html lang=\"fr\">",
            "<html lang=\"fr\" data-theme=\"dark\">",
            1,
        )
    } else {
        PAGE.to_string()
    };

    WebViewBuilder::new()
        .with_html(page)
        // Évite le flash blanc avant le premier rendu.
        .with_background_color(if dark {
            (20, 20, 27, 255)
        } else {
            (247, 247, 251, 255)
        })
        .with_devtools(false)
        .with_ipc_handler(move |request| {
            let _ = sender.send(request.into_body());
        })
        .build_as_child(host)
        .context(
            "création de la vue web impossible : le runtime WebView2 est-il installé ? \
             Il accompagne Microsoft Edge, dont le programme dépend par ailleurs",
        )
}

/// Ajuste la WebView à la zone client de la fenêtre.
unsafe fn resize_webview(hwnd: HWND, attached: &Attached) {
    let Some(webview) = &attached.webview else {
        return;
    };

    let mut client = RECT::default();
    if unsafe { GetClientRect(hwnd, &mut client) }.is_err() {
        return;
    }

    let scale = attached.dpi_scale;
    let width = f64::from(client.right - client.left) / scale;
    let height = f64::from(client.bottom - client.top) / scale;

    let _ = webview.set_bounds(Rect {
        position: LogicalPosition::new(0.0, 0.0).into(),
        size: LogicalSize::new(width.max(1.0), height.max(1.0)).into(),
    });
}

unsafe fn attached_from<'a>(hwnd: HWND) -> Option<&'a mut Attached> {
    let pointer = unsafe { GetWindowLongPtrW(hwnd, GWLP_USERDATA) } as *mut Attached;
    if pointer.is_null() {
        None
    } else {
        Some(unsafe { &mut *pointer })
    }
}

unsafe extern "system" fn window_proc(
    hwnd: HWND,
    message: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    unsafe {
        match message {
            WM_NCCREATE => {
                let create = lparam.0 as *const CREATESTRUCTW;
                SetWindowLongPtrW(hwnd, GWLP_USERDATA, (*create).lpCreateParams as isize);
                DefWindowProcW(hwnd, message, wparam, lparam)
            }
            WM_SIZE => {
                if let Some(attached) = attached_from(hwnd) {
                    resize_webview(hwnd, attached);
                }
                LRESULT(0)
            }
            WM_GETMINMAXINFO => {
                if let Some(attached) = attached_from(hwnd) {
                    let info = lparam.0 as *mut MINMAXINFO;
                    if !info.is_null() {
                        let scale = attached.dpi_scale;
                        (*info).ptMinTrackSize.x = (f64::from(MIN_W) * scale) as i32;
                        (*info).ptMinTrackSize.y = (f64::from(MIN_H) * scale) as i32;
                    }
                }
                LRESULT(0)
            }
            WM_DPICHANGED => {
                if let Some(attached) = attached_from(hwnd) {
                    let dpi = (wparam.0 & 0xFFFF) as u32;
                    attached.dpi_scale = f64::from(dpi.max(96)) / 96.0;

                    let suggested = lparam.0 as *const RECT;
                    if !suggested.is_null() {
                        let _ = SetWindowPos(
                            hwnd,
                            None,
                            (*suggested).left,
                            (*suggested).top,
                            (*suggested).right - (*suggested).left,
                            (*suggested).bottom - (*suggested).top,
                            SWP_NOZORDER | SWP_NOACTIVATE,
                        );
                    }
                    resize_webview(hwnd, attached);
                }
                LRESULT(0)
            }
            WM_CLOSE => {
                let _ = DestroyWindow(hwnd);
                LRESULT(0)
            }
            WM_DESTROY => {
                PostQuitMessage(0);
                LRESULT(0)
            }
            _ => DefWindowProcW(hwnd, message, wparam, lparam),
        }
    }
}

/// Boucle de messages de la fenêtre, entrecoupée du traitement des messages
/// venus de la page.
fn run(
    hwnd: HWND,
    attached: &Attached,
    receiver: &Receiver<String>,
    initial: &Config,
) -> Result<Outcome> {
    let mut outcome = Outcome::Cancelled;
    let mut message = MSG::default();

    loop {
        let result = unsafe { GetMessageW(&mut message, None, 0, 0) };
        if result.0 <= 0 {
            break;
        }

        unsafe {
            let _ = TranslateMessage(&message);
            DispatchMessageW(&message);
        }

        // Les messages de la page sont déposés dans le canal pendant le
        // traitement ci-dessus.
        while let Ok(raw) = receiver.try_recv() {
            if handle_message(&raw, hwnd, attached, initial, &mut outcome) {
                unsafe {
                    if IsWindow(Some(hwnd)).as_bool() {
                        let _ = DestroyWindow(hwnd);
                    }
                }
            }
        }
    }

    Ok(outcome)
}

/// Exécute du script dans la page.
fn call(attached: &Attached, script: &str) {
    if let Some(webview) = &attached.webview
        && let Err(error) = webview.evaluate_script(script)
    {
        log_line!("script refusé par la vue web : {error}");
    }
}

/// Encode une valeur pour l'insérer dans du script.
fn json<T: Serialize>(value: &T) -> String {
    serde_json::to_string(value).unwrap_or_else(|_| "null".to_string())
}

fn notify(attached: &Attached, text: &str, kind: &str) {
    call(
        attached,
        &format!("window.host.toast({}, {})", json(&text), json(&kind)),
    );
}

fn push_state(attached: &Attached) {
    call(
        attached,
        &format!("window.host.status({})", json(&current_state())),
    );
}

/// Traite un message de la page. Retourne `true` s'il faut fermer la fenêtre.
fn handle_message(
    raw: &str,
    hwnd: HWND,
    attached: &Attached,
    initial: &Config,
    outcome: &mut Outcome,
) -> bool {
    let message: serde_json::Value = match serde_json::from_str(raw) {
        Ok(value) => value,
        Err(error) => {
            log_line!("message illisible depuis la vue web : {error}");
            return false;
        }
    };

    let kind = message
        .get("type")
        .and_then(|value| value.as_str())
        .unwrap_or("");

    match kind {
        "ready" => {
            // On montre la configuration que le programme applique réellement,
            // et non le fichier : les deux diffèrent quand un raccourci a été
            // refusé et que l'ancien a été conservé.
            call(attached, &format!("window.host.load({})", json(initial)));
            push_state(attached);
        }

        "cancel" => return true,

        "save" => {
            let Some(config) = parse_config(&message, attached) else {
                return false;
            };

            if let Err(error) = config.save() {
                notify(
                    attached,
                    &format!("Enregistrement impossible : {error:#}"),
                    "error",
                );
                return false;
            }

            // La case de démarrage est appliquée dès le clic ; on la réaligne
            // ici au cas où l'écriture aurait échoué entre-temps.
            if let Some(wanted) = message.get("autostart").and_then(|value| value.as_bool())
                && wanted != autostart::is_enabled()
                && let Err(error) = set_autostart(wanted)
            {
                log_line!("démarrage automatique non appliqué : {error:#}");
            }

            log_line!("configuration enregistrée depuis la fenêtre");
            *outcome = Outcome::Saved(Box::new(config));
            return true;
        }

        "test" => {
            if let Some(config) = parse_config(&message, attached) {
                // Réglages en cours d'édition, sans les enregistrer : c'est
                // tout l'intérêt d'un essai.
                drop(crate::trigger(&config));
            }
        }

        "detectApp" => match launcher::detect_just_tools_app() {
            Some(app) => call(
                attached,
                &format!(
                    "window.host.detected({{id:{},name:{},profile:{}}})",
                    json(&app.id),
                    json(&app.name),
                    json(&app.profile)
                ),
            ),
            None => notify(
                attached,
                "Aucune application Just Tools installée dans Edge. Ouvrez le site \
                 dans Edge, puis menu « … » → Applications → « Installer ce site en \
                 tant qu'application ».",
                "error",
            ),
        },

        "browseEdge" => {
            if let Some(path) = browse_for_browser(hwnd) {
                call(attached, &format!("window.host.edgePath({})", json(&path)));
            }
        }

        "setAutostart" => {
            let wanted = message
                .get("value")
                .and_then(|value| value.as_bool())
                .unwrap_or(false);

            match set_autostart(wanted) {
                Ok(()) => log_line!(
                    "démarrage automatique {}",
                    if wanted { "activé" } else { "désactivé" }
                ),
                Err(error) => notify(
                    attached,
                    &format!("Modification du démarrage automatique impossible : {error:#}"),
                    "error",
                ),
            }

            push_state(attached);
        }

        "install" => match install::install() {
            Ok(path) => {
                // L'entrée de démarrage doit désormais viser la copie installée.
                if autostart::is_enabled()
                    && let Err(error) = autostart::enable()
                {
                    log_line!("entrée de démarrage non réalignée : {error:#}");
                }

                push_state(attached);
                notify(
                    attached,
                    &format!(
                        "Installé dans {}\nLe programme apparaît dans le menu Démarrer, \
                         sous « Synthèse vocale ».",
                        path.display()
                    ),
                    "success",
                );
            }
            Err(error) => notify(
                attached,
                &format!("Installation impossible : {error:#}"),
                "error",
            ),
        },

        "uninstall" => match install::uninstall() {
            Ok(install::Removal::Deferred) => {
                log_line!("arrêt après désinstallation");
                *outcome = Outcome::Quit;
                return true;
            }
            Ok(_) => {
                push_state(attached);
                notify(attached, "Désinstallation terminée.", "success");
            }
            Err(error) => notify(
                attached,
                &format!("Désinstallation impossible : {error:#}"),
                "error",
            ),
        },

        "openConfigFile" => open_file(crate::config::config_path()),

        "openLog" => {
            if let Ok(path) = crate::config::log_path()
                && !path.exists()
            {
                crate::logging::log("journal créé");
            }
            open_file(crate::config::log_path());
        }

        other => log_line!("message inconnu depuis la vue web : {other}"),
    }

    false
}

/// Lit la configuration envoyée par la page.
///
/// L'interface valide déjà la saisie, mais c'est le format du fichier qui fait
/// autorité : ce qui ne s'y coule pas est refusé et signalé.
fn parse_config(message: &serde_json::Value, attached: &Attached) -> Option<Config> {
    let Some(raw) = message.get("config") else {
        notify(attached, "Réglages absents du message.", "error");
        return None;
    };

    match serde_json::from_value::<Config>(raw.clone()) {
        Ok(config) => match crate::config::parse_hotkey(&config.hotkey) {
            Ok(_) => Some(config),
            Err(error) => {
                notify(attached, &format!("Raccourci invalide : {error:#}"), "error");
                None
            }
        },
        Err(error) => {
            notify(attached, &format!("Réglages invalides : {error}"), "error");
            None
        }
    }
}

fn set_autostart(wanted: bool) -> Result<()> {
    if wanted {
        autostart::enable()
    } else {
        autostart::disable()
    }
}

fn open_file(path: Result<std::path::PathBuf>) {
    match path {
        Ok(path) => {
            if let Err(error) = launcher::open_with_shell(&path) {
                log_line!("ouverture de {} impossible : {error:#}", path.display());
            }
        }
        Err(error) => log_line!("chemin introuvable : {error:#}"),
    }
}

/// Sélecteur de fichier pour le chemin du navigateur.
fn browse_for_browser(parent: HWND) -> Option<String> {
    let mut buffer = [0u16; 520];

    let filter: Vec<u16> = "Exécutables\0*.exe\0Tous les fichiers\0*.*\0\0"
        .encode_utf16()
        .collect();
    let title = to_wide("Choisir le navigateur");

    let mut options = OPENFILENAMEW {
        lStructSize: size_of::<OPENFILENAMEW>() as u32,
        hwndOwner: parent,
        lpstrFilter: PCWSTR(filter.as_ptr()),
        lpstrFile: PWSTR(buffer.as_mut_ptr()),
        nMaxFile: buffer.len() as u32,
        lpstrTitle: PCWSTR(title.as_ptr()),
        Flags: OFN_FILEMUSTEXIST,
        ..Default::default()
    };

    if !unsafe { GetOpenFileNameW(&mut options) }.as_bool() {
        return None;
    }

    let end = buffer.iter().position(|value| *value == 0).unwrap_or(0);
    Some(String::from_utf16_lossy(&buffer[..end]))
}
