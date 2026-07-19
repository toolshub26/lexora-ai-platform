"use strict";

/**
 * Lexora AI Platform
 * Main AI Bootstrap
 */

const ai = {
  version: "3.0.0",
  initialized: false,

  init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    if (typeof console !== "undefined") {
      console.log("🚀 Lexora AI Platform initialized");
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("lexora:ai:ready", {
          detail: {
            version: this.version
          }
        })
      );
    }

    if (
      typeof window !== "undefined" &&
      window.aiTelemetry &&
      typeof window.aiTelemetry.track === "function"
    ) {
      window.aiTelemetry.track("ai_initialized", {
        version: this.version
      });
    }
  },

  status() {
    return {
      version: this.version,
      initialized: this.initialized,
      timestamp: new Date().toISOString()
    };
  }
};

if (typeof window !== "undefined") {
  window.LexoraAI = ai;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ai.init());
  } else {
    ai.init();
  }
}

module.exports = ai;
