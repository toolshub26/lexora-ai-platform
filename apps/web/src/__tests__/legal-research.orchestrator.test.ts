import { describe, expect, it } from "vitest";
import type {
  LegalResearchOrchestrationResult,
  LegalResearchOrchestrator,
} from "../features/legal-research/orchestrator";
import { EmptyLegalSourceRetriever } from "../features/legal-research/retrieval";

describe("LegalResearchOrchestrator contract", () => {
  it("accepts a provider-neutral retriever dependency", () => {
    const retriever = new EmptyLegalSourceRetriever();

    const orchestrator: LegalResearchOrchestrator = {
      async execute() {
        const retrieval = await retriever.retrieve({
          query: {
            query: "Test legal research query",
            sources: ["cases"],
          },
        });

        const result: LegalResearchOrchestrationResult = {
          research: {
            query: "Test legal research query",
            sources: [],
            totalResults: 0,
            executionTimeMs: 0,
            completedAt: new Date(),
          },
          evidenceSet: {
            sources: [],
            evidence: [],
            verifications: [],
            citations: [],
          },
          retrieval,
          verification: {
            verifications: [],
            citations: [],
          },
        };

        return result;
      },
    };

    expect(orchestrator).toBeDefined();
  });

  it("returns the expected orchestration result shape", async () => {
    const retriever = new EmptyLegalSourceRetriever();

    const orchestrator: LegalResearchOrchestrator = {
      async execute() {
        const retrieval = await retriever.retrieve({
          query: {
            query: "What is a limitation period?",
            sources: ["cases", "statutes"],
          },
        });

        return {
          research: {
            query: "What is a limitation period?",
            sources: [],
            totalResults: 0,
            executionTimeMs: 0,
            completedAt: new Date(),
          },
          evidenceSet: {
            sources: [],
            evidence: [],
            verifications: [],
            citations: [],
          },
          retrieval,
          verification: {
            verifications: [],
            citations: [],
          },
        };
      },
    };

    const result = await orchestrator.execute({
      query: {
        query: "What is a limitation period?",
        sources: ["cases", "statutes"],
      },
    });

    expect(result.research.query).toBe("What is a limitation period?");
    expect(result.research.sources).toEqual([]);
    expect(result.evidenceSet.sources).toEqual([]);
    expect(result.evidenceSet.evidence).toEqual([]);
    expect(result.evidenceSet.verifications).toEqual([]);
    expect(result.evidenceSet.citations).toEqual([]);
    expect(result.retrieval.sources).toEqual([]);
    expect(result.retrieval.evidence).toEqual([]);
    expect(result.retrieval.researchSources).toEqual([]);
  });
});
