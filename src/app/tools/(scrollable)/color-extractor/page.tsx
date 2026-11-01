"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { ImagePlus, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ColorThief from "colorthief";
import { CopyButton } from "@/components/site/copy-button";
import { ToolPage } from "@/components/site/tool-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ColorPalette {
  id: string;
  colors: string[];
  /** Une miniature en data URL, ou une chaîne vide pour une entrée ancienne. */
  imageUrl: string;
  timestamp: number;
  colorCount: number;
}

const HISTORY_KEY = "colorExtractorHistory";
const HISTORY_LIMIT = 10;
const THUMBNAIL_SIZE = 320;
const MIN_COLORS = 5;
const MAX_COLORS = 20;

const COPY_FORMATS = [
  {
    id: "css",
    name: "CSS",
    format: (colors: string[]) =>
      `:root {\n${colors
        .map((color, index) => `  --color-${index + 1}: ${color};`)
        .join("\n")}\n}`,
  },
  {
    id: "json",
    name: "JSON",
    format: (colors: string[]) => JSON.stringify({ colors }, null, 2),
  },
  {
    id: "hex",
    name: "Hexa",
    format: (colors: string[]) => colors.join(", "),
  },
  {
    id: "array",
    name: "Tableau",
    format: (colors: string[]) =>
      `[${colors.map((color) => `"${color}"`).join(", ")}]`,
  },
];

function readHistory(): ColorPalette[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (!saved) return [];
    const entries = JSON.parse(saved) as ColorPalette[];
    // Les anciennes entrées gardaient une URL d'objet, morte dès le rechargement.
    return entries.map((entry) =>
      entry.imageUrl.startsWith("blob:") ? { ...entry, imageUrl: "" } : entry
    );
  } catch {
    return [];
  }
}

/**
 * Une miniature autonome : l'historique survit au rechargement, ce qu'une URL
 * d'objet ne permet pas, et reste assez léger pour le localStorage.
 */
function createThumbnail(image: HTMLImageElement) {
  const { naturalWidth, naturalHeight } = image;
  const scale = Math.min(
    1,
    THUMBNAIL_SIZE / Math.max(naturalWidth, naturalHeight, 1)
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export default function ColorExtractor() {
  const [urlDraft, setUrlDraft] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [colorCount, setColorCount] = useState(10);
  const [history, setHistory] = useState<ColorPalette[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [formatId, setFormatId] = useState(COPY_FORMATS[0].id);
  const latestExtraction = useRef(0);

  const hasResult = previewUrl !== "" || dominantColors.length > 0;

  useEffect(() => {
    setHistory(readHistory());
    setHistoryReady(true);
  }, []);

  // `historyReady` empêche d'écrire la liste vide initiale : en mode strict, les
  // effets rejoués relisaient ce `[]` et l'historique disparaissait.
  useEffect(() => {
    if (!historyReady) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Stockage plein ou bloqué : l'historique vaut pour cette visite.
    }
  }, [history, historyReady]);

  useEffect(
    () => () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const extractColors = (
    imageSrc: string,
    count: number,
    remember: boolean
  ) => {
    // Seule la dernière analyse compte : une image lourde lancée avant ne doit
    // pas écraser le résultat d'une image choisie après.
    latestExtraction.current += 1;
    const extraction = latestExtraction.current;
    setIsLoading(true);

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      if (extraction !== latestExtraction.current) return;
      try {
        const colors = new ColorThief()
          .getPalette(image, count)
          .map(
            ([r, g, b]) =>
              `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
          );
        setDominantColors(colors);

        if (remember) {
          const entry: ColorPalette = {
            id: Date.now().toString(),
            colors,
            imageUrl: createThumbnail(image),
            timestamp: Date.now(),
            colorCount: colors.length,
          };
          setHistory((previous) => [
            entry,
            ...previous.slice(0, HISTORY_LIMIT - 1),
          ]);
        }
      } catch (error) {
        console.error("Erreur lors de l'extraction :", error);
        toast.error("Extraction impossible sur cette image. Essaie-en une autre.");
      } finally {
        setIsLoading(false);
      }
    };

    image.onerror = () => {
      if (extraction !== latestExtraction.current) return;
      setPreviewUrl("");
      setDominantColors([]);
      setIsLoading(false);
      toast.error(
        "Image impossible à charger. Vérifie que l'adresse pointe vers une image publique."
      );
    };

    image.src = imageSrc;
  };

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Ce fichier n'est pas une image. Choisis un PNG, un JPG ou un WebP.");
      return;
    }
    setUrlDraft("");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    extractColors(url, colorCount, true);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadFile(file);
    // Sans ça, choisir deux fois le même fichier ne déclenche rien.
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const handleDragLeave = (event: DragEvent) => {
    // Passer au-dessus d'un enfant de la zone n'est pas en sortir.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  };

  const handleUrlSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = urlDraft.trim();
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

    // Le proxy évite les blocages CORS, à l'affichage comme à l'analyse.
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(trimmed)}`;
    setPreviewUrl(proxyUrl);
    extractColors(proxyUrl, colorCount, true);
  };

  const handleCountCommit = (count: number) => {
    if (previewUrl) extractColors(previewUrl, count, false);
  };

  const loadFromHistory = (palette: ColorPalette) => {
    latestExtraction.current += 1;
    setIsLoading(false);
    setDominantColors(palette.colors);
    setPreviewUrl(palette.imageUrl);
    setColorCount(Math.max(MIN_COLORS, palette.colorCount));
    toast.success("Palette rechargée depuis l'historique.");
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Stockage bloqué : il n'y a rien à retirer.
    }
  };

  return (
    <ToolPage>
      {hasResult && (
        <Card className="asc-animate-step-in @container gap-5 p-5">
          <div
            className={cn(
              "grid gap-5",
              previewUrl && "@3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
            )}
          >
            {previewUrl && (
              // `next/image` est inapplicable : la source est une URL d'objet, une
              // miniature en data URL ou le proxy, hors de portée de l'optimiseur.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Image analysée"
                className="bg-surface border-border rounded-field max-h-96 w-full max-w-full border object-contain"
              />
            )}

            <div className="flex min-w-0 flex-col gap-3">
              {isLoading ? (
                <p
                  role="status"
                  className="text-fg-muted flex items-center gap-2 text-sm"
                >
                  <Loader2
                    size={14}
                    className="asc-animate-spin"
                    aria-hidden="true"
                  />
                  Extraction des couleurs…
                </p>
              ) : (
                <h2 className="text-fg text-sm font-medium">
                  {dominantColors.length}&nbsp;couleurs dominantes
                </h2>
              )}

              <ul
                // Le remplacement se voit, y compris quand seul le nombre a changé.
                key={dominantColors.join()}
                className="asc-animate-fade grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-x-3 gap-y-2"
              >
                {dominantColors.map((color, index) => (
                  <li key={index} className="flex min-w-0 flex-col gap-0.5">
                    <div
                      aria-hidden="true"
                      className="border-border h-14 rounded-md border"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex min-w-0 items-center justify-between gap-1">
                      <span className="text-fg font-mono text-xs">{color}</span>
                      <CopyButton
                        value={color}
                        iconOnly
                        variant="ghost"
                        size="icon"
                        label={`Copier ${color}`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {dominantColors.length > 0 && (
            <Tabs
              value={formatId}
              onValueChange={setFormatId}
              className="border-border gap-3 border-t pt-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TabsList aria-label="Format de copie" className="max-sm:w-full">
                  {COPY_FORMATS.map(({ id, name }) => (
                    <TabsTrigger key={id} value={id}>
                      {name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <CopyButton
                  value={() =>
                    (
                      COPY_FORMATS.find(({ id }) => id === formatId) ??
                      COPY_FORMATS[0]
                    ).format(dominantColors)
                  }
                  label="Copier toutes les couleurs"
                  className="max-sm:w-full"
                />
              </div>
              {COPY_FORMATS.map(({ id, format }) => (
                <TabsContent key={id} value={id} className="min-w-0">
                  <pre className="bg-surface border-border text-fg-muted rounded-field max-h-44 overflow-y-auto border p-3 font-mono text-xs break-all whitespace-pre-wrap">
                    {format(dominantColors)}
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </Card>
      )}

      <section
        aria-label="Image à analyser"
        className={cn(
          "flex flex-col gap-5",
          hasResult && "border-border border-t pt-6"
        )}
      >
        <label
          onDrop={handleDrop}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={handleDragLeave}
          className={cn(
            "rounded-card has-focus-visible:border-primary flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-6 text-center transition-colors duration-(--animate-duration-fast)",
            hasResult ? "min-h-32 py-6" : "min-h-64 py-10",
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
              : hasResult
                ? "Glisse une autre image ici, ou clique pour la choisir"
                : "Glisse une image ici, ou clique pour la choisir"}
          </span>
          <span className="text-fg-muted text-[0.8125rem] leading-snug">
            PNG, JPG ou WebP. Ton fichier est analysé dans ton navigateur.
          </span>
        </label>

        <form
          onSubmit={handleUrlSubmit}
          noValidate
          className="flex flex-col gap-2"
        >
          <Label htmlFor="image-url">Ou colle l&apos;adresse d&apos;une image</Label>
          <div className="flex gap-2">
            <Input
              id="image-url"
              type="url"
              placeholder="https://exemple.com/image.jpg"
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="asc-animate-spin" aria-hidden="true" />
              ) : (
                <LinkIcon aria-hidden="true" />
              )}
              Analyser
            </Button>
          </div>
        </form>

        <div className="border-border flex flex-col gap-3 border-t pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="color-count">Nombre de couleurs</Label>
            <span className="text-fg font-mono text-sm tabular-nums">
              {colorCount}
            </span>
          </div>
          <Slider
            id="color-count"
            aria-label="Nombre de couleurs"
            min={MIN_COLORS}
            max={MAX_COLORS}
            step={1}
            value={[colorCount]}
            onValueChange={([count]) => setColorCount(count)}
            onValueCommit={([count]) => handleCountCommit(count)}
          />
        </div>
      </section>

      {history.length > 0 && (
        <section
          aria-labelledby="extraction-history"
          className="border-border flex flex-col gap-2 border-t pt-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="extraction-history" className="text-fg text-sm font-medium">
              Historique
            </h2>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Effacer
            </Button>
          </div>
          <ul className="divide-border flex flex-col divide-y">
            {history.map((palette) => (
              <li key={palette.id}>
                <button
                  type="button"
                  onClick={() => loadFromHistory(palette)}
                  className="hover:bg-surface rounded-field flex w-full min-w-0 cursor-pointer items-center gap-3 px-2 py-2.5 text-start transition-colors duration-(--animate-duration-fast)"
                >
                  {palette.imageUrl ? (
                    // Même raison : une miniature en data URL.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={palette.imageUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="bg-surface size-12 shrink-0 rounded-md"
                    />
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="text-fg-muted text-xs">
                      {palette.colorCount}&nbsp;couleurs,{" "}
                      {new Date(palette.timestamp).toLocaleDateString("fr-FR")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex h-5 overflow-hidden rounded-sm"
                    >
                      {palette.colors.map((color, index) => (
                        <span
                          key={index}
                          className="min-w-0 flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ToolPage>
  );
}
