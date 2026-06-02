interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new SimpleCache();

// TTL constants (ms)
export const TTL = {
  YIELD_RATES: 5 * 60 * 1000,      // 5 minutes
  NANSEN: 10 * 60 * 1000,          // 10 minutes
  ELFA: 5 * 60 * 1000,             // 5 minutes
  GROQ_BRIEF: 60 * 1000,            // 1 minute
} as const;
