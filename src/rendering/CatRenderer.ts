// Pixel art cats using sprite matrices

import type { Cat, CatAnimationState, CatType } from '../entities/Cat';

// Color indices for sprite matrices
// 0 = transparent
// 1 = outline (dark brown)
// 2 = dark shade
// 3 = mid tone
// 4 = light tone
// 5 = highlight/cream
// 6 = pink (ears/nose)
// 7 = eye dark
// 8 = eye highlight

export class CatRenderer {
  private ctx: CanvasRenderingContext2D;

  // Sitting cat sprite - 19 wide x 21 tall (analyzed from reference)
  private sittingSprite: number[][] = [
    //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8
    [0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0], // 0 - ear tips
    [0,0,0,1,6,2,1,0,0,0,0,0,1,2,6,1,0,0,0], // 1 - ears
    [0,0,0,1,2,2,1,1,1,1,1,1,1,2,2,1,0,0,0], // 2 - ears meet head
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0], // 3 - top of head
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0], // 4
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0], // 5
    [1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1], // 6
    [1,2,3,4,7,7,4,4,4,4,4,4,4,7,7,4,3,2,1], // 7 - eyes top
    [1,2,3,4,7,8,4,4,4,4,4,4,4,8,7,4,3,2,1], // 8 - eyes bottom
    [1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1], // 9
    [1,2,3,4,4,4,4,4,1,1,1,4,4,4,4,4,3,2,1], // 10 - nose
    [1,2,3,4,4,4,4,4,4,6,4,4,4,4,4,4,3,2,1], // 11 - nose tip
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0], // 12 - chin
    [0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0], // 13 - neck
    [0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0], // 14 - body top
    [1,2,2,3,3,2,3,2,3,2,3,2,3,2,3,3,2,2,1], // 15 - body with stripes
    [1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1], // 16 - body
    [1,2,2,3,3,2,3,2,3,2,3,2,3,2,3,3,2,2,1], // 17 - body with stripes
    [1,2,3,4,4,4,1,1,1,1,1,1,1,4,4,4,3,2,1], // 18 - paws
    [0,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,0], // 19 - paw bottom
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 20
  ];

  // Standing cat sprite - 24 wide x 19 tall
  private standingSprite: number[][] = [
    //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3
    [0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0], // 0 - ear tips
    [0,0,0,1,6,2,1,0,0,0,0,0,1,2,6,1,0,0,0,0,0,0,0,0], // 1 - ears
    [0,0,0,1,2,2,1,1,1,1,1,1,1,2,2,1,0,0,0,0,0,0,0,0], // 2 - ears meet head
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0], // 3 - top of head
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0], // 4
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0,0,0,0,0,0], // 5
    [1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0,0,0,0,0], // 6
    [1,2,3,4,7,7,4,4,4,4,4,4,4,7,7,4,3,2,1,0,0,0,0,0], // 7 - eyes
    [1,2,3,4,7,8,4,4,4,4,4,4,4,8,7,4,3,2,1,0,0,0,0,0], // 8
    [1,2,3,4,4,4,4,4,1,1,1,4,4,4,4,4,3,2,1,1,1,0,0,0], // 9 - nose + tail start
    [1,2,3,4,4,4,4,4,4,6,4,4,4,4,4,4,3,2,2,3,2,1,0,0], // 10 - tail
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,1,3,2,1,0], // 11 - tail
    [0,1,2,2,3,2,3,2,3,2,3,2,3,2,3,2,2,1,0,0,1,3,1,0], // 12 - body stripes + tail
    [0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0,1,1,0], // 13 - body
    [0,1,2,2,3,2,3,2,3,2,3,2,3,2,3,2,2,1,0,0,0,0,0,0], // 14 - body stripes
    [0,1,2,1,1,2,2,1,1,1,1,1,2,2,1,1,2,1,0,0,0,0,0,0], // 15 - legs top
    [0,0,1,4,4,1,1,4,4,0,4,4,1,1,4,4,1,0,0,0,0,0,0,0], // 16 - legs
    [0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0], // 17 - paws
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 18
  ];

  // Lying down cat sprite - 24 wide x 14 tall
  private lyingSprite: number[][] = [
    //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0], // 0 - ear tips
    [0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,2,1,1,1,1,2,6,1,0], // 1 - ears
    [0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,2,1], // 2 - head top
    [0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,4,4,4,4,4,4,3,2,1], // 3
    [0,0,0,0,0,0,0,0,0,0,1,2,3,4,7,7,4,4,7,7,4,3,2,1], // 4 - eyes
    [1,1,1,0,0,0,0,0,0,0,1,2,3,4,7,8,4,4,8,7,4,3,2,1], // 5 - tail tip + eyes
    [1,3,2,1,1,1,1,1,1,1,2,3,4,4,4,1,1,1,4,4,4,3,2,1], // 6 - tail + nose
    [0,1,3,2,2,2,2,2,2,2,3,3,4,4,4,4,6,4,4,4,4,3,2,1], // 7 - body + face
    [0,0,1,2,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,3,2,1,0], // 8 - body
    [0,0,1,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,1,0], // 9 - stripes
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0], // 10 - body
    [0,0,1,2,4,4,4,1,1,1,1,1,1,1,1,1,1,4,4,4,4,2,1,0], // 11 - paws
    [0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0], // 12 - paw bottom
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 13
  ];

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2d context for cat rendering');
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;
  }

  render(cats: Cat[]): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (const cat of cats) {
      this.renderCat(cat);
    }
  }

  private renderCat(cat: Cat): void {
    const x = cat.getX();
    const y = cat.getY();
    const size = cat.getSize();
    const type = cat.getType();
    const state = cat.getState();

    this.ctx.save();
    this.ctx.translate(x, y);

    // Flip for right-side cats
    if (cat.getSide() === 'RIGHT') {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-size, 0);
    }

    const colors = this.getColorPalette(type);

    // Choose sprite based on state
    let sprite: number[][];
    switch (state) {
      case 'WALKING':
        sprite = this.standingSprite;
        break;
      case 'GAME_OVER':
        sprite = this.lyingSprite;
        break;
      default:
        sprite = this.sittingSprite;
    }

    this.drawSprite(sprite, size, colors);

    this.ctx.restore();
  }

  private getColorPalette(type: CatType): string[] {
    if (type === 'WHITE_LONGHAIR') {
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
      // Orange tabby - matching the reference image colors
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

  private drawSprite(sprite: number[][], size: number, colors: string[]): void {
    const spriteHeight = sprite.length;
    const spriteWidth = sprite[0].length;
    const ps = size / Math.max(spriteWidth, spriteHeight); // pixel size

    for (let y = 0; y < spriteHeight; y++) {
      for (let x = 0; x < spriteWidth; x++) {
        const colorIndex = sprite[y][x];
        if (colorIndex === 0) continue; // transparent

        this.ctx.fillStyle = colors[colorIndex];
        this.ctx.fillRect(
          Math.floor(x * ps),
          Math.floor(y * ps),
          Math.ceil(ps),
          Math.ceil(ps)
        );
      }
    }
  }
}
