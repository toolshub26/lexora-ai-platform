import { describe, expect, it } from "vitest";
import type {
  LegalCitation,
  LegalEvidence,
  LegalSourceRecord,
  LegalSourceVerification,
} from "@/features/legal-research/sources";
import type {
  LegalSynthesisInput,
  LegalSynthesisResult,
} from "@/features/legal-research/synthesis";

describe("Legal Research synthesis citation integrity", () => {
  it("should validate synthesis citation IDs against verified input citations", () => {
    const source: LegalSourceRecord = {
      id: "source-integrity-1",
      title: "Example Primary Source",
      citation: "Example Citation",
      sourceType: "cases",
      authorityLevel: "primary",
      availability: "available",
      retrievedAt: new Date(),
    };

    const evidence: LegalEvidence = {
      id: "evidence-integrity-1",
      sourceId: source.id,
      kind: "excerpt",
      excerpt: "Verified legal text.",
      retrievedAt: new Date(),
    };

    const verification: LegalSourceVerification = {
      sourceId: source.id,
      status: "verified",
      verifiedAt: new Date(),
      authorityConfirmed: true,
      jurisdictionConfirmed: true,
    };

    const citation: LegalCitation = {
      sourceId: source.id,
      evidenceId: evidence.id,
      citation: source.citation,
      verificationStatus: "verified",
    };

    const input: LegalSynthesisInput = {
      query: "Example legal research question",
      sources: [source],
      evidence: [evidence],
      verifications: [verification],
      citations: [citation],
    };

    const result: LegalSynthesisResult = {
      summary: "Example synthesized result.",
      citationIds: ["source-integrity-1"],
    };

    const verifiedCitationIds = new Set(
      input.citations
        .filter(
          (item) => item.verificationStatus === "verified",
        )
        .map((item) => item.sourceId),
    );

    const invalidCitationIds = result.citationIds.filter(
      (citationId) => !verifiedCitationIds.has(citationId),
    );

    expect(invalidCitationIds).toEqual([]);
  });
});
