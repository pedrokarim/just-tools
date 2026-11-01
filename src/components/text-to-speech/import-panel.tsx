"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardPaste,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  ScanText,
  X } from "lucide-react";
import {
  extractTextFromImageSilent,
  extractTextFromImageURLSilent,
  getClipboardText,
  importTextFile } from "@/lib/file-import";

interface ImportPanelProps {
  /** Remplace le texte courant. */
  onText: (text: string) => void;
  /** Ajoute à la suite du texte courant. */
  onAppendText: (text: string) => void;
}

export function ImportPanel({ onText, onAppendText }: ImportPanelProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [isClipboardLoading, setIsClipboardLoading] = useState(false);
  const [isFileImportLoading, setIsFileImportLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Les champs de fichier restent cachés : ce sont de vrais boutons qui les
  // ouvrent, atteignables au clavier, ce qu'un `<label>` stylé n'est pas.
  const textFileInput = useRef<HTMLInputElement>(null);
  const imageFileInput = useRef<HTMLInputElement>(null);

  const handleClipboard = useCallback(async () => {
    setIsClipboardLoading(true);
    try {
      await getClipboardText(onText);
    } catch (error) {
      console.error("Erreur clipboard:", error);
    } finally {
      setIsClipboardLoading(false);
    }
  }, [onText]);

  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsFileImportLoading(true);
      try {
        await importTextFile(file, onText);
      } catch (error) {
        console.error("Erreur import fichier:", error);
      } finally {
        setIsFileImportLoading(false);
        event.target.value = "";
      }
    },
    [onText]
  );

  const handleAddImageFiles = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      event.target.value = "";
      if (files.length === 0) return;

      if (files.some((file) => !file.type.startsWith("image/"))) {
        toast.error("Choisis uniquement des images.");
        return;
      }

      setImageFiles((prev) => {
        const additions = files.filter(
          (file) =>
            !prev.some(
              (existing) =>
                existing.name === file.name && existing.size === file.size
            )
        );

        if (additions.length < files.length) {
          toast.warning("Certains fichiers étaient déjà dans la liste");
        }
        if (additions.length > 0) {
          toast.success(
            additions.length > 1
              ? `${additions.length} images ajoutées`
              : "Image ajoutée"
          );
        }

        return [...prev, ...additions];
      });
    },
    []
  );

  const handleAddImageUrl = useCallback(() => {
    const url = currentImageUrl.trim();
    if (!url) {
      toast.error("Saisis l'adresse d'une image.");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Cette adresse n'est pas valide. Vérifie qu'elle commence par https://.");
      return;
    }

    if (imageUrls.includes(url)) {
      toast.warning("Cette adresse est déjà dans la liste");
      return;
    }

    setImageUrls((prev) => [...prev, url]);
    setCurrentImageUrl("");
    toast.success("Adresse ajoutée à la liste");
  }, [currentImageUrl, imageUrls]);

  const handleBatchExtract = useCallback(async () => {
    if (imageUrls.length + imageFiles.length === 0) {
      toast.error("Ajoute d'abord une image à la liste.");
      return;
    }

    setIsExtracting(true);
    toast.info("Extraction en cours…");

    const extracted: string[] = [];
    let errors = 0;

    for (const url of imageUrls) {
      try {
        const text = await extractTextFromImageURLSilent(url);
        if (text.trim()) extracted.push(text.trim());
        else errors += 1;
      } catch (error) {
        console.error(`Erreur extraction URL ${url}:`, error);
        errors += 1;
      }
    }

    for (const file of imageFiles) {
      try {
        const text = await extractTextFromImageSilent(file);
        if (text.trim()) extracted.push(text.trim());
        else errors += 1;
      } catch (error) {
        console.error(`Erreur extraction fichier ${file.name}:`, error);
        errors += 1;
      }
    }

    setIsExtracting(false);

    if (extracted.length === 0) {
      toast.error("Aucun texte trouvé. Essaie avec une image plus nette.");
      return;
    }

    onAppendText(extracted.join("\n\n---\n\n"));
    setImageUrls([]);
    setImageFiles([]);
    toast.success(
      `${
        extracted.length > 1
          ? `${extracted.length} images traitées`
          : "1 image traitée"
      }${errors > 0 ? `, ${errors} en échec` : ""}`
    );
  }, [imageFiles, imageUrls, onAppendText]);

  const queueSize = imageUrls.length + imageFiles.length;

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="Importer du texte" className="flex flex-col gap-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleClipboard}
          disabled={isClipboardLoading}
        >
          {isClipboardLoading ? (
            <Loader2 className="asc-animate-spin" aria-hidden="true" />
          ) : (
            <ClipboardPaste aria-hidden="true" />
          )}
          {isClipboardLoading ? "Récupération…" : "Coller le presse-papiers"}
        </Button>

        <input
          ref={textFileInput}
          type="file"
          accept=".txt,.md,.markdown,.csv,.json,.html,.xml,text/*"
          onChange={handleFileImport}
          className="hidden"
          disabled={isFileImportLoading}
        />
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => textFileInput.current?.click()}
          disabled={isFileImportLoading}
        >
          {isFileImportLoading ? (
            <Loader2 className="asc-animate-spin" aria-hidden="true" />
          ) : (
            <FileText aria-hidden="true" />
          )}
          {isFileImportLoading ? "Import en cours…" : "Importer un fichier texte"}
        </Button>

        <p className="text-fg-muted text-xs leading-relaxed">
          Tu peux aussi déposer un fichier ou une image directement sur la zone
          de texte.
        </p>
      </section>

      <section
        aria-labelledby="tts-ocr-title"
        className="border-border flex flex-col gap-2 border-t pt-5"
      >
        <h2
          id="tts-ocr-title"
          className="text-fg font-sans text-sm font-medium tracking-normal"
        >
          Texte d&apos;une image (OCR)
        </h2>

        <input
          ref={imageFileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddImageFiles}
          className="hidden"
        />
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => imageFileInput.current?.click()}
        >
          <ImagePlus aria-hidden="true" />
          Choisir des images
        </Button>

        <div className="flex min-w-0 gap-2">
          <Input
            value={currentImageUrl}
            onChange={(event) => setCurrentImageUrl(event.target.value)}
            placeholder="https://exemple.com/image.jpg"
            aria-label="Adresse d'une image"
            onKeyDown={(event) =>
              event.key === "Enter" && handleAddImageUrl()
            }
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={handleAddImageUrl}
            disabled={!currentImageUrl.trim()}
            aria-label="Ajouter cette adresse"
            title="Ajouter cette adresse"
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>

        {queueSize > 0 && (
          <div className="asc-animate-step-in flex min-w-0 flex-col gap-2 pt-2">
            <ul className="divide-border flex max-h-40 min-w-0 flex-col divide-y overflow-y-auto">
              {imageUrls.map((url, index) => (
                <li
                  key={`url-${url}`}
                  className="flex min-w-0 items-center gap-2 py-1"
                >
                  <span
                    className="text-fg min-w-0 flex-1 truncate text-sm"
                    title={url}
                  >
                    {url}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Retirer ${url}`}
                    title="Retirer"
                    onClick={() =>
                      setImageUrls((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <X aria-hidden="true" />
                  </Button>
                </li>
              ))}

              {imageFiles.map((file, index) => (
                <li
                  key={`file-${file.name}-${file.size}`}
                  className="flex min-w-0 items-center gap-2 py-1"
                >
                  <span
                    className="text-fg min-w-0 flex-1 truncate text-sm"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span className="text-fg-subtle shrink-0 text-xs tabular-nums">
                    {(file.size / 1024 / 1024).toLocaleString("fr-FR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    &nbsp;Mo
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Retirer ${file.name}`}
                    title="Retirer"
                    onClick={() =>
                      setImageFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <X aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              onClick={handleBatchExtract}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <Loader2 className="asc-animate-spin" aria-hidden="true" />
              ) : (
                <ScanText aria-hidden="true" />
              )}
              {isExtracting ? "Extraction…" : `Extraire le texte (${queueSize})`}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
