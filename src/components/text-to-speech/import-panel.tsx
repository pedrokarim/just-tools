"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Clipboard,
  FileText,
  Image as ImageIcon,
  Loader2,
  Play,
  Plus,
  X,
} from "lucide-react";
import {
  extractTextFromImageSilent,
  extractTextFromImageURLSilent,
  getClipboardText,
  importTextFile,
} from "@/lib/file-import";

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
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);

  const [isClipboardLoading, setIsClipboardLoading] = useState(false);
  const [isFileImportLoading, setIsFileImportLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

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
        toast.error("Tous les fichiers doivent être des images");
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
          toast.success(`${additions.length} image(s) ajoutée(s)`);
        }

        return [...prev, ...additions];
      });
    },
    []
  );

  const handleAddImageUrl = useCallback(() => {
    const url = currentImageUrl.trim();
    if (!url) {
      toast.error("Veuillez entrer une URL d'image");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Veuillez entrer une URL valide");
      return;
    }

    if (imageUrls.includes(url)) {
      toast.warning("Cette URL est déjà dans la liste");
      return;
    }

    setImageUrls((prev) => [...prev, url]);
    setCurrentImageUrl("");
    toast.success("URL ajoutée à la liste");
  }, [currentImageUrl, imageUrls]);

  const handleBatchExtract = useCallback(async () => {
    if (imageUrls.length + imageFiles.length === 0) {
      toast.error("Aucun élément dans la liste d'attente");
      return;
    }

    setIsExtracting(true);
    toast.info("Extraction en cours...");

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
      toast.error("Aucun texte n'a pu être extrait");
      return;
    }

    onAppendText(extracted.join("\n\n---\n\n"));
    setImageUrls([]);
    setImageFiles([]);
    toast.success(
      `${extracted.length} élément(s) traité(s)${
        errors > 0 ? `, ${errors} erreur(s)` : ""
      }`
    );
  }, [imageFiles, imageUrls, onAppendText]);

  const queueSize = imageUrls.length + imageFiles.length;

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleClipboard}
        disabled={isClipboardLoading}
      >
        {isClipboardLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Clipboard className="mr-2 h-4 w-4" />
        )}
        {isClipboardLoading ? "Récupération…" : "Coller depuis le presse-papiers"}
      </Button>

      <div>
        <input
          type="file"
          accept=".txt,.md,.markdown,.csv,.json,.html,.xml,text/*"
          onChange={handleFileImport}
          className="hidden"
          id="tts-file-import"
          disabled={isFileImportLoading}
        />
        <label
          htmlFor="tts-file-import"
          className={`inline-flex w-full items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent ${
            isFileImportLoading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
        >
          {isFileImportLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          {isFileImportLoading ? "Import en cours…" : "Importer un fichier texte"}
        </label>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium">Reconnaissance de texte (OCR)</p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddImageFiles}
          className="hidden"
          id="tts-image-ocr"
        />
        <label
          htmlFor="tts-image-ocr"
          className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Sélectionner des images
        </label>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowImageUrlInput((prev) => !prev)}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Ajouter des URLs d&apos;images
        </Button>

        <AnimatePresence>
          {showImageUrlInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex space-x-2 pt-2">
                <Input
                  value={currentImageUrl}
                  onChange={(event) => setCurrentImageUrl(event.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                  onKeyDown={(event) =>
                    event.key === "Enter" && handleAddImageUrl()
                  }
                  autoFocus
                />
                <Button
                  variant="outline"
                  onClick={handleAddImageUrl}
                  disabled={!currentImageUrl.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {queueSize > 0 && (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              En attente ({queueSize})
            </span>
            <Button
              size="sm"
              onClick={handleBatchExtract}
              disabled={isExtracting}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {isExtracting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Extraire
            </Button>
          </div>

          <div className="max-h-40 space-y-1 overflow-y-auto">
            {imageUrls.map((url, index) => (
              <div
                key={`url-${url}`}
                className="flex items-center justify-between gap-2 rounded border bg-muted/40 p-2"
              >
                <span className="truncate text-xs">{url}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 shrink-0 p-0"
                  onClick={() =>
                    setImageUrls((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {imageFiles.map((file, index) => (
              <div
                key={`file-${file.name}-${file.size}`}
                className="flex items-center justify-between gap-2 rounded border bg-muted/40 p-2"
              >
                <span className="truncate text-xs">
                  {file.name}{" "}
                  <span className="text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(1)} Mo)
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 shrink-0 p-0"
                  onClick={() =>
                    setImageFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Astuce : vous pouvez aussi glisser-déposer un fichier texte ou une image
        directement sur la zone de texte.
      </p>
    </div>
  );
}
