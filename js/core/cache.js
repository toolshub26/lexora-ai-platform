
"use strict";

/**
 * Lexora AI Platform
 * Enterprise Cache Manager
 */

class CacheManager {
  constructor(defaultTTL = 300000) {
    this.defaultTTL = defaultTTL;
    this.cache = new Map();
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  remove(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const cache = new CacheManager();

if (typeof window !== "undefined") {
  window.aiCache = cache;
}

module.exports = cache;
