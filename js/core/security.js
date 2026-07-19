
"use strict";

/**
 * Lexora AI Platform
 * Enterprise Security Manager
 */

class SecurityManager {
  sanitize(input) {
    if (typeof input !== "string") {
      return input;
    }

    return input
      .replace(/<script.*?>.*?<\/script>/gis, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=".*?"/gi, "")
      .trim();
  }

  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid prompt.");
    }

    if (prompt.length > 10000) {
      throw new Error("Prompt exceeds maximum length.");
    }

    return this.sanitize(prompt);
  }

  isSafe(value) {
    try {
      this.validatePrompt(value);
      return true;
    } catch {
      return false;
    }
  }
}

const security = new SecurityManager();

if (typeof window !== "undefined") {
  window.aiSecurity = security;
}

module.exports = security;
