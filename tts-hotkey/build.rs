//! Ressources Windows du binaire : icône de fichier, manifeste et métadonnées.
//!
//! Sans icône de ressource, l'exécutable porte l'icône générique de Windows et
//! reste introuvable dans l'explorateur, la barre des tâches et Alt+Tab —
//! l'icône embarquée par `include_bytes!` ne sert, elle, qu'à la zone de
//! notification.

fn main() {
    if !std::env::var("CARGO_CFG_TARGET_OS").is_ok_and(|os| os == "windows") {
        return;
    }

    println!("cargo:rerun-if-changed=assets/tts-hotkey.ico");
    println!("cargo:rerun-if-changed=assets/tts-hotkey.manifest");

    let mut resource = winresource::WindowsResource::new();
    resource.set_icon("assets/tts-hotkey.ico");
    resource.set_manifest_file("assets/tts-hotkey.manifest");
    resource.set("FileDescription", "Synthèse vocale Just Tools : lecture du presse-papiers");
    resource.set("ProductName", "Synthèse vocale (Just Tools)");
    resource.set("OriginalFilename", "tts-hotkey.exe");

    // Un échec ici ne doit pas empêcher de compiler : le binaire reste
    // fonctionnel, seulement sans icône ni styles visuels.
    if let Err(error) = resource.compile() {
        println!("cargo:warning=ressources Windows non embarquées : {error}");
    }
}
