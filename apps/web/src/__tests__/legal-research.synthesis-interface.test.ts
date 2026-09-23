import { describe, expect, it } from "vitest";
import type {
  LegalCitation,
  LegalEvidence,
  LegalSourceRecord,
  LegalSourceVerification,
} from "@/features/legal-research/sources";
import type { LegalSynthesisInput } from "@/features/legal-research/synthesis";

describe("Legal Research synthesis interface", () => {
  it("should accept only the verified evidence set required for synthesis", () => {
    const source: LegalSourceRecord = {
      id: "source-interface-1",
      title: "Example Primary Source",
      citation: "Example Citation",
      sourceType: "cases",
      authorityLevel: "primary",
      availability: "available",
      retrievedAt: new Date(),
    };

    const evidence: LegalEvidence = {
      id: "evidence-interface-1",
      sourceId: source.id,
      kind: "excerpt",
      excerpt: "Example verified legal text.",
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

    expect(input.query).toBe("Example legal research question");
    expect(input.sources).toHaveLength(1);
    expect(input.evidence).toHaveLength(1);
    expect(input.verifications).toHaveLength(1);
    expect(input.citations).toHaveLength(1);
  });
});
