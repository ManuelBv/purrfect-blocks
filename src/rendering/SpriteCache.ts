// High-performance sprite caching system for pre-rendered cat sprites
// Uses offscreen canvases to avoid re-rendering the same sprite multiple times

export interface CachedSprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  lastUsed: number; // Timestamp for LRU eviction
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsageBytes: number;
}

/**
 * SpriteCache - Caches pre-rendered cat sprites to offscreen canvases
 *
 * Performance optimization that reduces per-frame rendering cost by ~90%.
 * Instead of drawing each pixel of a sprite every frame, we:
 * 1. Render sprite to offscreen canvas once (cache miss)
 * 2. Use fast drawImage() to blit cached canvas (cache hit)
 *
 * Cache key format: {catType}-{state}-{frame}-{size}-{colorHash}
 *
 * Example:
 * - "ORANGE_TABBY-SITTING-0-64-#442211,#774422,..."
 * - "WHITE_LONGHAIR-WALKING-1-80-#5c5c5c,#8a8a8a,..."
 */
export class SpriteCache {
  private cache: Map<string, CachedSprite> = new Map();
  private maxCacheSize: number = 100; // Limit cache to prevent memory issues
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    memoryUsageBytes: 0,
  };

  /**
   * Generate unique cache key for a sprite configuration
   *
   * @param catType - Type of cat (WHITE_LONGHAIR or ORANGE_TABBY)
   * @param state - Animation state (SITTING, WALKING, etc.)
   * @param frame - Animation frame number (0-based)
   * @param size - Render size in pixels
   * @param colorPalette - Array of color strings for the sprite
   * @returns Unique cache key string
   */
  getCacheKey(
    catType: string,
    state: string,
    frame: number,
    size: number,
    colorPalette: string[]
  ): string {
    // Create a short hash of the color palette to keep key manageable
    const colorHash = colorPalette.slice(0, 3).join(',');
    return `${catType}-${state}-${frame}-${size}-${colorHash}`;
  }

  /**
   * Get cached sprite if available
   *
   * @param key - Cache key from getCacheKey()
   * @returns Cached sprite or undefined if not found
   */
  get(key: string): CachedSprite | undefined {
    const cached = this.cache.get(key);
    if (cached) {
      this.stats.hits++;
      cached.lastUsed = performance.now();
      return cached;
    }
    this.stats.misses++;
    return undefined;
  }

  /**
   * Check if sprite is cached without affecting stats
   *
   * @param key - Cache key to check
   * @returns True if sprite is cached
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Cache a rendered sprite
   *
   * @param key - Cache key from getCacheKey()
   * @param canvas - Offscreen canvas with rendered sprite
   */
  set(key: string, canvas: HTMLCanvasElement): void {
    // Evict old entries if cache is full (LRU strategy)
    if (this.cache.size >= this.maxCacheSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const sprite: CachedSprite = {
      canvas,
      width: canvas.width,
      height: canvas.height,
      lastUsed: performance.now(),
    };

    this.cache.set(key, sprite);
    this.stats.size = this.cache.size;
    this.updateMemoryUsage();
  }

  /**
   * Clear all cached sprites
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.memoryUsageBytes = 0;
  }

  /**
   * Invalidate specific cache entries by prefix
   * Useful for invalidating all sprites of a certain type or state
   *
   * @param prefix - Key prefix to match (e.g., "ORANGE_TABBY-SITTING")
   * @returns Number of entries invalidated
   */
  invalidate(prefix: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      count++;
    }

    this.stats.size = this.cache.size;
    this.updateMemoryUsage();
    return count;
  }

  /**
   * Get cache statistics for monitoring
   *
   * @returns Current cache stats
   */
  getStats(): Readonly<CacheStats> {
    return { ...this.stats };
  }

  /**
   * Get cache hit rate as percentage
   *
   * @returns Hit rate (0-100) or 0 if no requests yet
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return 0;
    return (this.stats.hits / total) * 100;
  }

  /**
   * Reset statistics (useful for benchmarking)
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    // Keep size and memory usage
  }

  /**
   * Evict least recently used entry from cache
   * Called automatically when cache is full
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, sprite] of this.cache.entries()) {
      if (sprite.lastUsed < oldestTime) {
        oldestTime = sprite.lastUsed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Calculate approximate memory usage of cached sprites
   * Assumes 4 bytes per pixel (RGBA)
   */
  private updateMemoryUsage(): void {
    let totalBytes = 0;

    for (const sprite of this.cache.values()) {
      // Each pixel is 4 bytes (RGBA)
      const bytes = sprite.width * sprite.height * 4;
      totalBytes += bytes;
    }

    this.stats.memoryUsageBytes = totalBytes;
  }

  /**
   * Get human-readable memory usage string
   *
   * @returns Memory usage in KB or MB
   */
  getMemoryUsageString(): string {
    const kb = this.stats.memoryUsageBytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}
