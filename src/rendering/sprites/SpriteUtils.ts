// Utility functions for sprite processing

/**
 * Clean up background artifacts from a sprite.
 * Removes highlight (5) pixels that form the anti-aliasing border around the sprite.
 * Only removes pixels that are between transparent and outline - not interior highlights.
 * Single pass only to avoid eroding inward.
 */
export function cleanupBackgroundArtifacts(sprite: number[][]): number[][] {
  const height = sprite.length;
  const width = sprite[0]?.length || 0;

  // Helper to check if a pixel is adjacent to transparent
  function isAdjacentToTransparent(y: number, x: number): boolean {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
        const ny = y + dy;
        const nx = x + dx;
        if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
          return true; // Edge of sprite counts as transparent
        }
        if (sprite[ny][nx] === 0) {
          return true;
        }
      }
    }
    return false;
  }

  // Helper to check if pixel is adjacent to outline (1) - meaning it's at the edge of the cat body
  function isAdjacentToOutline(y: number, x: number): boolean {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
          if (sprite[ny][nx] === 1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Create cleaned sprite - remove highlight (5) pixels that are artifacts
  // Artifacts are highlight pixels that sit between transparent AND outline
  // (they form the anti-aliasing border: transparent -> highlight -> outline -> body)
  const result: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const pixel = sprite[y][x];

      // Remove highlight (5) pixels that touch BOTH transparent AND outline
      // These are the anti-aliasing artifacts at the sprite boundary
      if (pixel === 5 && isAdjacentToTransparent(y, x) && isAdjacentToOutline(y, x)) {
        row.push(0);
        continue;
      }

      row.push(pixel);
    }
    result.push(row);
  }

  return result;
}

/**
 * Downsample a sprite using mode (most common pixel) in each block.
 * Prefers non-transparent pixels.
 */
export function downsampleWithMode(sprite: number[][], factor: number): number[][] {
  const height = sprite.length;
  const width = sprite[0]?.length || 0;
  const newHeight = Math.ceil(height / factor);
  const newWidth = Math.ceil(width / factor);

  const result: number[][] = [];

  for (let y = 0; y < newHeight; y++) {
    const row: number[] = [];
    for (let x = 0; x < newWidth; x++) {
      // Collect all pixels in this block
      const pixels: number[] = [];
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const srcY = Math.min(y * factor + dy, height - 1);
          const srcX = Math.min(x * factor + dx, width - 1);
          pixels.push(sprite[srcY][srcX]);
        }
      }

      // Find mode (most common value), preferring non-transparent
      const counts = new Map<number, number>();
      for (const p of pixels) {
        counts.set(p, (counts.get(p) || 0) + 1);
      }

      // Find the most common non-zero value, or 0 if all are transparent
      let bestValue = 0;
      let bestCount = 0;

      for (const [value, count] of counts.entries()) {
        if (value !== 0 && count > bestCount) {
          bestValue = value;
          bestCount = count;
        }
      }

      if (bestCount === 0) {
        bestValue = 0;
      }

      row.push(bestValue);
    }
    result.push(row);
  }

  return result;
}
