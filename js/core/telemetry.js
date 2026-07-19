
"use strict";

/**
 * Lexora AI Platform
 * Enterprise Telemetry Manager
 */

class TelemetryManager {
  constructor() {
    this.events = [];
    this.enabled = true;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  track(event, data = {}) {
    if (!this.enabled) return;

    this.events.push({
      event,
      data,
      timestamp: new Date().toISOString()
    });

    if (this.events.length > 1000) {
      this.events.shift();
    }

    if (typeof console !== "undefined") {
      console.log("[Telemetry]", event, data);
    }
  }

  getEvents() {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }

  count() {
    return this.events.length;
  }
}

const telemetry = new TelemetryManager();

if (typeof window !== "undefined") {
  window.aiTelemetry = telemetry;
}

module.exports = telemetry;
