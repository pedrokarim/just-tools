"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Link,
  Copy,
  Palette,
  History,
  Download,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Code,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import ColorThief from "colorthief";

interface ColorPalette {
  id: string;
  colors: string[];
  imageUrl: string;
  timestamp: number;
  colorCount: number;
}

interface CopyFormat {
  id: string;
  name: string;
  icon: React.ReactNode;
  format: (colors: string[]) => string;
}

const copyFormats: CopyFormat[] = [
  {
    id: "css",
    name: "Variables CSS",
    icon: <Code className="w-4 h-4" />,
    format: (colors) => {
      return `:root {\n${colors
        .map((color, index) => `  --color-${index + 1}: ${color};`)
        .join("\n")}\n}`;
    },
  },
  {
    id: "json",
    name: "JSON",
    icon: <FileText className="w-4 h-4" />,
    format: (colors) => {
      return JSON.stringify({ colors }, null, 2);
    },
  },
  {
    id: "hex",
    name: "Codes Hexadécimaux",
    icon: <Hash className="w-4 h-4" />,
    format: (colors) => {
      return colors.join(", ");
    },
  },
  {
    id: "array",
    name: "Tableau Simple",
    icon: <FileText className="w-4 h-4" />,
    format: (colors) => {
      return `[${colors.map((color) => `"${color}"`).join(", ")}]`;
    },
  },
];

export default function ColorExtractor() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colorCount, setColorCount] = useState(10);
  const [history, setHistory] = useState<ColorPalette[]>([]);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<CopyFormat>(
    copyFormats[0]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Charger l'historique depuis le localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("colorExtractorHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error);
      }
    }
  }, []);

  // Sauvegarder l'historique dans le localStorage
  useEffect(() => {
    localStorage.setItem("colorExtractorHistory", JSON.stringify(history));
  }, [history]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setImageUrl("");
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      extractColorsFromImage(url);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      toast.error("Veuillez entrer une URL d'image valide");
      return;
    }

    try {
      // Validation basique de l'URL
      new URL(imageUrl.trim());
    } catch {
      toast.error(
        "URL invalide. Veuillez entrer une URL complète (ex: https://exemple.com/image.jpg)"
      );
      return;
    }

    setUploadedImage(null);
    setPreviewUrl(imageUrl);

    // Utiliser notre API proxy pour éviter les problèmes CORS
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(
      imageUrl.trim()
    )}`;
    extractColorsFromImage(proxyUrl);
  };

  const extractColorsFromImage = async (imageSrc: string) => {
    setIsLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = async () => {
        try {
          const colorThief = new ColorThief();
          const palette = colorThief.getPalette(img, Math.min(colorCount, 20));

          const colors = palette.map(
            ([r, g, b]: [number, number, number]) =>
              `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
          );
          setDominantColors(colors);

          // Ajouter à l'historique
          const newPalette: ColorPalette = {
            id: Date.now().toString(),
            colors,
            imageUrl: imageSrc,
            timestamp: Date.now(),
            colorCount: colors.length,
          };

          setHistory((prev) => [newPalette, ...prev.slice(0, 9)]); // Garder max 10 éléments
          toast.success(`${colors.length} couleurs dominantes extraites !`);
        } catch (error) {
          console.error("Erreur lors de l'extraction:", error);
          toast.error("Erreur lors de l'extraction des couleurs");
        } finally {
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        toast.error(
          "Impossible de charger l'image. Vérifiez que :\n" +
            "• L'URL est correcte et pointe vers une image\n" +
            "• Le domaine est autorisé (Unsplash, Picsum, etc.)\n" +
            "• L'image est accessible publiquement"
        );
        setIsLoading(false);
      };

      img.src = imageSrc;
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du traitement de l'image");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papiers !");
      setShowCopyDialog(false);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const loadFromHistory = (palette: ColorPalette) => {
    setDominantColors(palette.colors);
    setPreviewUrl(palette.imageUrl);
    setColorCount(palette.colorCount);
    toast.success("Palette chargée depuis l'historique");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("colorExtractorHistory");
    toast.success("Historique effacé");
  };

  return (
    <div className="w-full space-y-8 p-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Upload/URL */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Source d'image</span>
            </CardTitle>
            <CardDescription>
              Uploadez une image ou entrez une URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload de fichier */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">Uploadez une image</Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir une image
                </Button>
              </div>
            </div>

            <Separator />

            {/* URL d'image */}
            <div className="space-y-2">
              <Label htmlFor="image-url">Ou entrez une URL d'image</Label>
              <div className="flex space-x-2">
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Paramètres */}
            <div className="space-y-2">
              <Label>Nombre de couleurs dominantes: {colorCount}</Label>
              <Slider
                value={[colorCount]}
                onValueChange={(value) => setColorCount(value[0])}
                max={20}
                min={5}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-slate-500">Entre 5 et 20 couleurs</p>
            </div>
          </CardContent>
        </Card>

        {/* Prévisualisation */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Prévisualisation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Image à analyser"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {isLoading && (
                  <div className="flex items-center justify-center space-x-2 text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extraction des couleurs...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune image sélectionnée</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Résultats */}
      {dominantColors.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Couleurs dominantes ({dominantColors.length})</span>
              </CardTitle>
              <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Choisir le format de copie</DialogTitle>
                    <DialogDescription>
                      Sélectionnez le format dans lequel vous souhaitez copier
                      les couleurs
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    {copyFormats.map((format) => (
                      <Button
                        key={format.id}
                        variant={
                          selectedFormat.id === format.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setSelectedFormat(format)}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        {format.icon}
                        <span className="text-sm">{format.name}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Prévisualisation */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Prévisualisation :
                    </Label>
                    <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-4 max-h-32 overflow-y-auto">
                      <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all">
                        {selectedFormat.format(dominantColors)}
                      </pre>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() =>
                        copyToClipboard(selectedFormat.format(dominantColors))
                      }
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCopyDialog(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {dominantColors.map((color, index) => (
                <div
                  key={index}
                  className="group relative cursor-pointer"
                  onClick={() => copyToClipboard(color)}
                >
                  <div
                    className="w-full h-16 rounded-lg shadow-md group-hover:scale-105 transition-transform duration-200"
                    style={{ backgroundColor: color }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {color}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      {history.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Historique ({history.length})</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Effacer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((palette) => (
                <div
                  key={palette.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => loadFromHistory(palette)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={palette.imageUrl}
                      alt="Image"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {palette.colorCount} couleurs
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(palette.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {palette.colors.slice(0, 5).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    {palette.colors.length > 5 && (
                      <div className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs">
                        +{palette.colors.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
