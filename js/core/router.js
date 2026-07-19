
"use strict";

/**
 * Lexora AI Platform
 * Enterprise Router
 */

class Router {
  constructor() {
    this.routes = new Map();
  }

  register(path, handler) {
    if (typeof handler !== "function") {
      throw new Error("Route handler must be a function.");
    }

    this.routes.set(path, handler);
  }

  navigate(path, data = {}) {
    const handler = this.routes.get(path);

    if (!handler) {
      console.warn(`Route not found: ${path}`);
      return null;
    }

    return handler(data);
  }

  has(path) {
    return this.routes.has(path);
  }

  remove(path) {
    this.routes.delete(path);
  }

  clear() {
    this.routes.clear();
  }

  list() {
    return [...this.routes.keys()];
  }
}

const router = new Router();

if (typeof window !== "undefined") {
  window.aiRouter = router;
}

module.exports = router;
