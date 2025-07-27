import { HalftoneSettings } from "./halftone-store";
import { HalftoneEngine } from "./halftone-engine";

export interface ExportOptions {
  format: "png" | "jpg" | "svg";
  resolution: 1 | 2 | 3;
  transparent: boolean;
  quality?: number; // Pour JPG
}

export class HalftoneExporter {
  // Exporter en PNG
  static async exportPNG(
    canvas: HTMLCanvasElement,
    options: ExportOptions
  ): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/png");
    });
  }

  // Exporter en JPG
  static async exportJPG(
    canvas: HTMLCanvasElement,
    options: ExportOptions
  ): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
        },
        "image/jpeg",
        options.quality || 0.9
      );
    });
  }

  // Exporter en SVG (approximation vectorielle)
  static async exportSVG(
    image: HTMLImageElement | ImageBitmap,
    settings: HalftoneSettings,
    options: ExportOptions
  ): Promise<Blob> {
    // Créer un canvas temporaire pour obtenir les données
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;

    // Calculer la taille finale
    const { width, height } = this.calculateExportSize(
      image,
      options.resolution
    );
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Rendre l'halftone
    await HalftoneEngine.renderHalftone(image, settings, tempCanvas);

    // Générer le SVG
    const svgContent = this.generateSVG(tempCanvas, settings, options);

    // Créer le blob
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    return blob;
  }

  // Calculer la taille d'export
  private static calculateExportSize(
    image: HTMLImageElement | ImageBitmap,
    resolution: number
  ): { width: number; height: number } {
    return {
      width: image.width * resolution,
      height: image.height * resolution,
    };
  }

  // Générer le contenu SVG
  private static generateSVG(
    canvas: HTMLCanvasElement,
    settings: HalftoneSettings,
    options: ExportOptions
  ): string {
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { width, height } = canvas;

    // Créer le SVG
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;

    // Ajouter le fond si nécessaire
    if (settings.gradient?.enabled && !options.transparent) {
      svg += this.generateGradientSVG(settings.gradient, width, height);
    }

    // Ajouter les formes (approximation)
    svg += this.generateShapesSVG(imageData, settings, width, height);

    svg += "</svg>";
    return svg;
  }

  // Générer le gradient SVG
  private static generateGradientSVG(
    gradient: {
      type: "linear" | "radial";
      stops: { offset: number; color: string }[];
    },
    width: number,
    height: number
  ): string {
    let defs = "<defs>\n";

    if (gradient.type === "linear") {
      defs += `<linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">\n`;
    } else {
      defs += `<radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">\n`;
    }

    gradient.stops.forEach((stop) => {
      defs += `  <stop offset="${stop.offset * 100}%" stop-color="${
        stop.color
      }" />\n`;
    });

    defs +=
      gradient.type === "linear"
        ? "</linearGradient>\n"
        : "</radialGradient>\n";
    defs += "</defs>\n";

    return (
      defs + `<rect width="100%" height="100%" fill="url(#bg-gradient)" />\n`
    );
  }

  // Générer les formes SVG (approximation)
  private static generateShapesSVG(
    imageData: ImageData,
    settings: HalftoneSettings,
    width: number,
    height: number
  ): string {
    let shapes = "";
    const data = imageData.data;
    const spacing = 1000 / settings.frequency;

    // Parcourir l'image par blocs pour créer les formes
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        const index = (Math.floor(y) * width + Math.floor(x)) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3] / 255;

        if (a > 0.1) {
          // Seuil de transparence
          const color = `rgb(${r}, ${g}, ${b})`;
          const size = Math.max(1, spacing * 0.8);

          shapes += this.generateShapeSVG(x, y, size, settings.shape, color, a);
        }
      }
    }

    return shapes;
  }

  // Générer une forme SVG
  private static generateShapeSVG(
    x: number,
    y: number,
    size: number,
    shape: string,
    color: string,
    opacity: number
  ): string {
    const fill = `fill="${color}" opacity="${opacity}"`;

    switch (shape) {
      case "circle":
        return `<circle cx="${x}" cy="${y}" r="${size / 2}" ${fill} />\n`;

      case "square":
        return `<rect x="${x - size / 2}" y="${
          y - size / 2
        }" width="${size}" height="${size}" ${fill} />\n`;

      case "diamond":
        const points = [
          `${x},${y - size / 2}`,
          `${x + size / 2},${y}`,
          `${x},${y + size / 2}`,
          `${x - size / 2},${y}`,
        ].join(" ");
        return `<polygon points="${points}" ${fill} />\n`;

      case "hexagon":
        return this.generateHexagonSVG(x, y, size / 2, fill);

      case "line":
        return `<line x1="${x - size / 2}" y1="${y}" x2="${
          x + size / 2
        }" y2="${y}" stroke="${color}" stroke-width="2" opacity="${opacity}" />\n`;

      default:
        return `<circle cx="${x}" cy="${y}" r="${size / 2}" ${fill} />\n`;
    }
  }

  // Générer un hexagone SVG
  private static generateHexagonSVG(
    x: number,
    y: number,
    radius: number,
    fill: string
  ): string {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      points.push(`${px},${py}`);
    }
    return `<polygon points="${points.join(" ")}" ${fill} />\n`;
  }

  // Fonction principale d'export
  static async export(
    image: HTMLImageElement | ImageBitmap,
    settings: HalftoneSettings,
    options: ExportOptions
  ): Promise<Blob> {
    // Créer un canvas temporaire
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Calculer la taille d'export
    const { width, height } = this.calculateExportSize(
      image,
      options.resolution
    );
    canvas.width = width;
    canvas.height = height;

    // Appliquer le fond si nécessaire
    if (!options.transparent && settings.gradient?.enabled) {
      this.applyGradientToCanvas(ctx, settings.gradient, width, height);
    }

    // Rendre l'halftone
    await HalftoneEngine.renderHalftone(image, settings, canvas);

    // Exporter selon le format
    switch (options.format) {
      case "png":
        return this.exportPNG(canvas, options);
      case "jpg":
        return this.exportJPG(canvas, options);
      case "svg":
        return this.exportSVG(image, settings, options);
      default:
        throw new Error(`Format non supporté: ${options.format}`);
    }
  }

  // Appliquer un gradient au canvas
  private static applyGradientToCanvas(
    ctx: CanvasRenderingContext2D,
    gradient: {
      type: "linear" | "radial";
      stops: { offset: number; color: string }[];
    },
    width: number,
    height: number
  ): void {
    let grad: CanvasGradient;

    if (gradient.type === "linear") {
      grad = ctx.createLinearGradient(0, 0, width, height);
    } else {
      grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
    }

    gradient.stops.forEach((stop) => {
      grad.addColorStop(stop.offset, stop.color);
    });

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Télécharger le fichier
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
