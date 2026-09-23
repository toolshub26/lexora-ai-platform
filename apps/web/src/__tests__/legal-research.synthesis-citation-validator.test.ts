import { describe, expect, it } from "vitest";
import type {
  LegalCitation,
} from "@/features/legal-research/sources";
import {
  validateLegalSynthesisCitations,
} from "@/features/legal-research/synthesis";

describe("validateLegalSynthesisCitations", () => {
  const verifiedCitations: LegalCitation[] = [
    {
      sourceId: "source-verified-1",
      evidenceId: "evidence-verified-1",
      citation: "Verified Citation",
      verificationStatus: "verified",
    },
  ];

  it("should accept citation IDs backed by verified citations", () => {
    expect(
      validateLegalSynthesisCitations(
        ["source-verified-1"],
        verifiedCitations,
      ),
    ).toEqual([]);
  });

  it("should reject citation IDs not backed by verified citations", () => {
    expect(
      validateLegalSynthesisCitations(
        [
          "source-verified-1",
          "fabricated-source-1",
        ],
        verifiedCitations,
      ),
    ).toEqual(["fabricated-source-1"]);
  });

  it("should reject citations whose verification status is not verified", () => {
    const citations: LegalCitation[] = [
      {
        sourceId: "source-unverified-1",
        citation: "Unverified Citation",
        verificationStatus: "unverified",
      },
    ];

    expect(
      validateLegalSynthesisCitations(
        ["source-unverified-1"],
        citations,
      ),
    ).toEqual(["source-unverified-1"]);
  });
});
