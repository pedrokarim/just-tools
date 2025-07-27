"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useHalftoneStore } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Image as ImageIcon,
  FileImage,
  Link,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function ImageDropzone() {
  const { setSourceImage } = useHalftoneStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }

      try {
        // Créer une URL pour l'image
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
          setSourceImage(img);
          URL.revokeObjectURL(url);
          toast.success("Image chargée avec succès");
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          toast.error("Erreur lors du chargement de l'image");
        };

        img.src = url;
      } catch (error) {
        toast.error("Erreur lors du chargement de l'image");
      }
    },
    [setSourceImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleUrlLoad = useCallback(async () => {
    if (!imageUrl.trim()) {
      toast.error("Veuillez entrer une URL d'image");
      return;
    }

    // Validation basique de l'URL
    try {
      new URL(imageUrl.trim());
    } catch {
      toast.error(
        "URL invalide. Veuillez entrer une URL complète (ex: https://exemple.com/image.jpg)"
      );
      return;
    }

    setIsLoadingUrl(true);
    try {
      // Utiliser notre API proxy pour éviter les problèmes CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(
        imageUrl.trim()
      )}`;

      const img = new Image();

      img.onload = () => {
        setSourceImage(img);
        toast.success("Image chargée depuis l'URL");
        setIsLoadingUrl(false);
      };

      img.onerror = () => {
        toast.error(
          "Impossible de charger l'image. Vérifiez que :\n" +
            "• L'URL est correcte et pointe vers une image\n" +
            "• Le domaine est autorisé (Unsplash, Picsum, etc.)\n" +
            "• L'image est accessible publiquement"
        );
        setIsLoadingUrl(false);
      };

      img.src = proxyUrl;
    } catch (error) {
      toast.error("Erreur lors du chargement de l'image");
      setIsLoadingUrl(false);
    }
  }, [imageUrl, setSourceImage]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Onglets */}
          <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "file"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Fichier</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "url"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Link className="h-4 w-4" />
                <span>URL</span>
              </div>
            </button>
          </div>

          {/* Contenu des onglets */}
          {activeTab === "file" ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <ImageIcon className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-500" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Glissez-déposez votre image
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    ou cliquez pour sélectionner un fichier
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 dark:text-slate-500">
                  <FileImage className="h-4 w-4" />
                  <span>PNG, JPG, GIF, WebP</span>
                </div>

                <div className="pt-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button asChild className="w-full">
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Sélectionner une image
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="url"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-500" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Charger depuis une URL
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Entrez l'URL d'une image en ligne
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://exemple.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleUrlLoad();
                      }
                    }}
                  />
                </div>

                <Button
                  onClick={handleUrlLoad}
                  disabled={!imageUrl.trim() || isLoadingUrl}
                  className="w-full"
                >
                  {isLoadingUrl ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2" />
                      Charger l'image
                    </>
                  )}
                </Button>

                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  <p>Assurez-vous que l'URL pointe vers une image valide</p>
                  <p className="mt-1">
                    Supporte les formats : PNG, JPG, GIF, WebP
                  </p>
                  <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                    <p className="font-medium mb-1">
                      Exemples d'URLs valides :
                    </p>
                    <ul className="space-y-1 text-left">
                      <li>• https://picsum.photos/800/600</li>
                      <li>• https://via.placeholder.com/800x600</li>
                      <li>• https://source.unsplash.com/800x600</li>
                      <li>• https://img.ascencia.re/votre-image.jpg</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
