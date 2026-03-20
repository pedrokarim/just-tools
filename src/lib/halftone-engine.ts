import { HalftoneSettings, HalftoneLayer, Shape } from "./halftone-store";

export class HalftoneEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  // Calculer la taille de sortie
  calculateOutputSize(
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

  // Rendre uniquement les points halftone (sans l'image de base) sur un canvas transparent
  async renderHalftoneLayerOnly(
    image: HTMLImageElement | ImageBitmap,
    settings: HalftoneSettings,
    outputCanvas: HTMLCanvasElement
  ): Promise<void> {
    const outputCtx = outputCanvas.getContext("2d")!;
    outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Appliquer le fond gradient si nécessaire
    if (settings.gradient?.enabled) {
      this.applyGradient(
        outputCtx,
        settings.gradient,
        outputCanvas.width,
        outputCanvas.height
      );
    }

    // Calculer la grille halftone
    const grid = this.calculateGrid(
      outputCanvas.width,
      outputCanvas.height,
      settings
    );

    // Rendre chaque point
    for (const point of grid) {
      await this.renderHalftoneEffect(outputCtx, image, point, settings);
    }
  }

  // Fonction principale de rendu (single layer, backward-compatible)
  async renderHalftone(
    image: HTMLImageElement | ImageBitmap,
    settings: HalftoneSettings,
    outputCanvas: HTMLCanvasElement
  ): Promise<void> {
    const { width, height } = this.calculateOutputSize(image, outputCanvas);
    outputCanvas.width = width;
    outputCanvas.height = height;

    const outputCtx = outputCanvas.getContext("2d")!;
    outputCtx.clearRect(0, 0, width, height);

    // 1. Dessiner l'image originale
    outputCtx.drawImage(image, 0, 0, width, height);

    // 2. Rendre la couche halftone par-dessus
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    await this.renderHalftoneLayerOnly(image, settings, tempCanvas);

    outputCtx.drawImage(tempCanvas, 0, 0);
  }

  // Rendu multi-calques
  static async renderLayers(
    image: HTMLImageElement | ImageBitmap,
    layers: HalftoneLayer[],
    outputCanvas: HTMLCanvasElement
  ): Promise<void> {
    const engine = new HalftoneEngine(outputCanvas);
    const { width, height } = engine.calculateOutputSize(image, outputCanvas);
    outputCanvas.width = width;
    outputCanvas.height = height;

    const outputCtx = outputCanvas.getContext("2d")!;
    outputCtx.clearRect(0, 0, width, height);

    // 1. Dessiner l'image originale comme base
    outputCtx.drawImage(image, 0, 0, width, height);

    // 2. Composer chaque calque visible (du premier au dernier = bas vers haut)
    for (const layer of layers) {
      if (!layer.visible) continue;

      // Canvas temporaire pour ce calque
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;

      await engine.renderHalftoneLayerOnly(image, layer.settings, tempCanvas);

      // Composer sur le canvas de sortie avec opacité et blend mode du calque
      outputCtx.save();
      outputCtx.globalAlpha = layer.opacity;
      outputCtx.globalCompositeOperation = layer.blendMode;
      outputCtx.drawImage(tempCanvas, 0, 0);
      outputCtx.restore();
    }
  }

  // Calculer la taille basée sur la position et la direction
  private calculateSizeFromPosition(
    x: number,
    y: number,
    width: number,
    height: number,
    settings: HalftoneSettings
  ): number {
    const { direction, sizeMin, sizeMax, effectPosition } = settings;

    // Normaliser les coordonnées (0 à 1)
    const normalizedX = x / width;
    const normalizedY = y / height;

    // Position de l'effet (0 à 1)
    const effectX = effectPosition.x / 100;
    const effectY = effectPosition.y / 100;

    let gradientValue = 0;

    switch (direction) {
      case "top":
        // Distance depuis la position de l'effet vers le haut
        const distanceFromTop = effectY - normalizedY;
        gradientValue = Math.max(0, distanceFromTop);
        break;
      case "bottom":
        // Distance depuis la position de l'effet vers le bas
        const distanceFromBottom = normalizedY - effectY;
        gradientValue = Math.max(0, distanceFromBottom);
        break;
      case "left":
        // Distance depuis la position de l'effet vers la gauche
        const distanceFromLeft = effectX - normalizedX;
        gradientValue = Math.max(0, distanceFromLeft);
        break;
      case "right":
        // Distance depuis la position de l'effet vers la droite
        const distanceFromRight = normalizedX - effectX;
        gradientValue = Math.max(0, distanceFromRight);
        break;
      case "center":
        // Distance depuis la position de l'effet
        const distanceFromCenter = Math.sqrt(
          Math.pow(normalizedX - effectX, 2) +
            Math.pow(normalizedY - effectY, 2)
        );
        gradientValue = Math.max(0, 1 - distanceFromCenter);
        break;
      case "radial":
        // Dégradé radial depuis la position de l'effet
        const distanceFromRadial = Math.sqrt(
          Math.pow(normalizedX - effectX, 2) +
            Math.pow(normalizedY - effectY, 2)
        );
        gradientValue = Math.max(0, 1 - distanceFromRadial);
        break;
      default:
        gradientValue = 0.5; // Valeur par défaut
    }

    // Clamper la valeur entre 0 et 1
    gradientValue = Math.max(0, Math.min(1, gradientValue));

    // Appliquer le mapping gamma si nécessaire
    if (settings.mapping === "gamma") {
      gradientValue = Math.pow(gradientValue, settings.gamma);
    }

    // Calculer la taille finale
    const range = sizeMax - sizeMin;
    return sizeMin + gradientValue * range;
  }

  // Obtenir la couleur de l'effet basée sur la position
  private getEffectColorFromPosition(
    x: number,
    y: number,
    width: number,
    height: number,
    settings: HalftoneSettings
  ): string {
    return settings.couleurs[0] || "#000000";
  }

  // Vérifier si un point est dans la forme globale
  private isPointInGlobalShape(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    settings: HalftoneSettings
  ): boolean {
    const { globalShape } = settings;
    const scale = settings.globalShapeScale ?? 1.0;

    // Calculer la distance relative au centre (scale agrandit/réduit la forme)
    const relX = (x - centerX) / ((width / 2) * scale);
    const relY = (y - centerY) / ((height / 2) * scale);
    const distance = Math.sqrt(relX * relX + relY * relY);

    // La direction n'affecte PAS la forme globale (elle affecte la taille des points via calculateSizeFromPosition)
    switch (globalShape) {
      case "circle":
        return distance <= 1;
      case "square":
        return Math.abs(relX) <= 1 && Math.abs(relY) <= 1;
      case "diamond":
        return Math.abs(relX) + Math.abs(relY) <= 1;
      case "hexagon": {
        // Regular hexagon (vertex pointing right)
        const absX = Math.abs(relX);
        const absY = Math.abs(relY);
        return absY <= 0.866 && absX + absY * 0.577 <= 1;
      }
      case "triangle": {
        // Equilateral triangle pointing up: apex at top (relY=-1), base at bottom (relY=1)
        const triNorm = (relY + 1) / 2;
        return triNorm >= 0 && triNorm <= 1 && Math.abs(relX) <= triNorm;
      }
      case "star": {
        // 5-pointed star with proper inner/outer radii
        const starAngle = Math.atan2(relY, relX) + Math.PI / 2;
        const fullSlice = Math.PI / 5;
        const normAngle =
          ((starAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const slicePos = normAngle / fullSlice;
        const fraction = slicePos - Math.floor(slicePos);
        const outerR = 1.0;
        const innerR = 0.382;
        const maxR =
          Math.floor(slicePos) % 2 === 0
            ? outerR + (innerR - outerR) * fraction
            : innerR + (outerR - innerR) * fraction;
        return distance <= maxR;
      }
      case "heart": {
        // Heart shape: (x² + y² - 1)³ - x²y³ ≤ 0
        const hx = relX;
        const hy = -relY;
        const heartEq =
          Math.pow(hx * hx + hy * hy - 1, 3) - hx * hx * hy * hy * hy;
        return heartEq <= 0;
      }
      default:
        return true; // Pour "custom" ou autres formes
    }
  }

  // Calculer la grille halftone
  private calculateGrid(
    width: number,
    height: number,
    settings: HalftoneSettings
  ): Array<{ x: number; y: number; size: number; angle: number }> {
    const points: Array<{
      x: number;
      y: number;
      size: number;
      angle: number;
    }> = [];
    const spacing = 1000 / settings.frequency; // Espacement en pixels

    // Appliquer la rotation
    const angleRad = (settings.angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Centre de la forme = effectPosition (cohérent avec le gradient de taille)
    const centerX = (settings.effectPosition.x / 100) * width;
    const centerY = (settings.effectPosition.y / 100) * height;

    // Générer la grille de base
    for (let y = -spacing; y < height + spacing; y += spacing) {
      for (let x = -spacing; x < width + spacing; x += spacing) {
        // Vérifier si le point est dans la forme globale
        if (
          !this.isPointInGlobalShape(
            x,
            y,
            centerX,
            centerY,
            width,
            height,
            settings
          )
        ) {
          continue;
        }

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

  // Rendre un effet de trame qui se superpose à l'image
  private async renderHalftoneEffect(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement | ImageBitmap,
    point: { x: number; y: number; size: number; angle: number },
    settings: HalftoneSettings
  ): Promise<void> {
    // Calculer la taille basée sur la position et la direction
    const size = this.calculateSizeFromPosition(
      point.x,
      point.y,
      image.width,
      image.height,
      settings
    );
    if (size <= 0) return;

    // Obtenir la couleur de l'effet
    const effectColor = this.getEffectColorFromPosition(
      point.x,
      point.y,
      image.width,
      image.height,
      settings
    );

    // Sauvegarder le contexte
    ctx.save();

    // Appliquer les transformations pour l'effet
    ctx.globalAlpha = settings.opacity;
    ctx.globalCompositeOperation = "multiply";

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

  // API publique pour le rendu single-layer (backward-compatible)
  static async renderHalftone(
    image: HTMLImageElement | ImageBitmap,
    settings: HalftoneSettings,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    const engine = new HalftoneEngine(canvas);
    await engine.renderHalftone(image, settings, canvas);
  }
}
