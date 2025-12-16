/**
 * Simple in-memory TTL cache
 *
 * Good for:
 * - MVP / development
 * - Vercel serverless (per-instance caching)
 * - Single-process deployments
 *
 * Not suitable for:
 * - Multi-instance production (use Redis/KV instead)
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(private defaultTtlMs: number = 30_000) {}

  /**
   * Get a value from cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set a value in cache with optional TTL override
   */
  set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of cached entries (including expired)
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs?: number
  ): Promise<{ value: T; fromCache: boolean }> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return { value: cached, fromCache: true };
    }

    const value = await fetcher();
    this.set(key, value, ttlMs);
    return { value, fromCache: false };
  }

  /**
   * Get stale value even if expired (for fallback scenarios)
   */
  getStale(key: string): T | undefined {
    const entry = this.cache.get(key);
    return entry?.value;
  }

  /**
   * Check if a cached entry is stale (expired but still in cache)
   */
  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() > entry.expiresAt;
  }
}

// Export singleton instances for different cache needs
export const snapshotCache = new TTLCache<unknown>(30_000); // 30s default
export const nodeDetailCache = new TTLCache<unknown>(60_000); // 60s default
export const pnodeStatsCache = new TTLCache<unknown>(15_000); // 15s default (per-node live stats)

// Export class for custom instances
export { TTLCache };

