"use strict";

/**
 * Lexora AI Platform
 * Enterprise Memory Manager
 */

class MemoryManager {
  constructor(limit = 100) {
    this.limit = limit;
    this.history = [];
  }

  add(role, content) {
    this.history.push({
      role,
      content,
      timestamp: Date.now()
    });

    if (this.history.length > this.limit) {
      this.history.shift();
    }
  }

  getAll() {
    return [...this.history];
  }

  getRecent(count = 10) {
    return this.history.slice(-count);
  }

  clear() {
    this.history = [];
  }

  size() {
    return this.history.length;
  }
}

const memory = new MemoryManager();

if (typeof window !== "undefined") {
  window.aiMemory = memory;
}

module.exports = memory;
