// Cat Sprite Tester - for testing and previewing cat sprites

import type { CatType } from '../entities/Cat';
import { sittingCatFullSprite } from './sprites/SittingCatFullSprite';

// Color indices for sprite matrices
// 0 = transparent
// 1 = outline (dark)
// 2 = dark shade
// 3 = mid tone
// 4 = light tone
// 5 = highlight
// 6 = pink (ears/nose)
// 7 = eye dark
// 8 = eye highlight

type SpriteType = 'sitting' | 'sitting2' | 'standing' | 'lying' | 'sittingFull';

export class CatTester {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentType: CatType = 'ORANGE_TABBY';
  private currentSprite: SpriteType = 'sitting';
  private scale: number = 4;
  private flipped: boolean = false;

  // Sitting cat sprite - 19 wide x 21 tall
  private sittingSprite: number[][] = [
    [0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,1,6,2,1,0,0,0,0,0,1,2,6,1,0,0,0],
    [0,0,0,1,2,2,1,1,1,1,1,1,1,2,2,1,0,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1],
    [1,2,3,4,7,7,4,4,4,4,4,4,4,7,7,4,3,2,1],
    [1,2,3,4,7,8,4,4,4,4,4,4,4,8,7,4,3,2,1],
    [1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1],
    [1,2,3,4,4,4,4,4,1,1,1,4,4,4,4,4,3,2,1],
    [1,2,3,4,4,4,4,4,4,6,4,4,4,4,4,4,3,2,1],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0],
    [0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0],
    [1,2,2,3,3,2,3,2,3,2,3,2,3,2,3,3,2,2,1],
    [1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1],
    [1,2,2,3,3,2,3,2,3,2,3,2,3,2,3,3,2,2,1],
    [1,2,3,4,4,4,1,1,1,1,1,1,1,4,4,4,3,2,1],
    [0,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  // Standing cat sprite - 24 wide x 19 tall
  private standingSprite: number[][] = [
    [0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,6,2,1,0,0,0,0,0,1,2,6,1,0,0,0,0,0,0,0,0],
    [0,0,0,1,2,2,1,1,1,1,1,1,1,2,2,1,0,0,0,0,0,0,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0,0,0,0,0,0],
    [1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0,0,0,0,0],
    [1,2,3,4,7,7,4,4,4,4,4,4,4,7,7,4,3,2,1,0,0,0,0,0],
    [1,2,3,4,7,8,4,4,4,4,4,4,4,8,7,4,3,2,1,0,0,0,0,0],
    [1,2,3,4,4,4,4,4,1,1,1,4,4,4,4,4,3,2,1,1,1,0,0,0],
    [1,2,3,4,4,4,4,4,4,6,4,4,4,4,4,4,3,2,2,3,2,1,0,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,1,3,2,1,0],
    [0,1,2,2,3,2,3,2,3,2,3,2,3,2,3,2,2,1,0,0,1,3,1,0],
    [0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0,1,1,0],
    [0,1,2,2,3,2,3,2,3,2,3,2,3,2,3,2,2,1,0,0,0,0,0,0],
    [0,1,2,1,1,2,2,1,1,1,1,1,2,2,1,1,2,1,0,0,0,0,0,0],
    [0,0,1,4,4,1,1,4,4,0,4,4,1,1,4,4,1,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  // Sitting cat sprite v2 (from public/cat-sitting.png) - 18 wide x 17 tall
  private sittingSprite2: number[][] = [
    //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7
    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0], // 0 - ear tips
    [0,0,0,1,3,2,1,0,0,0,0,1,2,3,1,0,0,0], // 1 - ears outer
    [0,0,0,1,6,3,1,1,1,1,1,1,3,6,1,0,0,0], // 2 - ears pink inner
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,0,0], // 3 - top of head
    [0,0,1,3,4,4,4,4,4,4,4,4,4,4,3,1,0,0], // 4 - forehead
    [0,0,1,3,7,7,4,4,4,4,4,4,7,7,3,1,0,0], // 5 - eyes
    [0,0,1,3,7,8,4,4,4,4,4,4,8,7,3,1,0,0], // 6 - eyes highlight
    [0,0,1,3,4,4,4,4,4,4,4,4,4,4,3,1,0,0], // 7 - cheeks
    [0,0,1,3,4,4,4,1,6,6,1,4,4,4,3,1,0,0], // 8 - nose/mouth
    [0,0,1,2,3,4,4,4,4,4,4,4,4,3,2,1,0,0], // 9 - chin
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,1,0], // 10 - neck
    [0,1,2,3,3,2,3,2,3,2,3,2,3,3,2,1,3,1], // 11 - body stripes + tail
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,2,1,3,1], // 12 - body + tail
    [0,1,2,3,3,2,3,2,3,2,3,2,3,3,2,1,1,0], // 13 - body stripes
    [0,1,2,4,4,1,1,1,1,1,1,1,4,4,2,1,0,0], // 14 - paws
    [0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0], // 15 - paw bottom
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 16 - empty
  ];

  // Lying down cat sprite - 24 wide x 14 tall
  private lyingSprite: number[][] = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,2,1,1,1,1,2,6,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,2,1],
    [0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,4,4,4,4,4,4,3,2,1],
    [0,0,0,0,0,0,0,0,0,0,1,2,3,4,7,7,4,4,7,7,4,3,2,1],
    [1,1,1,0,0,0,0,0,0,0,1,2,3,4,7,8,4,4,8,7,4,3,2,1],
    [1,3,2,1,1,1,1,1,1,1,2,3,4,4,4,1,1,1,4,4,4,3,2,1],
    [0,1,3,2,2,2,2,2,2,2,3,3,4,4,4,4,6,4,4,4,4,3,2,1],
    [0,0,1,2,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,0,1,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,1,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,0,1,2,4,4,4,1,1,1,1,1,1,1,1,1,1,4,4,4,4,2,1,0],
    [0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2d context for cat tester');
    }
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  setType(type: CatType): void {
    this.currentType = type;
  }

  setSprite(sprite: SpriteType): void {
    this.currentSprite = sprite;
  }

  setScale(scale: number): void {
    this.scale = Math.max(1, Math.min(8, scale));
  }

  toggleFlip(): void {
    this.flipped = !this.flipped;
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

  getSprite(): number[][] {
    switch (this.currentSprite) {
      case 'sitting2':
        return this.sittingSprite2;
      case 'standing':
        return this.standingSprite;
      case 'lying':
        return this.lyingSprite;
      case 'sittingFull':
        return sittingCatFullSprite;
      default:
        return this.sittingSprite;
    }
  }

  getSpriteInfo(): { name: string; width: number; height: number } {
    const sprite = this.getSprite();
    const width = sprite[0].length;
    const height = sprite.length;

    const names: Record<SpriteType, string> = {
      sitting: 'sittingSprite',
      sitting2: 'sittingSprite2',
      standing: 'standingSprite',
      lying: 'lyingSprite',
      sittingFull: 'sittingCatFullSprite (123x124)',
    };

    return {
      name: names[this.currentSprite],
      width,
      height,
    };
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(): void {
    this.clear();

    const sprite = this.getSprite();
    const colors = this.getColorPalette();
    const spriteHeight = sprite.length;
    const spriteWidth = sprite[0].length;
    const ps = this.scale; // pixel size

    // Calculate centered position
    const totalWidth = spriteWidth * ps;
    const totalHeight = spriteHeight * ps;
    const offsetX = Math.floor((this.canvas.width - totalWidth) / 2);
    const offsetY = Math.floor((this.canvas.height - totalHeight) / 2);

    this.ctx.save();

    if (this.flipped) {
      this.ctx.translate(this.canvas.width, 0);
      this.ctx.scale(-1, 1);
    }

    for (let y = 0; y < spriteHeight; y++) {
      for (let x = 0; x < spriteWidth; x++) {
        const colorIndex = sprite[y][x];
        if (colorIndex === 0) continue; // transparent

        this.ctx.fillStyle = colors[colorIndex];
        this.ctx.fillRect(
          offsetX + x * ps,
          offsetY + y * ps,
          ps,
          ps
        );
      }
    }

    this.ctx.restore();
  }

  // Method to render a custom sprite matrix (for testing new sprites)
  renderCustomSprite(sprite: number[][]): void {
    this.clear();

    const colors = this.getColorPalette();
    const spriteHeight = sprite.length;
    const spriteWidth = sprite[0]?.length || 0;
    const ps = this.scale;

    const totalWidth = spriteWidth * ps;
    const totalHeight = spriteHeight * ps;
    const offsetX = Math.floor((this.canvas.width - totalWidth) / 2);
    const offsetY = Math.floor((this.canvas.height - totalHeight) / 2);

    this.ctx.save();

    if (this.flipped) {
      this.ctx.translate(this.canvas.width, 0);
      this.ctx.scale(-1, 1);
    }

    for (let y = 0; y < spriteHeight; y++) {
      for (let x = 0; x < spriteWidth; x++) {
        const colorIndex = sprite[y]?.[x] || 0;
        if (colorIndex === 0) continue;

        this.ctx.fillStyle = colors[colorIndex] || '#ff00ff'; // magenta for invalid
        this.ctx.fillRect(
          offsetX + x * ps,
          offsetY + y * ps,
          ps,
          ps
        );
      }
    }

    this.ctx.restore();
  }
}
