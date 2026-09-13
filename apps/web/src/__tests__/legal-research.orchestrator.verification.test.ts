import { describe, expect, it } from "vitest";
import { DefaultLegalResearchOrchestrator } from "../features/legal-research/orchestrator";
import { EmptyLegalSourceRetriever } from "../features/legal-research/retrieval";
import { EmptyLegalSourceVerifier } from "../features/legal-research/verification";

describe("DefaultLegalResearchOrchestrator verification integration", () => {
  it("preserves verifier results in the final evidence set", async () => {
    const orchestrator = new DefaultLegalResearchOrchestrator({
      retriever: new EmptyLegalSourceRetriever(),
      verifier: new EmptyLegalSourceVerifier(),
    });

    const result = await orchestrator.execute({
      query: {
        query: "Test verification flow",
        sources: ["cases"],
      },
    });

    expect(result.verification.verifications).toEqual([]);
    expect(result.verification.citations).toEqual([]);

    expect(result.evidenceSet.verifications).toEqual([]);
    expect(result.evidenceSet.citations).toEqual([]);
  });

  it("does not mark empty retrieval results as verified", async () => {
    const orchestrator = new DefaultLegalResearchOrchestrator({
      retriever: new EmptyLegalSourceRetriever(),
      verifier: new EmptyLegalSourceVerifier(),
    });

    const result = await orchestrator.execute({
      query: {
        query: "No source query",
        sources: ["statutes"],
      },
    });

    expect(
      result.evidenceSet.verifications.some(
        (verification) => verification.status === "verified",
      ),
    ).toBe(false);
  });
});
