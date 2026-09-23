import { describe, expect, it } from "vitest";
import type {
  LegalCitation,
  LegalEvidence,
  LegalSourceRecord,
  LegalSourceVerification,
} from "@/features/legal-research/sources";

describe("Legal Research synthesis contract", () => {
  it("should represent verified evidence as the input to AI synthesis", () => {
    const source: LegalSourceRecord = {
      id: "source-synthesis-1",
      title: "Example Primary Source",
      citation: "Example Citation",
      sourceType: "cases",
      authorityLevel: "primary",
      availability: "available",
      retrievedAt: new Date(),
    };

    const evidence: LegalEvidence = {
      id: "evidence-synthesis-1",
      sourceId: source.id,
      kind: "excerpt",
      excerpt: "Example verified legal text.",
      locator: "paragraph-1",
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

    const input = {
      sources: [source],
      evidence: [evidence],
      verifications: [verification],
      citations: [citation],
    };

    expect(input.sources).toHaveLength(1);
    expect(input.evidence[0].sourceId).toBe(source.id);
    expect(input.verifications[0].status).toBe("verified");
    expect(input.citations[0].evidenceId).toBe(evidence.id);
    expect(input.citations[0].verificationStatus).toBe("verified");
  });
});
