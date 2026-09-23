import type {
  LegalCitation,
  LegalEvidence,
  LegalResearchEvidenceSet,
  LegalSourceRecord,
  LegalSourceVerification,
} from "@/features/legal-research/sources";

describe("Legal Research evidence contract", () => {
  it("should represent a source, evidence, verification, and citation chain", () => {
    const source: LegalSourceRecord = {
      id: "source-1",
      title: "Example Legal Source",
      citation: "Example Citation",
      sourceType: "cases",
      authorityLevel: "primary",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
      authorityId: "IN:SC",
      authorityName: "Example Court",
      sourceUrl: "https://example.gov/source",
      canonicalUrl: "https://example.gov/source",
      availability: "available",
      retrievedAt: new Date(),
    };

    const evidence: LegalEvidence = {
      id: "evidence-1",
      sourceId: source.id,
      kind: "excerpt",
      excerpt: "Example verified source excerpt.",
      locator: "paragraph 12",
      paragraph: 12,
      retrievedAt: new Date(),
    };

    const verification: LegalSourceVerification = {
      sourceId: source.id,
      status: "verified",
      verifiedAt: new Date(),
      verifiedUrl: source.canonicalUrl,
      verifiedTitle: source.title,
      authorityConfirmed: true,
      jurisdictionConfirmed: true,
    };

    const citation: LegalCitation = {
      sourceId: source.id,
      evidenceId: evidence.id,
      citation: source.citation,
      locator: evidence.locator,
      verificationStatus: verification.status,
    };

    const evidenceSet: LegalResearchEvidenceSet = {
      sources: [source],
      evidence: [evidence],
      verifications: [verification],
      citations: [citation],
    };

    expect(evidenceSet.sources[0].id).toBe("source-1");
    expect(evidenceSet.evidence[0].sourceId).toBe(
      evidenceSet.sources[0].id,
    );
    expect(evidenceSet.verifications[0].sourceId).toBe(
      evidenceSet.sources[0].id,
    );
    expect(evidenceSet.citations[0].evidenceId).toBe(
      evidenceSet.evidence[0].id,
    );
    expect(evidenceSet.citations[0].verificationStatus).toBe(
      "verified",
    );
  });

  it("should support evidence that is based on metadata without an excerpt", () => {
    const evidence: LegalEvidence = {
      id: "metadata-1",
      sourceId: "source-1",
      kind: "metadata",
      excerpt: "",
      retrievedAt: new Date(),
    };

    expect(evidence.kind).toBe("metadata");
    expect(evidence.excerpt).toBe("");
  });
});
