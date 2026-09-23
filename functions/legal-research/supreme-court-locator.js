"use strict";

class SupremeCourtJudgmentLocator {
  constructor(options = {}) {
    if (
      options.mappingProvider !== undefined &&
      typeof options.mappingProvider !== "function"
    ) {
      throw new Error(
        "Supreme Court mapping provider must be a function.",
      );
    }

    this.mappingProvider = options.mappingProvider || null;
  }

  async locate(document) {
    if (!document || typeof document !== "object") {
      throw new Error("A Supreme Court document is required.");
    }

    const suplisCaseId =
      document.metadata?.suplisCaseId;

    if (!suplisCaseId || !this.mappingProvider) {
      return null;
    }

    const mapping = await this.mappingProvider({
      suplisCaseId: String(suplisCaseId),
      document,
    });

    if (!mapping || !mapping.sciJudgmentId) {
      return null;
    }

    return {
      sciJudgmentId: String(mapping.sciJudgmentId),
      mappingSource:
        mapping.mappingSource || "external-provider",
    };
  }
}

module.exports = {
  SupremeCourtJudgmentLocator,
};
