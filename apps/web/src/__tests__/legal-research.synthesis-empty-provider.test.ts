import { describe, expect, it } from "vitest";
import {
  EmptyLegalSynthesisProvider,
  type LegalSynthesisInput,
} from "@/features/legal-research/synthesis";

describe("EmptyLegalSynthesisProvider", () => {
  it("should return a deterministic unavailable synthesis result", async () => {
    const provider = new EmptyLegalSynthesisProvider();

    const input: LegalSynthesisInput = {
      query: "Example legal research question",
      sources: [],
      evidence: [],
      verifications: [],
      citations: [],
    };

    const result = await provider.synthesize(input);

    expect(result.summary).toBe(
      "Legal synthesis is not available.",
    );
    expect(result.citationIds).toEqual([]);
  });
});
