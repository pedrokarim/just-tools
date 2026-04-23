"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  Link as LinkIcon,
  Scissors,
  Loader2,
  X,
  Image as ImageIcon,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";

type BackgroundOption = "transparent" | "white" | "black" | "custom";

const MAX_IMAGE_PIXELS = 4_000_000;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function RemoveBackgroundPage() {
  const [sourceFile, setSourceFile] = useState<Blob | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [background, setBackground] = useState<BackgroundOption>("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourceUrl, resultUrl]);

  const loadFromBlob = useCallback(
    async (blob: Blob) => {
      if (!blob.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }
      if (blob.size > MAX_FILE_SIZE) {
        toast.error("Image trop volumineuse (max 20 Mo)");
        return;
      }

      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);

      const url = URL.createObjectURL(blob);
      setSourceUrl(url);
      setSourceFile(blob);
      setResultUrl(null);
      setResultBlob(null);
      toast.success("Image chargée");
    },
    [sourceUrl, resultUrl]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFromBlob(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFromBlob(file);
  };

  const handleUrlLoad = async () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      toast.error("Veuillez entrer une URL d'image");
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      toast.error("URL invalide");
      return;
    }

    setIsLoadingUrl(true);
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(trimmed)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("fetch failed");
      const blob = await response.blob();
      await loadFromBlob(blob);
    } catch {
      toast.error("Impossible de charger l'image depuis cette URL");
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
    setProgressLabel("Préparation...");

    try {
      const resized = await resizeIfTooLarge(sourceFile);

      const { removeBackground } = await import("@imgly/background-removal");

      const output = await removeBackground(resized, {
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          setProgress(pct);
          if (key.startsWith("fetch")) {
            setProgressLabel("Téléchargement du modèle IA (première fois)...");
          } else if (key.startsWith("compute")) {
            setProgressLabel("Analyse de l'image...");
          } else {
            setProgressLabel("Traitement...");
          }
        },
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(output);
      setResultBlob(output);
      setResultUrl(url);
      toast.success("Arrière-plan supprimé !");
    } catch (err) {
      console.error(err);
      toast.error(
        "Erreur lors du traitement. Essayez avec une image plus petite."
      );
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
    const bg = getBackgroundColor();
    if (!bg) return resultBlob;

    const bitmap = await createImageBitmap(resultBlob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const mime = "image/png";
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("compose failed"))),
        mime
      )
    );
  };

  const handleDownload = async () => {
    if (!resultBlob) return;
    try {
      const blob = await composeForExport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `remove-background-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image téléchargée");
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleReset = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setSourceFile(null);
    setSourceUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setImageUrl("");
  };

  const bgColor = getBackgroundColor();

  const checkerStyle: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 mb-4">
          <Scissors className="w-7 h-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Suppression d&apos;Arrière-plan
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Supprimez automatiquement l&apos;arrière-plan de vos images grâce à
          une IA qui s&apos;exécute entièrement dans votre navigateur. Aucun
          upload serveur.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <Badge variant="secondary">100% client-side</Badge>
          <Badge variant="secondary">Gratuit</Badge>
          <Badge variant="secondary">Confidentiel</Badge>
        </div>
      </div>

      {!sourceFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importer une image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="gap-2">
                  <FileImage className="w-4 h-4" />
                  Fichier
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-950/30"
                      : "border-muted-foreground/25 hover:border-sky-400"
                  }`}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Glissez-déposez une image ici
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou cliquez pour parcourir (PNG, JPG, WebP · max 20 Mo)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </TabsContent>

              <TabsContent value="url" className="mt-4 space-y-3">
                <Label htmlFor="image-url">URL de l&apos;image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://exemple.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUrlLoad();
                    }}
                  />
                  <Button
                    onClick={handleUrlLoad}
                    disabled={isLoadingUrl}
                    className="shrink-0"
                  >
                    {isLoadingUrl ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Charger"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {sourceFile && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Image originale</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted">
                  {sourceUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sourceUrl}
                      alt="original"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Résultat</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="relative aspect-square w-full rounded-md overflow-hidden"
                  style={
                    bgColor
                      ? { backgroundColor: bgColor }
                      : checkerStyle
                  }
                >
                  {resultUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resultUrl}
                      alt="result"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-3 px-6 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                          <div className="text-sm font-medium">
                            {progressLabel}
                          </div>
                          {progress > 0 && (
                            <div className="w-full max-w-xs">
                              <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sky-500 transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="text-xs mt-1">{progress}%</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        "Cliquez sur « Supprimer l'arrière-plan »"
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Button
                  onClick={handleRemoveBackground}
                  disabled={isProcessing || !!resultUrl}
                  size="lg"
                  className="gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scissors className="w-4 h-4" />
                  )}
                  {resultUrl
                    ? "Arrière-plan supprimé"
                    : "Supprimer l'arrière-plan"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Nouvelle image
                </Button>

                {resultUrl && (
                  <Button
                    onClick={handleDownload}
                    variant="default"
                    className="gap-2 ml-auto"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </Button>
                )}
              </div>

              {resultUrl && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>Fond de l&apos;image exportée</Label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "transparent", label: "Transparent" },
                        { value: "white", label: "Blanc" },
                        { value: "black", label: "Noir" },
                        { value: "custom", label: "Personnalisé" },
                      ] as const
                    ).map((opt) => (
                      <Button
                        key={opt.value}
                        variant={
                          background === opt.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setBackground(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                    {background === "custom" && (
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="h-9 w-14 rounded cursor-pointer border"
                        aria-label="Couleur de fond personnalisée"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
