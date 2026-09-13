import type {
  LegalResearchQuery,
  LegalResearchResult,
} from "./types";
import type { LegalResearchEvidenceSet } from "./sources";
import type {
  LegalRetrievalResult,
  LegalSourceRetriever,
} from "./retrieval";
import type {
  LegalSourceVerifier,
  LegalVerificationResult,
} from "./verification";

export interface LegalResearchOrchestrationRequest {
  query: LegalResearchQuery;
}

export interface LegalResearchOrchestrationDependencies {
  retriever: LegalSourceRetriever;
  verifier: LegalSourceVerifier;
}

export interface LegalResearchOrchestrationResult {
  research: LegalResearchResult;
  evidenceSet: LegalResearchEvidenceSet;
  retrieval: LegalRetrievalResult;
  verification: LegalVerificationResult;
}

export interface LegalResearchOrchestrator {
  execute(
    request: LegalResearchOrchestrationRequest,
  ): Promise<LegalResearchOrchestrationResult>;
}

export class DefaultLegalResearchOrchestrator
  implements LegalResearchOrchestrator
{
  private readonly retriever: LegalSourceRetriever;
  private readonly verifier: LegalSourceVerifier;

  constructor(
    dependencies: LegalResearchOrchestrationDependencies,
  ) {
    this.retriever = dependencies.retriever;
    this.verifier = dependencies.verifier;
  }

  async execute(
    request: LegalResearchOrchestrationRequest,
  ): Promise<LegalResearchOrchestrationResult> {
    const startedAt = Date.now();

    const retrieval = await this.retriever.retrieve({
      query: request.query,
    });

    const verification = await this.verifier.verify({
      sources: retrieval.sources,
      evidence: retrieval.evidence,
      citations: [],
    });

    const completedAt = new Date();

    const evidenceSet: LegalResearchEvidenceSet = {
      sources: retrieval.sources,
      evidence: retrieval.evidence,
      verifications: verification.verifications,
      citations: verification.citations,
    };

    const verificationBySourceId = new Map(
      verification.verifications.map((item) => [
        item.sourceId,
        item.status,
      ]),
    );

    const researchSources = retrieval.researchSources.map((source) => ({
      ...source,
      verificationStatus:
        verificationBySourceId.get(source.id) ?? "unverified",
    }));

    const research: LegalResearchResult = {
      query: request.query.query,
      sources: researchSources,
      totalResults: researchSources.length,
      executionTimeMs: Date.now() - startedAt,
      completedAt,
    };

    return {
      research,
      evidenceSet,
      retrieval,
      verification,
    };
  }
}
