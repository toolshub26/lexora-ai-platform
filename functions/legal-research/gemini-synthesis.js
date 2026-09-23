"use strict";

function createGeminiLegalSynthesisGenerator(options = {}) {
  if (
    !options.model ||
    typeof options.model.generateContent !== "function"
  ) {
    throw new Error("Gemini model client is required.");
  }

  const model = options.model;

  return async function generateLegalSynthesis(input) {
    const sources = Array.isArray(input?.sources) ? input.sources : [];
    const evidence = Array.isArray(input?.evidence) ? input.evidence : [];
    const verifications = Array.isArray(input?.verifications)
      ? input.verifications
      : [];
    const citations = Array.isArray(input?.citations)
      ? input.citations
      : [];

    const verifiedSourceIds = new Set(
      verifications
        .filter((item) => item?.status === "verified")
        .map((item) => item.sourceId),
    );

    const verifiedSources = sources.filter((source) =>
      verifiedSourceIds.has(source.id),
    );

    const verifiedEvidence = evidence.filter((item) =>
      verifiedSourceIds.has(item.sourceId),
    );

    const verifiedCitations = citations.filter(
      (citation) =>
        verifiedSourceIds.has(citation.sourceId) &&
        citation.verificationStatus === "verified",
    );

    if (
      verifiedSources.length === 0 ||
      verifiedEvidence.length === 0
    ) {
      throw new Error(
        "No verified legal evidence is available for synthesis.",
      );
    }

    const evidenceText = verifiedEvidence
      .map(
        (item) =>
          `[${item.sourceId}] ${item.excerpt}`,
      )
      .join("\n\n");

    const sourceText = verifiedSources
      .map(
        (source) =>
          `[${source.id}] ${source.title} — ${source.citation}`,
      )
      .join("\n");

    const citationText = verifiedCitations
      .map(
        (citation) =>
          `[${citation.sourceId}] ${citation.citation}`,
      )
      .join("\n");

    const contents = [
      "You are a legal research synthesis component.",
      "Use ONLY the verified legal sources and evidence supplied below.",
      "Do not invent authorities, quotations, facts, citations, or legal propositions.",
      "If the supplied evidence does not establish a proposition, do not present it as established.",
      "Return ONLY valid JSON with this exact shape:",
      '{"summary":"string","citationIds":["source-id"]}',
      "",
      `LEGAL RESEARCH QUERY:\n${input?.query || ""}`,
      "",
      `VERIFIED SOURCES:\n${sourceText}`,
      "",
      `VERIFIED EVIDENCE:\n${evidenceText}`,
      "",
      `VERIFIED CITATIONS:\n${citationText}`,
    ].join("\n");

    const response = await model.generateContent({
      contents,
    });

    const text =
      typeof response?.text === "string"
        ? response.text
        : typeof response?.response?.text === "function"
          ? response.response.text()
          : "";

    if (!text.trim()) {
      throw new Error(
        "Gemini legal synthesis returned an empty response.",
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(text.trim());
    } catch {
      throw new Error(
        "Gemini legal synthesis returned invalid JSON.",
      );
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.summary !== "string"
    ) {
      throw new Error(
        "Gemini legal synthesis returned an invalid result.",
      );
    }

    const citationIds = Array.isArray(parsed.citationIds)
      ? parsed.citationIds.filter(
          (citationId) =>
            typeof citationId === "string" &&
            verifiedSourceIds.has(citationId),
        )
      : [];

    return {
      summary: parsed.summary.trim(),
      citationIds,
    };
  };
}

module.exports = {
  createGeminiLegalSynthesisGenerator,
};
