import { HalftoneSettings, Shape, Mapping } from "./halftone-store";

export class HalftoneEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pathCache: Map<string, Path2D> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  // Fonction principale de rendu
  async renderHalftone(
    image: HTMLImageElement | ImageBitmap,
    settings: HalftoneSettings,
    outputCanvas: HTMLCanvasElement
  ): Promise<void> {
    const outputCtx = outputCanvas.getContext("2d")!;

    // Calculer la taille de sortie
    const { width, height } = this.calculateOutputSize(image, outputCanvas);
    outputCanvas.width = width;
    outputCanvas.height = height;

    // Effacer le canvas
    outputCtx.clearRect(0, 0, width, height);

    // 1. D'abord, dessiner l'image originale
    outputCtx.drawImage(image, 0, 0, width, height);

    // 2. Appliquer le fond si nécessaire (en overlay)
    if (settings.gradient?.enabled) {
      this.applyGradient(outputCtx, settings.gradient, width, height);
    }

    // 3. Calculer la grille halftone pour l'effet
    const grid = this.calculateGrid(width, height, settings);

    // 4. Rendre l'effet de trame par-dessus l'image
    for (const point of grid) {
      await this.renderHalftoneEffect(outputCtx, image, point, settings);
    }
  }

  // Calculer la taille de sortie
  private calculateOutputSize(
    image: HTMLImageElement | ImageBitmap,
    outputCanvas: HTMLCanvasElement
  ): { width: number; height: number } {
    const maxSize = 1280; // Limite pour la prévisualisation
    const aspectRatio = image.width / image.height;

    let width, height;
    if (aspectRatio > 1) {
      width = Math.min(image.width, maxSize);
      height = width / aspectRatio;
    } else {
      height = Math.min(image.height, maxSize);
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  // Calculer la grille halftone
  private calculateGrid(
    width: number,
    height: number,
    settings: HalftoneSettings
  ): Array<{ x: number; y: number; size: number; angle: number }> {
    const points: Array<{ x: number; y: number; size: number; angle: number }> =
      [];
    const spacing = 1000 / settings.frequency; // Espacement en pixels

    // Appliquer la rotation
    const angleRad = (settings.angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Générer la grille
    for (let y = -spacing; y < height + spacing; y += spacing) {
      for (let x = -spacing; x < width + spacing; x += spacing) {
        // Appliquer la rotation
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;

        // Appliquer le jitter si activé
        let jitterX = 0,
          jitterY = 0;
        if (settings.jitter > 0) {
          const random = this.seededRandom(settings.seed + x + y * 1000);
          jitterX = (random - 0.5) * spacing * settings.jitter;
          jitterY =
            (this.seededRandom(settings.seed + x + y * 1000 + 1) - 0.5) *
            spacing *
            settings.jitter;
        }

        points.push({
          x: rotatedX + jitterX,
          y: rotatedY + jitterY,
          size: 0, // Sera calculé lors du rendu
          angle: settings.angle,
        });
      }
    }

    return points;
  }

  // Rendre un point de la grille
  private async renderPoint(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement | ImageBitmap,
    point: { x: number; y: number; size: number; angle: number },
    settings: HalftoneSettings
  ): Promise<void> {
    // Obtenir la couleur du pixel source
    const color = this.getPixelColor(image, point.x, point.y);
    const brightness = this.getBrightness(color);

    // Appliquer le mapping
    const mappedValue = this.applyMapping(brightness, settings);

    // Calculer la taille du point
    const size = this.mapValueToSize(mappedValue, settings);
    if (size <= 0) return;

    // Obtenir la couleur finale
    const finalColor = this.getFinalColor(color, settings);

    // Sauvegarder le contexte
    ctx.save();

    // Appliquer les transformations
    ctx.globalAlpha = settings.opacity;
    ctx.globalCompositeOperation =
      settings.blendMode as GlobalCompositeOperation;

    // Dessiner la forme
    this.drawShape(ctx, point.x, point.y, size, settings.shape, finalColor);

    // Restaurer le contexte
    ctx.restore();
  }

  // Rendre un effet de trame qui se superpose à l'image
  private async renderHalftoneEffect(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement | ImageBitmap,
    point: { x: number; y: number; size: number; angle: number },
    settings: HalftoneSettings
  ): Promise<void> {
    // Obtenir la couleur du pixel source
    const color = this.getPixelColor(image, point.x, point.y);
    const brightness = this.getBrightness(color);

    // Appliquer le mapping
    const mappedValue = this.applyMapping(brightness, settings);

    // Calculer la taille du point d'effet
    const size = this.mapValueToSize(mappedValue, settings);
    if (size <= 0) return;

    // Obtenir la couleur de l'effet
    const effectColor = this.getEffectColor(color, settings);

    // Sauvegarder le contexte
    ctx.save();

    // Appliquer les transformations pour l'effet
    ctx.globalAlpha = settings.opacity; // Effet plus visible
    ctx.globalCompositeOperation = "multiply"; // Mode de fusion pour l'effet

    // Dessiner l'effet de trame
    this.drawHalftoneEffect(
      ctx,
      point.x,
      point.y,
      size,
      settings.shape,
      effectColor
    );

    // Restaurer le contexte
    ctx.restore();
  }

  // Obtenir la couleur d'un pixel
  private getPixelColor(
    image: HTMLImageElement | ImageBitmap,
    x: number,
    y: number
  ): { r: number; g: number; b: number; a: number } {
    // Créer un canvas temporaire pour lire les pixels
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;

    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    tempCtx.drawImage(image, 0, 0);

    const imageData = tempCtx.getImageData(
      Math.max(0, Math.min(x, image.width - 1)),
      Math.max(0, Math.min(y, image.height - 1)),
      1,
      1
    );

    return {
      r: imageData.data[0],
      g: imageData.data[1],
      b: imageData.data[2],
      a: imageData.data[3] / 255,
    };
  }

  // Calculer la luminosité
  private getBrightness(color: {
    r: number;
    g: number;
    b: number;
    a: number;
  }): number {
    return (color.r * 0.299 + color.g * 0.587 + color.b * 0.114) / 255;
  }

  // Appliquer le mapping
  private applyMapping(value: number, settings: HalftoneSettings): number {
    switch (settings.mapping) {
      case "linear":
        return value;
      case "gamma":
        return Math.pow(value, settings.gamma);
      case "logarithmic":
        return Math.log(1 + value * 9) / Math.log(10);
      case "exponential":
        return Math.pow(value, 2);
      default:
        return value;
    }
  }

  // Mapper la valeur à la taille
  private mapValueToSize(value: number, settings: HalftoneSettings): number {
    const range = settings.sizeMax - settings.sizeMin;
    return settings.sizeMin + value * range;
  }

  // Obtenir la couleur finale
  private getFinalColor(
    sourceColor: { r: number; g: number; b: number; a: number },
    settings: HalftoneSettings
  ): string {
    switch (settings.modeCouleur) {
      case "monochrome":
        return settings.couleurs[0];
      case "channels":
        return `rgb(${sourceColor.r}, ${sourceColor.g}, ${sourceColor.b})`;
      case "palette":
        const brightness = this.getBrightness(sourceColor);
        const index = Math.floor(brightness * (settings.couleurs.length - 1));
        return settings.couleurs[Math.min(index, settings.couleurs.length - 1)];
      default:
        return settings.couleurs[0];
    }
  }

  // Obtenir la couleur de l'effet de trame
  private getEffectColor(
    sourceColor: { r: number; g: number; b: number; a: number },
    settings: HalftoneSettings
  ): string {
    // Pour l'effet de trame, on utilise généralement une couleur contrastée
    switch (settings.modeCouleur) {
      case "monochrome":
        return settings.couleurs[0];
      case "channels":
        // Inverser les couleurs pour créer un effet de trame
        return `rgb(${255 - sourceColor.r}, ${255 - sourceColor.g}, ${
          255 - sourceColor.b
        })`;
      case "palette":
        const brightness = this.getBrightness(sourceColor);
        const index = Math.floor(
          (1 - brightness) * (settings.couleurs.length - 1)
        );
        return settings.couleurs[Math.min(index, settings.couleurs.length - 1)];
      default:
        return settings.couleurs[0];
    }
  }

  // Dessiner une forme
  private drawShape(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    shape: Shape,
    color: string
  ): void {
    ctx.fillStyle = color;

    switch (shape) {
      case "circle":
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "square":
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        break;

      case "diamond":
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y);
        ctx.lineTo(x, y + size / 2);
        ctx.lineTo(x - size / 2, y);
        ctx.closePath();
        ctx.fill();
        break;

      case "hexagon":
        this.drawHexagon(ctx, x, y, size / 2);
        break;

      case "line":
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.PI / 180) * 45); // 45 degrés
        ctx.fillRect(-size / 2, -1, size, 2);
        ctx.restore();
        break;

      case "custom-svg":
        // Pour l'instant, utiliser un cercle
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  // Dessiner un effet de trame
  private drawHalftoneEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    shape: Shape,
    color: string
  ): void {
    ctx.fillStyle = color;

    switch (shape) {
      case "circle":
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "square":
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        break;

      case "diamond":
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y);
        ctx.lineTo(x, y + size / 2);
        ctx.lineTo(x - size / 2, y);
        ctx.closePath();
        ctx.fill();
        break;

      case "hexagon":
        this.drawHexagon(ctx, x, y, size / 2);
        break;

      case "line":
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.PI / 180) * 45); // 45 degrés
        ctx.fillRect(-size / 2, -1, size, 2);
        ctx.restore();
        break;

      case "custom-svg":
        // Pour l'instant, utiliser un cercle
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  // Dessiner un hexagone
  private drawHexagon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ): void {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  // Appliquer un gradient
  private applyGradient(
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

  // Générateur de nombres aléatoires avec seed
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // API publique pour le rendu
  static async renderHalftone(
    image: HTMLImageElement | ImageBitmap,
    settings: HalftoneSettings,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    const engine = new HalftoneEngine(canvas);
    await engine.renderHalftone(image, settings, canvas);
  }
}
