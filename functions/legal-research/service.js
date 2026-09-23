"use strict";

class ServerLegalResearchService {
  constructor(options = {}) {
    if (
      !options.orchestrator ||
      typeof options.orchestrator.execute !== "function"
    ) {
      throw new Error("A valid legal research orchestrator is required.");
    }

    this.orchestrator = options.orchestrator;
  }

  async research(request) {
    return this.orchestrator.execute(request);
  }
}

module.exports = { ServerLegalResearchService };
