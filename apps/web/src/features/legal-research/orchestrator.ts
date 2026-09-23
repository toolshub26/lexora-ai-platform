import type {
  LegalResearchQuery,
  LegalResearchResult,
} from "./types";
import type {
  LegalSourceDiscoveryProvider,
} from "./discovery";
import type { LegalResearchEvidenceSet } from "./sources";
import type {
  LegalRetrievalResult,
  LegalSourceRetriever,
} from "./retrieval";
import type {
  LegalSourceVerifier,
  LegalVerificationResult,
} from "./verification";
import {
  validateLegalSynthesisCitations,
} from "./synthesis";
import type {
  LegalSynthesisProvider,
  LegalSynthesisResult,
} from "./synthesis";

export interface LegalResearchOrchestrationRequest {
  query: LegalResearchQuery;
}

export interface LegalResearchOrchestrationDependencies {
  discovery?: LegalSourceDiscoveryProvider;
  retriever: LegalSourceRetriever;
  verifier: LegalSourceVerifier;
  synthesis?: LegalSynthesisProvider;
}

export interface LegalResearchOrchestrationResult {
  research: LegalResearchResult;
  evidenceSet: LegalResearchEvidenceSet;
  retrieval: LegalRetrievalResult;
  verification: LegalVerificationResult;
  synthesis?: LegalSynthesisResult;
}

export interface LegalResearchOrchestrator {
  execute(
    request: LegalResearchOrchestrationRequest,
  ): Promise<LegalResearchOrchestrationResult>;
}

export class DefaultLegalResearchOrchestrator
  implements LegalResearchOrchestrator
{
  private readonly discovery?: LegalSourceDiscoveryProvider;
  private readonly retriever: LegalSourceRetriever;
  private readonly verifier: LegalSourceVerifier;
  private readonly synthesis?: LegalSynthesisProvider;

  constructor(
    dependencies: LegalResearchOrchestrationDependencies,
  ) {
    this.discovery = dependencies.discovery;
    this.retriever = dependencies.retriever;
    this.verifier = dependencies.verifier;
    this.synthesis = dependencies.synthesis;
  }

  async execute(
    request: LegalResearchOrchestrationRequest,
  ): Promise<LegalResearchOrchestrationResult> {
    const startedAt = Date.now();

    const discovery = this.discovery
      ? await this.discovery.discover({
          query: request.query,
        })
      : undefined;

    const discoveredCandidates = discovery?.candidates ?? [];
    const seenCandidateIds = new Set<string>();

    const candidates = discoveredCandidates.filter((candidate) => {
      if (seenCandidateIds.has(candidate.id)) {
        return false;
      }

      seenCandidateIds.add(candidate.id);
      return true;
    });

    const retrieval = await this.retriever.retrieve({
      query: request.query,
      candidates: discovery
        ? candidates
        : undefined,
    });

    const verification = await this.verifier.verify({
      sources: retrieval.sources,
      evidence: retrieval.evidence,
      citations: retrieval.citations ?? [],
    });

    const synthesis = this.synthesis
      ? await this.synthesis.synthesize({
          query: request.query.query,
          sources: retrieval.sources,
          evidence: retrieval.evidence,
          verifications: verification.verifications,
          citations: verification.citations,
        })
      : undefined;

    if (synthesis) {
      const invalidCitationIds =
        validateLegalSynthesisCitations(
          synthesis.citationIds,
          verification.citations,
        );

      if (invalidCitationIds.length > 0) {
        throw new Error(
                    "Legal synthesis returned invalid citation IDs: " + invalidCitationIds.join(", "),
        );
      }
    }

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
      citations: verification.citations,
    };

    return {
      research,
      evidenceSet,
      retrieval,
      verification,
      synthesis,
    };
  }
}
