import { describe, expect, it } from "vitest";
import {
  EmptyLegalSourceVerifier,
  type LegalVerificationRequest,
} from "../features/legal-research/verification";

describe("EmptyLegalSourceVerifier", () => {
  it("marks every supplied source as unverified", async () => {
    const verifier = new EmptyLegalSourceVerifier();

    const request: LegalVerificationRequest = {
      sources: [
        {
          id: "source-1",
          title: "Example Case",
          citation: "Example Citation",
          sourceType: "cases",
          authorityLevel: "primary",
          availability: "available",
          retrievedAt: new Date(),
        },
        {
          id: "source-2",
          title: "Example Statute",
          citation: "Example Statute Citation",
          sourceType: "statutes",
          authorityLevel: "primary",
          availability: "available",
          retrievedAt: new Date(),
        },
      ],
      evidence: [],
      citations: [],
    };

    const result = await verifier.verify(request);

    expect(result.verifications).toHaveLength(2);
    expect(result.verifications).toEqual([
      {
        sourceId: "source-1",
        status: "unverified",
        authorityConfirmed: false,
        jurisdictionConfirmed: false,
      },
      {
        sourceId: "source-2",
        status: "unverified",
        authorityConfirmed: false,
        jurisdictionConfirmed: false,
      },
    ]);
  });

  it("preserves citations while forcing their verification status to unverified", async () => {
    const verifier = new EmptyLegalSourceVerifier();

    const result = await verifier.verify({
      sources: [],
      evidence: [],
      citations: [
        {
          sourceId: "source-1",
          evidenceId: "evidence-1",
          citation: "Example Citation",
          locator: "section 1",
          verificationStatus: "verified",
        },
      ],
    });

    expect(result.citations).toEqual([
      {
        sourceId: "source-1",
        evidenceId: "evidence-1",
        citation: "Example Citation",
        locator: "section 1",
        verificationStatus: "unverified",
      },
    ]);
  });
});
