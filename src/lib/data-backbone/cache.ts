import type { DataCache } from "@/types/data";

class DataCacheManager {
  private cache: Map<string, DataCache> = new Map();
  private readonly DEFAULT_TTL = 3600000; // 1 hour

  get(key: string): DataCache | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(key: string, value: unknown, ttlMs?: number): void {
    const now = new Date();
    this.cache.set(key, {
      key,
      value: JSON.stringify(value),
      fetchedAt: now,
      expiresAt: new Date(now.getTime() + (ttlMs || this.DEFAULT_TTL)),
    });
  }

  has(key: string): boolean {
    const entry = this.get(key);
    return entry !== null;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0,
    };
  }
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class GenericDataCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const dataCache = new DataCacheManager();
export const genericCache = new GenericDataCache();
