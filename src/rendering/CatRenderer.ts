// Pixel art cats using sprite matrices

import type { Cat, CatAnimationState, CatType } from '../entities/Cat';
import { standingCatSprite } from './sprites/StandingCatSprite';
import { lyingCatSprite } from './sprites/LyingCatSprite';
import { sittingTailCatSprite } from './sprites/SittingTailCatSprite';
import { sittingFrontCatSprite } from './sprites/SittingFrontCatSprite';
import { SpriteCache } from './SpriteCache';

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
  private spriteCache: SpriteCache;

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
    this.spriteCache = new SpriteCache();

    // Pre-warm cache with common sprites on initialization
    this.prewarmCache();
  }

  /**
   * Pre-render common cat sprites to cache for optimal first-frame performance
   * Caches both cat types in common states at typical sizes
   */
  private prewarmCache(): void {
    // Pre-cache all states that have different sprites
    const commonStates: CatAnimationState[] = [
      'SITTING',    // sittingFrontCatSprite (140×132)
      'STANDING',   // standingCatSprite (192×160)
      'GAME_OVER',  // lyingCatSprite (163×86)
      'YAWNING',    // sittingTailCatSprite (148×136)
    ];
    const catTypes: CatType[] = ['ORANGE_TABBY', 'WHITE_LONGHAIR'];
    const commonSizes = [120, 152, 180]; // Larger sizes for full-res sprites

    for (const catType of catTypes) {
      for (const state of commonStates) {
        for (const size of commonSizes) {
          const sprite = this.getSpriteForState(state);
          const colors = this.getColorPalette(catType);
          const cacheKey = this.spriteCache.getCacheKey(
            catType,
            state,
            0, // Frame 0 (most common)
            size,
            colors
          );

          // Only pre-render if not already cached
          if (!this.spriteCache.has(cacheKey)) {
            const offscreenCanvas = this.renderSpriteToCanvas(sprite, size, colors, false, 0);
            this.spriteCache.set(cacheKey, offscreenCanvas);
          }
        }
      }
    }
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
    const frame = cat.getAnimationFrame();

    // Note: Breathing offset disabled for full-res sprite (causes visual jumping)
    // For proper breathing, would need to animate specific sprite rows, not translate entire sprite
    // const breathingYOffset = cat.getBreathingYOffset();

    // Apply state transition offset (for sit/stand transitions)
    const transitionYOffset = cat.getTransitionYOffset();

    // Combine offsets (breathing disabled for full-res sprite)
    const totalYOffset = transitionYOffset;

    // Note: Micro-animations (ear twitch, tail swish) disabled for performance
    // The full-res 123x124 sprite would need to be re-rendered every frame
    // which causes ~1.8M fillRect calls/second and 10%+ CPU usage

    // Get sprite and colors
    const sprite = this.getSpriteForState(state);
    const colors = this.getColorPalette(type);

    // ALWAYS use cache for performance - micro-animations disabled for full-res sprites
    // The 123x124 sprite has 15,252 pixels - re-rendering every frame kills performance
    // Micro-animations (ear twitch, tail swish) would need separate cached frames
    const cacheKey = this.spriteCache.getCacheKey(type, state, frame, size, colors);

    this.ctx.save();
    this.ctx.translate(x, y + totalYOffset);

    // Flip for right-side cats
    if (cat.getSide() === 'RIGHT') {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-size, 0);
    }

    // Always use cache for performance
    const cached = this.spriteCache.get(cacheKey);

    if (cached) {
      // Cache hit: Fast blit of pre-rendered sprite (~10x faster)
      this.ctx.drawImage(cached.canvas, 0, 0);
    } else {
      // Cache miss: Render to offscreen canvas, cache it, then blit
      const offscreenCanvas = this.renderSpriteToCanvas(sprite, size, colors, false, 0);
      this.spriteCache.set(cacheKey, offscreenCanvas);
      this.ctx.drawImage(offscreenCanvas, 0, 0);
    }

    this.ctx.restore();
  }

  /**
   * Get sprite matrix for a given animation state
   * Uses full-resolution sprites extracted from cat.jpg:
   * - sittingFrontCatSprite: 140×132 (sitting front view - default)
   * - standingCatSprite: 192×160 (standing pose)
   * - lyingCatSprite: 163×86 (lying down pose)
   * - sittingTailCatSprite: 148×136 (sitting with tail visible)
   */
  private getSpriteForState(state: CatAnimationState): number[][] {
    switch (state) {
      case 'STANDING':
      case 'WALKING':
        return standingCatSprite;
      case 'GAME_OVER':
        return lyingCatSprite;
      case 'YAWNING':
      case 'STRETCHING':
        return sittingTailCatSprite;
      case 'IDLE':
      case 'SITTING':
      case 'EXCITED':
      case 'SWAT':
      default:
        return sittingFrontCatSprite;
    }
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

  /**
   * Render sprite to offscreen canvas for caching
   * Creates a new canvas with the sprite pre-rendered
   *
   * @param sprite - Sprite matrix to render
   * @param size - Render size in pixels
   * @param colors - Color palette for the sprite
   * @param isEarTwitching - Whether ear twitch effect is active
   * @param tailSwishOffset - Tail swish offset in pixels
   * @returns Offscreen canvas with rendered sprite
   */
  private renderSpriteToCanvas(
    sprite: number[][],
    size: number,
    colors: string[],
    isEarTwitching: boolean,
    tailSwishOffset: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const spriteHeight = sprite.length;
    const spriteWidth = sprite[0].length;
    const ps = size / Math.max(spriteWidth, spriteHeight); // pixel size

    canvas.width = Math.ceil(spriteWidth * ps);
    canvas.height = Math.ceil(spriteHeight * ps);

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Render sprite to offscreen canvas
    for (let y = 0; y < spriteHeight; y++) {
      for (let x = 0; x < spriteWidth; x++) {
        const colorIndex = sprite[y][x];
        if (colorIndex === 0) continue; // transparent

        let drawX = x;
        let drawY = y;

        // Apply ear twitch effect (shift ear pixels slightly)
        if (isEarTwitching && y <= 2) {
          if (colorIndex === 6) {
            drawX += 0.3;
          }
        }

        // Apply tail swish offset
        if (tailSwishOffset !== 0 && x >= spriteWidth - 6) {
          drawX += tailSwishOffset / ps;
        }

        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(
          Math.floor(drawX * ps),
          Math.floor(drawY * ps),
          Math.ceil(ps),
          Math.ceil(ps)
        );
      }
    }

    return canvas;
  }

  /**
   * Draw sprite directly to main canvas (used for dynamic micro-animations)
   */
  private drawSprite(
    sprite: number[][],
    size: number,
    colors: string[],
    isEarTwitching: boolean = false,
    tailSwishOffset: number = 0
  ): void {
    const spriteHeight = sprite.length;
    const spriteWidth = sprite[0].length;
    const ps = size / Math.max(spriteWidth, spriteHeight); // pixel size

    for (let y = 0; y < spriteHeight; y++) {
      for (let x = 0; x < spriteWidth; x++) {
        const colorIndex = sprite[y][x];
        if (colorIndex === 0) continue; // transparent

        let drawX = x;
        let drawY = y;

        // Apply ear twitch effect (shift ear pixels slightly)
        // Ears are typically in rows 0-2 for most sprites
        if (isEarTwitching && y <= 2) {
          // Pink ear pixels (color index 6) move slightly
          if (colorIndex === 6) {
            drawX += 0.3; // Slight horizontal shift during twitch
          }
        }

        // Apply tail swish offset
        // Tail is typically on the right side or specific columns depending on sprite
        // For sitting sprite, tail is around column 16-18
        // For standing sprite, tail is around columns 18-23
        if (tailSwishOffset !== 0 && x >= spriteWidth - 6) {
          // Apply horizontal offset to tail pixels
          drawX += tailSwishOffset / ps; // Convert pixel offset to sprite coordinates
        }

        this.ctx.fillStyle = colors[colorIndex];
        this.ctx.fillRect(
          Math.floor(drawX * ps),
          Math.floor(drawY * ps),
          Math.ceil(ps),
          Math.ceil(ps)
        );
      }
    }
  }

  /**
   * Clear sprite cache (useful when canvas is resized)
   */
  clearCache(): void {
    this.spriteCache.clear();
  }

  /**
   * Get cache statistics for performance monitoring
   */
  getCacheStats() {
    return this.spriteCache.getStats();
  }

  /**
   * Get cache hit rate percentage
   */
  getCacheHitRate(): number {
    return this.spriteCache.getHitRate();
  }
}
