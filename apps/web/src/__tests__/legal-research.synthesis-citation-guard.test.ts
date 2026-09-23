import { describe, expect, it } from "vitest";
import type {
  LegalCitation,
} from "@/features/legal-research/sources";
import type {
  LegalSynthesisResult,
} from "@/features/legal-research/synthesis";

describe("Legal Research synthesis citation guard", () => {
  it("should reject citation IDs that are not verified input citations", () => {
    const verifiedCitations: LegalCitation[] = [
      {
        sourceId: "source-verified-1",
        evidenceId: "evidence-verified-1",
        citation: "Verified Citation",
        verificationStatus: "verified",
      },
    ];

    const result: LegalSynthesisResult = {
      summary: "Example synthesis.",
      citationIds: [
        "source-verified-1",
        "fabricated-source-1",
      ],
    };

    const verifiedCitationIds = new Set(
      verifiedCitations
        .filter(
          (citation) => citation.verificationStatus === "verified",
        )
        .map((citation) => citation.sourceId),
    );

    const invalidCitationIds = result.citationIds.filter(
      (citationId) => !verifiedCitationIds.has(citationId),
    );

    expect(invalidCitationIds).toEqual([
      "fabricated-source-1",
    ]);
  });
});
