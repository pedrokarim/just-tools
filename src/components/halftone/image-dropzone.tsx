"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useHalftoneStore } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * L'état d'arrivée de l'atelier : la scène attend une image et dit comment la
 * lui donner. Fichier et adresse web tiennent sur le même écran, sans onglets.
 */
export function ImageDropzone() {
  const { setSourceImage } = useHalftoneStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const urlFieldId = useId();
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error(
          "Ce fichier n'est pas une image. Choisis un PNG, un JPG, un GIF ou un WebP."
        );
        return;
      }

      try {
        // Créer une URL pour l'image
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
          setSourceImage(img);
          URL.revokeObjectURL(url);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          toast.error("Impossible de lire cette image. Essaie un autre fichier.");
        };

        img.src = url;
      } catch {
        toast.error("Impossible de lire cette image. Essaie un autre fichier.");
      }
    },
    [setSourceImage]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    // Passer au-dessus d'un enfant n'est pas quitter la zone.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleUrlLoad = useCallback(async () => {
    if (!imageUrl.trim()) {
      toast.error("Colle d'abord l'adresse d'une image.");
      return;
    }

    // Validation basique de l'URL
    try {
      new URL(imageUrl.trim());
    } catch {
      toast.error(
        "Adresse incomplète. Écris-la en entier, par exemple https://exemple.com/image.jpg."
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
        setIsLoadingUrl(false);
      };

      img.onerror = () => {
        toast.error(
          "Impossible de charger cette image. Vérifie que l'adresse pointe vers une image publique de moins de 10 Mo."
        );
        setIsLoadingUrl(false);
      };

      img.src = proxyUrl;
    } catch {
      toast.error(
        "Impossible de charger cette image. Vérifie l'adresse et réessaie."
      );
      setIsLoadingUrl(false);
    }
  }, [imageUrl, setSourceImage]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "rounded-field m-3 flex min-w-0 flex-1 flex-col items-center justify-center gap-5 border border-dashed p-5 text-center sm:p-8",
        isDragOver ? "border-primary bg-primary-soft" : "border-border-strong"
      )}
    >
      <ImagePlus size={28} className="text-fg-subtle" aria-hidden="true" />

      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-fg text-base font-semibold tracking-tight">
          Dépose une image ici
        </p>
        <p className="text-fg-muted text-sm leading-relaxed">
          PNG, JPG, GIF ou WebP. Ton fichier reste dans ton navigateur&nbsp;:
          rien n&apos;est envoyé.
        </p>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
      <Button onClick={() => fileInput.current?.click()}>
        <Upload aria-hidden="true" />
        Choisir une image
      </Button>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleUrlLoad();
        }}
        className="border-border flex w-full max-w-md min-w-0 flex-col gap-1.5 border-t pt-5 text-left"
      >
        <Label htmlFor={urlFieldId}>Ou charge-la depuis une adresse web</Label>
        <div className="flex min-w-0 gap-2">
          <Input
            id={urlFieldId}
            type="url"
            placeholder="https://exemple.com/image.jpg"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={!imageUrl.trim() || isLoadingUrl}
          >
            {isLoadingUrl && (
              <Loader2 className="asc-animate-spin" aria-hidden="true" />
            )}
            {isLoadingUrl ? "Chargement…" : "Charger"}
          </Button>
        </div>
        <p className="text-fg-muted text-xs leading-snug">
          Image publique de moins de 10&nbsp;Mo. Elle passe par notre serveur le
          temps de la récupérer.
        </p>
      </form>
    </div>
  );
}
