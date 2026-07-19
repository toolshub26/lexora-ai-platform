"use strict";

/**
 * Lexora AI Platform
 * Enterprise Analytics
 */

class AnalyticsManager {
  constructor() {
    this.events = [];
  }

  track(event, properties = {}) {
    const payload = {
      event,
      properties,
      timestamp: new Date().toISOString()
    };

    this.events.push(payload);

    if (typeof window !== "undefined" && window.aiTelemetry) {
      window.aiTelemetry.track(event, properties);
    }

    if (typeof console !== "undefined") {
      console.log("[Analytics]", payload);
    }

    return payload;
  }

  pageView(page) {
    return this.track("page_view", { page });
  }

  userAction(action, details = {}) {
    return this.track(action, details);
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

const analytics = new AnalyticsManager();

if (typeof window !== "undefined") {
  window.analytics = analytics;
}

module.exports = analytics;
