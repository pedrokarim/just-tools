"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type FormEvent,
} from "react";
import { Download, ImagePlus, Loader2, Scissors, X } from "lucide-react";
import { toast } from "sonner";
import { ToolPage } from "@/components/site/tool-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BackgroundOption = "transparent" | "white" | "black" | "custom";
type StageView = "result" | "source";

const MAX_IMAGE_PIXELS = 4_000_000;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const BACKGROUND_OPTIONS: { value: BackgroundOption; label: string }[] = [
  { value: "transparent", label: "Transparent" },
  { value: "white", label: "Blanc" },
  { value: "black", label: "Noir" },
  { value: "custom", label: "Personnalisé" },
];

/** Le damier de la transparence, sur les jetons : il suit le thème. */
const CHECKER_STYLE: CSSProperties = {
  backgroundImage:
    "repeating-conic-gradient(var(--asc-border) 0% 25%, transparent 0% 50%)",
  backgroundSize: "20px 20px",
};

export default function RemoveBackgroundPage() {
  const [sourceFile, setSourceFile] = useState<Blob | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [view, setView] = useState<StageView>("source");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [background, setBackground] = useState<BackgroundOption>("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");

  // Deux effets séparés : avec un seul, l'arrivée du résultat révoquait aussi
  // l'URL de l'image d'origine, encore affichée.
  useEffect(
    () => () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    },
    [sourceUrl]
  );

  useEffect(
    () => () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    },
    [resultUrl]
  );

  const loadFromBlob = (blob: Blob) => {
    if (!blob.type.startsWith("image/")) {
      toast.error("Ce fichier n'est pas une image. Choisis un PNG, un JPG ou un WebP.");
      return;
    }
    if (blob.size > MAX_FILE_SIZE) {
      toast.error("Image trop lourde. Choisis un fichier de 20 Mo au plus.");
      return;
    }

    setSourceUrl(URL.createObjectURL(blob));
    setSourceFile(blob);
    setResultUrl(null);
    setResultBlob(null);
    setView("source");
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadFromBlob(file);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) loadFromBlob(file);
  };

  const handleDragLeave = (event: DragEvent) => {
    // Passer au-dessus d'un enfant de la zone n'est pas en sortir.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  };

  const handleUrlLoad = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      toast.error("Colle d'abord l'adresse d'une image.");
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      toast.error(
        "Adresse invalide. Colle une adresse complète, comme https://exemple.com/image.jpg."
      );
      return;
    }

    setIsLoadingUrl(true);
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(trimmed)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("fetch failed");
      loadFromBlob(await response.blob());
    } catch {
      toast.error(
        "Image impossible à charger. Vérifie que l'adresse pointe vers une image publique."
      );
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const resizeIfTooLarge = async (blob: Blob): Promise<Blob> => {
    const bitmap = await createImageBitmap(blob);
    const pixels = bitmap.width * bitmap.height;
    if (pixels <= MAX_IMAGE_PIXELS) {
      bitmap.close();
      return blob;
    }
    const ratio = Math.sqrt(MAX_IMAGE_PIXELS / pixels);
    const width = Math.round(bitmap.width * ratio);
    const height = Math.round(bitmap.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("resize failed"))),
        "image/png"
      )
    );
  };

  const handleRemoveBackground = async () => {
    if (!sourceFile) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressLabel("Préparation…");

    try {
      const resized = await resizeIfTooLarge(sourceFile);

      const { removeBackground } = await import("@imgly/background-removal");

      const output = await removeBackground(resized, {
        progress: (key: string, current: number, total: number) => {
          const percent = total > 0 ? Math.round((current / total) * 100) : 0;
          setProgress(percent);
          if (key.startsWith("fetch")) {
            setProgressLabel("Téléchargement du modèle, la première fois seulement…");
          } else if (key.startsWith("compute")) {
            setProgressLabel("Analyse de l'image…");
          } else {
            setProgressLabel("Traitement…");
          }
        },
      });

      setResultBlob(output);
      setResultUrl(URL.createObjectURL(output));
      setView("result");
    } catch (err) {
      console.error(err);
      toast.error("Le traitement a échoué. Réessaie avec une image plus petite.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  const getBackgroundColor = (): string | null => {
    if (background === "transparent") return null;
    if (background === "white") return "#ffffff";
    if (background === "black") return "#000000";
    return customColor;
  };

  const composeForExport = async (): Promise<Blob> => {
    if (!resultBlob) throw new Error("no result");
    const color = getBackgroundColor();
    if (!color) return resultBlob;

    const bitmap = await createImageBitmap(resultBlob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("compose failed"))),
        "image/png"
      )
    );
  };

  const handleDownload = async () => {
    if (!resultBlob) return;
    try {
      const blob = await composeForExport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `remove-background-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Le téléchargement a échoué. Réessaie.");
    }
  };

  const handleReset = () => {
    setSourceFile(null);
    setSourceUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setImageUrl("");
    setView("source");
  };

  const showsResult = view === "result" && resultUrl !== null;
  const backgroundColor = getBackgroundColor();
  const stageStyle: CSSProperties | undefined = !showsResult
    ? undefined
    : backgroundColor
      ? { backgroundColor }
      : CHECKER_STYLE;

  if (!sourceFile) {
    return (
      <ToolPage>
        <label
          onDrop={handleDrop}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={handleDragLeave}
          className={cn(
            "rounded-card has-focus-visible:border-primary flex min-h-72 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-6 py-10 text-center transition-colors duration-(--animate-duration-fast)",
            isDragOver
              ? "border-primary bg-primary-soft"
              : "border-border-strong hover:border-primary hover:bg-surface"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="sr-only"
          />
          <ImagePlus size={20} className="text-fg-subtle" aria-hidden="true" />
          <span className="text-fg text-sm font-medium">
            {isDragOver
              ? "Dépose l'image ici"
              : "Glisse une image ici, ou clique pour la choisir"}
          </span>
          <span className="text-fg-muted text-[0.8125rem] leading-snug">
            PNG, JPG ou WebP, 20&nbsp;Mo au plus. Ton fichier est traité dans ton
            navigateur et n&apos;est envoyé nulle part.
          </span>
        </label>

        <form
          onSubmit={handleUrlLoad}
          noValidate
          className="flex flex-col gap-2"
        >
          <Label htmlFor="image-url">Ou colle l&apos;adresse d&apos;une image</Label>
          <div className="flex gap-2">
            <Input
              id="image-url"
              type="url"
              placeholder="https://exemple.com/image.jpg"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" disabled={isLoadingUrl}>
              {isLoadingUrl && (
                <Loader2 className="asc-animate-spin" aria-hidden="true" />
              )}
              Charger
            </Button>
          </div>
        </form>
      </ToolPage>
    );
  }

  return (
    <ToolPage>
      <Card className="asc-animate-step-in gap-4 p-4 sm:p-5">
        <div
          className="bg-surface border-border rounded-field relative h-[min(60dvh,36rem)] min-h-72 w-full overflow-hidden border"
          style={stageStyle}
        >
          {sourceUrl && (
            <div
              // Sur un parent : l'animation de l'image fixe son opacité.
              className={cn(
                "absolute inset-0 transition-opacity duration-(--animate-duration-fast)",
                isProcessing && "opacity-50"
              )}
            >
              {/* `next/image` est inapplicable : ce sont des URL d'objet locales.
                  La clé fait se remplacer l'avant et l'après à vue. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={view}
                src={showsResult ? (resultUrl ?? sourceUrl) : sourceUrl}
                alt={showsResult ? "Image sans arrière-plan" : "Image d'origine"}
                className="asc-animate-fade size-full max-w-full object-contain"
              />
            </div>
          )}

          {isProcessing && (
            <div
              role="status"
              className="asc-animate-rise bg-elevated border-border absolute inset-x-3 bottom-3 flex flex-col gap-2 rounded-field border p-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-fg min-w-0 text-sm font-medium">
                  {progressLabel}
                </span>
                {progress > 0 && (
                  <span className="text-fg-subtle shrink-0 text-xs tabular-nums">
                    {progress}&nbsp;%
                  </span>
                )}
              </div>
              <div className="bg-border h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full origin-left rounded-full transition-[scale] duration-(--animate-duration-fast)"
                  style={{ scale: `${progress / 100} 1` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resultUrl ? (
            <Button onClick={handleDownload}>
              <Download aria-hidden="true" />
              Télécharger
            </Button>
          ) : (
            <Button onClick={handleRemoveBackground} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="asc-animate-spin" aria-hidden="true" />
              ) : (
                <Scissors aria-hidden="true" />
              )}
              Supprimer l&apos;arrière-plan
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={isProcessing}
          >
            <X aria-hidden="true" />
            Nouvelle image
          </Button>

          {resultUrl && (
            <div
              role="group"
              aria-label="Image affichée"
              className="flex items-center gap-1 sm:ms-auto"
            >
              <Button
                size="sm"
                variant={view === "result" ? "soft" : "ghost"}
                aria-pressed={view === "result"}
                onClick={() => setView("result")}
              >
                Résultat
              </Button>
              <Button
                size="sm"
                variant={view === "source" ? "soft" : "ghost"}
                aria-pressed={view === "source"}
                onClick={() => setView("source")}
              >
                Original
              </Button>
            </div>
          )}
        </div>
      </Card>

      {resultUrl && (
        <fieldset className="asc-animate-step-in flex flex-col gap-1">
          <legend className="text-fg mb-2 text-sm font-medium">
            Fond de l&apos;image exportée
          </legend>
          <div className="flex flex-wrap items-center gap-2">
            {BACKGROUND_OPTIONS.map(({ value, label }) => (
              <Button
                key={value}
                variant={background === value ? "soft" : "outline"}
                aria-pressed={background === value}
                onClick={() => {
                  setBackground(value);
                  setView("result");
                }}
              >
                {label}
              </Button>
            ))}
            {background === "custom" && (
              <Input
                type="color"
                aria-label="Couleur de fond personnalisée"
                value={customColor}
                onChange={(event) => setCustomColor(event.target.value)}
                className="w-14 shrink-0 cursor-pointer p-1"
              />
            )}
          </div>
        </fieldset>
      )}
    </ToolPage>
  );
}
