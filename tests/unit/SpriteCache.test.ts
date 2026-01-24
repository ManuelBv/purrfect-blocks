// Unit tests for SpriteCache

import { describe, it, expect, beforeEach } from 'vitest';
import { SpriteCache } from '../../src/rendering/SpriteCache';

describe('SpriteCache', () => {
  let cache: SpriteCache;

  beforeEach(() => {
    cache = new SpriteCache();
  });

  describe('getCacheKey', () => {
    it('should generate unique keys for different configurations', () => {
      const key1 = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211', '#774422', '#aa6633']);
      const key2 = cache.getCacheKey('WHITE_LONGHAIR', 'SITTING', 0, 64, ['#5c5c5c', '#8a8a8a', '#b8b8b8']);
      const key3 = cache.getCacheKey('ORANGE_TABBY', 'STANDING', 0, 64, ['#442211', '#774422', '#aa6633']);
      const key4 = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 1, 64, ['#442211', '#774422', '#aa6633']);
      const key5 = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 80, ['#442211', '#774422', '#aa6633']);

      expect(key1).not.toBe(key2); // Different cat type
      expect(key1).not.toBe(key3); // Different state
      expect(key1).not.toBe(key4); // Different frame
      expect(key1).not.toBe(key5); // Different size
    });

    it('should generate same key for same configuration', () => {
      const key1 = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211', '#774422', '#aa6633']);
      const key2 = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211', '#774422', '#aa6633']);

      expect(key1).toBe(key2);
    });

    it('should include first 3 colors in key', () => {
      const colors = ['#442211', '#774422', '#aa6633', '#cc8844', '#eebb88'];
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, colors);

      expect(key).toContain('#442211,#774422,#aa6633');
    });
  });

  describe('set and get', () => {
    it('should cache and retrieve a sprite', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;

      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);
      const cached = cache.get(key);

      expect(cached).toBeDefined();
      expect(cached?.canvas).toBe(canvas);
      expect(cached?.width).toBe(64);
      expect(cached?.height).toBe(64);
    });

    it('should return undefined for non-existent key', () => {
      const cached = cache.get('non-existent-key');
      expect(cached).toBeUndefined();
    });

    it('should update lastUsed timestamp on get', () => {
      const canvas = document.createElement('canvas');
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);
      const cached1 = cache.get(key);
      const timestamp1 = cached1?.lastUsed || 0;

      // Wait a bit
      const start = performance.now();
      while (performance.now() - start < 5) {
        // Wait 5ms
      }

      const cached2 = cache.get(key);
      const timestamp2 = cached2?.lastUsed || 0;

      expect(timestamp2).toBeGreaterThan(timestamp1);
    });
  });

  describe('has', () => {
    it('should return true for cached sprite', () => {
      const canvas = document.createElement('canvas');
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);

      expect(cache.has(key)).toBe(true);
    });

    it('should return false for non-cached sprite', () => {
      expect(cache.has('non-existent-key')).toBe(false);
    });

    it('should not affect cache statistics', () => {
      const canvas = document.createElement('canvas');
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);
      cache.resetStats();

      cache.has(key);
      const stats = cache.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all cached sprites', () => {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const key1 = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);
      const key2 = cache.getCacheKey('WHITE_LONGHAIR', 'STANDING', 0, 64, ['#5c5c5c']);

      cache.set(key1, canvas1);
      cache.set(key2, canvas2);

      expect(cache.has(key1)).toBe(true);
      expect(cache.has(key2)).toBe(true);

      cache.clear();

      expect(cache.has(key1)).toBe(false);
      expect(cache.has(key2)).toBe(false);
    });

    it('should reset size and memory stats', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);

      const statsBefore = cache.getStats();
      expect(statsBefore.size).toBe(1);
      expect(statsBefore.memoryUsageBytes).toBeGreaterThan(0);

      cache.clear();

      const statsAfter = cache.getStats();
      expect(statsAfter.size).toBe(0);
      expect(statsAfter.memoryUsageBytes).toBe(0);
    });
  });

  describe('invalidate', () => {
    it('should invalidate sprites matching prefix', () => {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const canvas3 = document.createElement('canvas');

      const key1 = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);
      const key2 = cache.getCacheKey('ORANGE_TABBY', 'STANDING', 0, 64, ['#442211']);
      const key3 = cache.getCacheKey('WHITE_LONGHAIR', 'SITTING', 0, 64, ['#5c5c5c']);

      cache.set(key1, canvas1);
      cache.set(key2, canvas2);
      cache.set(key3, canvas3);

      const count = cache.invalidate('ORANGE_TABBY');

      expect(count).toBe(2);
      expect(cache.has(key1)).toBe(false);
      expect(cache.has(key2)).toBe(false);
      expect(cache.has(key3)).toBe(true); // WHITE_LONGHAIR should remain
    });

    it('should return 0 if no sprites match prefix', () => {
      const canvas = document.createElement('canvas');
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);

      const count = cache.invalidate('WHITE_LONGHAIR');

      expect(count).toBe(0);
      expect(cache.has(key)).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should track cache hits', () => {
      const canvas = document.createElement('canvas');
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);
      cache.resetStats(); // Reset to ignore the set operation

      cache.get(key); // Hit
      cache.get(key); // Hit

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(0);
    });

    it('should track cache misses', () => {
      cache.get('non-existent-1'); // Miss
      cache.get('non-existent-2'); // Miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(2);
    });

    it('should calculate hit rate correctly', () => {
      const canvas = document.createElement('canvas');
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);
      cache.resetStats();

      cache.get(key); // Hit
      cache.get(key); // Hit
      cache.get(key); // Hit
      cache.get('non-existent'); // Miss

      const hitRate = cache.getHitRate();
      expect(hitRate).toBe(75); // 3 hits out of 4 total = 75%
    });

    it('should return 0 hit rate when no requests', () => {
      const hitRate = cache.getHitRate();
      expect(hitRate).toBe(0);
    });

    it('should track cache size', () => {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const key1 = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);
      const key2 = cache.getCacheKey('WHITE_LONGHAIR', 'STANDING', 0, 64, ['#5c5c5c']);

      cache.set(key1, canvas1);
      expect(cache.getStats().size).toBe(1);

      cache.set(key2, canvas2);
      expect(cache.getStats().size).toBe(2);
    });

    it('should calculate memory usage', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);

      const stats = cache.getStats();
      // 100 * 100 * 4 bytes (RGBA) = 40000 bytes
      expect(stats.memoryUsageBytes).toBe(40000);
    });

    it('should reset stats without clearing cache', () => {
      const canvas = document.createElement('canvas');
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);
      cache.get(key);

      expect(cache.getStats().hits).toBeGreaterThan(0);

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.size).toBe(1); // Size should remain
      expect(cache.has(key)).toBe(true); // Cache should remain
    });
  });

  describe('getMemoryUsageString', () => {
    it('should format small sizes in KB', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);

      const memStr = cache.getMemoryUsageString();
      expect(memStr).toContain('KB');
      expect(memStr).not.toContain('MB');
    });

    it('should format large sizes in MB', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 0, 64, ['#442211']);

      cache.set(key, canvas);

      const memStr = cache.getMemoryUsageString();
      expect(memStr).toContain('MB');
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used sprite when cache is full', () => {
      // Note: Default max cache size is 100
      // Create 101 sprites to trigger eviction
      const keys: string[] = [];

      for (let i = 0; i < 101; i++) {
        const canvas = document.createElement('canvas');
        const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', i, 64, ['#442211']);
        keys.push(key);
        cache.set(key, canvas);
      }

      // First key should have been evicted
      expect(cache.has(keys[0])).toBe(false);
      // Last key should still be cached
      expect(cache.has(keys[100])).toBe(true);
      // Cache size should be at max
      expect(cache.getStats().size).toBeLessThanOrEqual(100);
    });

    it('should not evict recently accessed sprite', () => {
      // Fill cache to max
      const keys: string[] = [];
      for (let i = 0; i < 100; i++) {
        const canvas = document.createElement('canvas');
        const key = cache.getCacheKey('ORANGE_TABBY', 'SITTING', i, 64, ['#442211']);
        keys.push(key);
        cache.set(key, canvas);
      }

      // Access the first sprite to update its lastUsed
      cache.get(keys[0]);

      // Add one more sprite to trigger eviction
      const newCanvas = document.createElement('canvas');
      const newKey = cache.getCacheKey('ORANGE_TABBY', 'SITTING', 100, 64, ['#442211']);
      cache.set(newKey, newCanvas);

      // First key should still be cached (it was recently accessed)
      expect(cache.has(keys[0])).toBe(true);
    });
  });
});
