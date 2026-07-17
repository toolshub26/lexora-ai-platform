import { memoryCache } from "./memory-cache";

export class CacheManager {
  set<T>(key: string, value: T, ttl?: number): void {
    memoryCache.set(key, value, ttl);
  }

  get<T>(key: string): T | undefined {
    return memoryCache.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return memoryCache.has(key);
  }

  delete(key: string): boolean {
    return memoryCache.delete(key);
  }

  clear(): void {
    memoryCache.clear();
  }
}

export const cacheManager = new CacheManager();
