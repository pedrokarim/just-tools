//! Installation locale, sans privilèges administrateur.
//!
//! Le binaire est autonome : « installer » se réduit à le poser à un endroit
//! stable et à le rendre trouvable.
//!
//! ```text
//! %LOCALAPPDATA%\Programs\tts-hotkey\tts-hotkey.exe   copie stable
//! …\Menu Démarrer\Programmes\Synthèse vocale (Just Tools).lnk   recherche Windows
//! ```
//!
//! Sans cela, l'exécutable reste là où il a été compilé, `cargo clean` le fait
//! disparaître, et l'entrée de démarrage automatique pointe alors dans le vide.

use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, anyhow};
use windows::Win32::System::Com::{
    CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED, CoCreateInstance, CoInitializeEx,
    CoUninitialize, IPersistFile,
};
use windows::Win32::UI::Shell::{IShellLinkW, ShellLink};
use windows::core::{Interface, PCWSTR};

use crate::logging::log_line;

/// Nom du dossier d'installation et du fichier de raccourci.
const FOLDER_NAME: &str = "tts-hotkey";
const EXECUTABLE_NAME: &str = "tts-hotkey.exe";
const SHORTCUT_NAME: &str = "Synthèse vocale (Just Tools).lnk";

/// Suffixe donné à l'ancien binaire pendant une mise à jour : Windows autorise
/// le *renommage* d'un exécutable en cours d'exécution, jamais son écrasement.
const REPLACED_SUFFIX: &str = ".ancien";

fn to_wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

/// `%LOCALAPPDATA%\Programs\tts-hotkey`.
pub fn install_dir() -> Result<PathBuf> {
    let base = dirs::data_local_dir()
        .ok_or_else(|| anyhow!("dossier des données locales introuvable"))?;
    Ok(base.join("Programs").join(FOLDER_NAME))
}

pub fn installed_executable() -> Result<PathBuf> {
    Ok(install_dir()?.join(EXECUTABLE_NAME))
}

/// Dossier « Menu Démarrer\Programmes » de l'utilisateur.
fn start_menu_dir() -> Result<PathBuf> {
    let base = dirs::data_dir().ok_or_else(|| anyhow!("dossier Roaming introuvable"))?;
    Ok(base
        .join("Microsoft")
        .join("Windows")
        .join("Start Menu")
        .join("Programs"))
}

pub fn shortcut_path() -> Result<PathBuf> {
    Ok(start_menu_dir()?.join(SHORTCUT_NAME))
}

/// État de l'installation, tel qu'affiché par la fenêtre de configuration.
#[derive(Debug, Clone)]
pub struct Status {
    pub current_exe: PathBuf,
    pub installed_exe: PathBuf,
    /// L'exécutable existe à l'emplacement d'installation.
    pub installed: bool,
    /// Le processus courant s'exécute depuis cet emplacement.
    pub running_from_install: bool,
    pub has_shortcut: bool,
}

pub fn status() -> Result<Status> {
    let current_exe = std::env::current_exe().context("chemin de l'exécutable introuvable")?;
    let installed_exe = installed_executable()?;

    // Comparaison canonique : les chemins peuvent différer par la casse ou un
    // lien de dossier tout en désignant le même fichier.
    let same = std::fs::canonicalize(&current_exe)
        .ok()
        .zip(std::fs::canonicalize(&installed_exe).ok())
        .map(|(a, b)| a == b)
        .unwrap_or(false);

    Ok(Status {
        installed: installed_exe.is_file(),
        running_from_install: same,
        has_shortcut: shortcut_path().map(|path| path.is_file()).unwrap_or(false),
        current_exe,
        installed_exe,
    })
}

/// Exécutable à inscrire au démarrage automatique : la copie installée si elle
/// existe, sinon le binaire courant.
///
/// C'est ce qui évite l'entrée de démarrage orpheline après un `cargo clean`.
pub fn preferred_executable() -> Result<PathBuf> {
    let installed = installed_executable()?;
    if installed.is_file() {
        return Ok(installed);
    }
    std::env::current_exe().context("chemin de l'exécutable introuvable")
}

/// Supprime les binaires laissés par une mise à jour précédente.
///
/// Appelé à chaque démarrage : à ce moment l'ancien fichier n'est plus
/// verrouillé par personne.
pub fn cleanup_previous() {
    let Ok(dir) = install_dir() else { return };
    let Ok(entries) = std::fs::read_dir(&dir) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path
            .to_string_lossy()
            .ends_with(REPLACED_SUFFIX)
            && std::fs::remove_file(&path).is_ok()
        {
            log_line!("ancien binaire supprimé : {}", path.display());
        }
    }
}

/// Crée un raccourci Windows (`.lnk`) via l'interface shell.
fn create_shortcut(target: &Path, link: &Path, description: &str) -> Result<()> {
    let target_wide = to_wide(&target.to_string_lossy());
    let link_wide = to_wide(&link.to_string_lossy());
    let description_wide = to_wide(description);
    let working_directory = target
        .parent()
        .map(|parent| to_wide(&parent.to_string_lossy()));

    unsafe {
        // Le résultat est volontairement ignoré : COM peut déjà être initialisé
        // dans un autre mode par une dépendance, ce qui n'empêche pas d'obtenir
        // l'objet ci-dessous.
        let initialized = CoInitializeEx(None, COINIT_APARTMENTTHREADED);

        let result = (|| -> Result<()> {
            let link_object: IShellLinkW =
                CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER)
                    .context("création de l'objet raccourci")?;

            link_object
                .SetPath(PCWSTR(target_wide.as_ptr()))
                .context("cible du raccourci")?;
            link_object
                .SetDescription(PCWSTR(description_wide.as_ptr()))
                .context("description du raccourci")?;

            if let Some(directory) = &working_directory {
                link_object
                    .SetWorkingDirectory(PCWSTR(directory.as_ptr()))
                    .context("dossier de travail du raccourci")?;
            }

            // L'icône du raccourci est celle du binaire : ressource 0.
            link_object
                .SetIconLocation(PCWSTR(target_wide.as_ptr()), 0)
                .context("icône du raccourci")?;

            let persist: IPersistFile = link_object
                .cast()
                .context("interface d'enregistrement du raccourci")?;
            persist
                .Save(PCWSTR(link_wide.as_ptr()), true)
                .context("enregistrement du raccourci")?;

            Ok(())
        })();

        if initialized.is_ok() {
            CoUninitialize();
        }

        result
    }
}

/// Installe le binaire courant et crée le raccourci du menu Démarrer.
///
/// Retourne le chemin de l'exécutable installé.
pub fn install() -> Result<PathBuf> {
    let status = status()?;

    if status.running_from_install {
        // Déjà en place : il reste à garantir le raccourci.
        ensure_shortcut(&status.installed_exe)?;
        return Ok(status.installed_exe);
    }

    let directory = install_dir()?;
    std::fs::create_dir_all(&directory)
        .with_context(|| format!("création de {}", directory.display()))?;

    let destination = status.installed_exe.clone();

    // Une copie installée peut être en cours d'exécution : on l'écarte par
    // renommage, seule opération que Windows autorise sur un binaire verrouillé.
    if destination.exists() {
        let retired = destination.with_extension(format!(
            "exe{REPLACED_SUFFIX}",
        ));
        let _ = std::fs::remove_file(&retired);
        std::fs::rename(&destination, &retired).with_context(|| {
            format!(
                "remplacement impossible : {} est peut-être en cours d'exécution",
                destination.display()
            )
        })?;
        log_line!("version précédente écartée vers {}", retired.display());
    }

    std::fs::copy(&status.current_exe, &destination).with_context(|| {
        format!(
            "copie de {} vers {}",
            status.current_exe.display(),
            destination.display()
        )
    })?;

    ensure_shortcut(&destination)?;
    log_line!("installé dans {}", destination.display());

    Ok(destination)
}

/// Crée le raccourci du menu Démarrer s'il manque ou s'il pointe ailleurs.
fn ensure_shortcut(target: &Path) -> Result<()> {
    let link = shortcut_path()?;

    if let Some(parent) = link.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("création de {}", parent.display()))?;
    }

    create_shortcut(
        target,
        &link,
        "Lit le presse-papiers à voix haute via Just Tools",
    )?;
    log_line!("raccourci créé : {}", link.display());

    Ok(())
}

/// Retire le raccourci du menu Démarrer.
pub fn remove_shortcut() -> Result<()> {
    let link = shortcut_path()?;
    match std::fs::remove_file(&link) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error).with_context(|| format!("suppression de {}", link.display())),
    }
}

/// Résultat d'une désinstallation, pour informer l'utilisateur avec justesse.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Removal {
    /// Rien n'était installé.
    NothingToDo,
    /// Dossier supprimé immédiatement.
    Removed,
    /// Suppression planifiée : le processus courant s'exécute depuis le dossier
    /// et doit d'abord se terminer.
    Deferred,
}

/// Retire le raccourci, l'entrée de démarrage et le dossier d'installation.
///
/// La configuration et le journal sont conservés : ils vivent ailleurs
/// (`%APPDATA%\just-tools`) et représentent le travail de l'utilisateur.
pub fn uninstall() -> Result<Removal> {
    remove_shortcut()?;
    crate::autostart::disable()?;

    let status = status()?;
    let directory = install_dir()?;

    if !directory.exists() {
        return Ok(Removal::NothingToDo);
    }

    if status.running_from_install {
        schedule_directory_removal(&directory)?;
        log_line!("suppression différée de {}", directory.display());
        return Ok(Removal::Deferred);
    }

    std::fs::remove_dir_all(&directory)
        .with_context(|| format!("suppression de {}", directory.display()))?;
    log_line!("dossier d'installation supprimé : {}", directory.display());

    Ok(Removal::Removed)
}

/// Planifie la suppression du dossier une fois le processus terminé.
///
/// Un binaire ne peut pas se supprimer lui-même ; la variante par le registre
/// (`MOVEFILE_DELAY_UNTIL_REBOOT`) exige des privilèges administrateur. On
/// délègue donc à un interpréteur de commandes qui patiente puis efface.
fn schedule_directory_removal(directory: &Path) -> Result<()> {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;

    Command::new("cmd")
        .arg("/C")
        .arg(format!(
            // `ping` sert de temporisation : `timeout` échoue sans console.
            "ping 127.0.0.1 -n 4 >nul & rmdir /s /q \"{}\"",
            directory.display()
        ))
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .context("planification de la suppression")?;

    Ok(())
}
