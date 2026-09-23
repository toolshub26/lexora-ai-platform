import { describe, expect, it } from "vitest";
import type { LegalSynthesisResult } from "@/features/legal-research/synthesis";

describe("Legal Research synthesis result", () => {
  it("should represent synthesized research with explicit citation references", () => {
    const result: LegalSynthesisResult = {
      summary: "Example synthesized legal research summary.",
      citationIds: ["citation-1"],
    };

    expect(result.summary).toBe(
      "Example synthesized legal research summary.",
    );
    expect(result.citationIds).toEqual(["citation-1"]);
  });
});
