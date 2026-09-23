import { describe, expect, it } from "vitest";
import type {
  LegalSynthesisInput,
  LegalSynthesisProvider,
  LegalSynthesisResult,
} from "@/features/legal-research/synthesis";

describe("Legal Research synthesis provider", () => {
  it("should define a provider-neutral synthesis contract", async () => {
    const provider: LegalSynthesisProvider = {
      async synthesize(
        input: LegalSynthesisInput,
      ): Promise<LegalSynthesisResult> {
        return {
          summary: `Synthesized: ${input.query}`,
          citationIds: input.citations.map(
            (citation) => citation.sourceId,
          ),
        };
      },
    };

    const result = await provider.synthesize({
      query: "Example legal research question",
      sources: [],
      evidence: [],
      verifications: [],
      citations: [
        {
          sourceId: "source-provider-1",
          citation: "Example Citation",
          verificationStatus: "verified",
        },
      ],
    });

    expect(result.summary).toContain(
      "Example legal research question",
    );
    expect(result.citationIds).toEqual(["source-provider-1"]);
  });
});
