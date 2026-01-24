// Sprite Gallery - renders all cat sprites for preview in dev tools

import type { CatType } from '../entities/Cat';
import { standingCatSprite } from './sprites/StandingCatSprite';
import { lyingCatSprite } from './sprites/LyingCatSprite';
import { sittingTailCatSprite } from './sprites/SittingTailCatSprite';
import { sittingFrontCatSprite } from './sprites/SittingFrontCatSprite';

type SpriteKey = 'sittingFront' | 'sittingTail' | 'standing' | 'lying';

interface SpriteConfig {
  sprite: number[][];
  canvasId: string;
}

export class SpriteGallery {
  private canvases: Map<SpriteKey, HTMLCanvasElement> = new Map();
  private contexts: Map<SpriteKey, CanvasRenderingContext2D> = new Map();
  private currentType: CatType = 'ORANGE_TABBY';
  private scale: number = 1;

  private sprites: Record<SpriteKey, SpriteConfig> = {
    sittingFront: { sprite: sittingFrontCatSprite, canvasId: 'gallery-sitting-front' },
    sittingTail: { sprite: sittingTailCatSprite, canvasId: 'gallery-sitting-tail' },
    standing: { sprite: standingCatSprite, canvasId: 'gallery-standing' },
    lying: { sprite: lyingCatSprite, canvasId: 'gallery-lying' },
  };

  constructor() {
    this.initCanvases();
  }

  private initCanvases(): void {
    for (const [key, config] of Object.entries(this.sprites)) {
      const canvas = document.getElementById(config.canvasId) as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          this.canvases.set(key as SpriteKey, canvas);
          this.contexts.set(key as SpriteKey, ctx);
        }
      }
    }
  }

  setType(type: CatType): void {
    this.currentType = type;
  }

  setScale(scale: number): void {
    this.scale = Math.max(1, Math.min(4, scale));
  }

  getColorPalette(): string[] {
    if (this.currentType === 'WHITE_LONGHAIR') {
      return [
        'transparent',  // 0
        '#5c5c5c',      // 1 - outline (dark gray)
        '#8a8a8a',      // 2 - dark shade
        '#b8b8b8',      // 3 - mid tone
        '#e0e0e0',      // 4 - light tone
        '#ffffff',      // 5 - highlight
        '#e8b8b8',      // 6 - pink (ears/nose)
        '#3a3a3a',      // 7 - eye dark
        '#f0f0f0',      // 8 - eye highlight
      ];
    } else {
      // Orange tabby
      return [
        'transparent',  // 0
        '#442211',      // 1 - outline (dark brown)
        '#774422',      // 2 - dark shade
        '#aa6633',      // 3 - mid tone
        '#cc8844',      // 4 - light tone
        '#eebb88',      // 5 - highlight/cream
        '#ddaa99',      // 6 - pink (ears/nose)
        '#332211',      // 7 - eye dark
        '#ccbb99',      // 8 - eye highlight
      ];
    }
  }

  renderAll(): void {
    for (const [key, config] of Object.entries(this.sprites)) {
      this.renderSprite(key as SpriteKey, config.sprite);
    }
  }

  private renderSprite(key: SpriteKey, sprite: number[][]): void {
    const canvas = this.canvases.get(key);
    const ctx = this.contexts.get(key);
    if (!canvas || !ctx) return;

    const colors = this.getColorPalette();
    const spriteHeight = sprite.length;
    const spriteWidth = sprite[0]?.length || 0;

    // Calculate pixel size to fit in canvas with scale
    const maxDim = Math.max(spriteWidth, spriteHeight);
    const baseSize = Math.min(canvas.width, canvas.height) / maxDim;
    const ps = baseSize * this.scale;

    // Resize canvas to fit scaled sprite
    const newWidth = Math.ceil(spriteWidth * ps);
    const newHeight = Math.ceil(spriteHeight * ps);
    canvas.width = Math.max(200, newWidth);
    canvas.height = Math.max(200, newHeight);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    // Calculate centered position
    const totalWidth = spriteWidth * ps;
    const totalHeight = spriteHeight * ps;
    const offsetX = Math.floor((canvas.width - totalWidth) / 2);
    const offsetY = Math.floor((canvas.height - totalHeight) / 2);

    // Render sprite
    for (let y = 0; y < spriteHeight; y++) {
      for (let x = 0; x < spriteWidth; x++) {
        const colorIndex = sprite[y]?.[x] || 0;
        if (colorIndex === 0) continue; // transparent

        ctx.fillStyle = colors[colorIndex] || '#ff00ff'; // magenta for invalid
        ctx.fillRect(
          Math.floor(offsetX + x * ps),
          Math.floor(offsetY + y * ps),
          Math.ceil(ps),
          Math.ceil(ps)
        );
      }
    }
  }
}
