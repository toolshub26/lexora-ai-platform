
"use strict";

/**
 * Lexora AI Platform
 * Enterprise Guardrails
 */

class Guardrails {
  constructor() {
    this.maxPromptLength = 10000;

    this.blockedPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi,
      /document\.cookie/gi,
      /localStorage/gi
    ];
  }

  validate(prompt) {
    if (typeof prompt !== "string") {
      throw new Error("Prompt must be a string.");
    }

    if (!prompt.trim()) {
      throw new Error("Prompt cannot be empty.");
    }

    if (prompt.length > this.maxPromptLength) {
      throw new Error("Prompt exceeds maximum length.");
    }

    for (const pattern of this.blockedPatterns) {
      if (pattern.test(prompt)) {
        throw new Error("Unsafe content detected.");
      }
    }

    return true;
  }

  sanitize(prompt) {
    this.validate(prompt);

    let cleaned = prompt;

    for (const pattern of this.blockedPatterns) {
      cleaned = cleaned.replace(pattern, "");
    }

    return cleaned.trim();
  }
}

const guardrails = new Guardrails();

if (typeof window !== "undefined") {
  window.aiGuardrails = guardrails;
}

module.exports = guardrails;
