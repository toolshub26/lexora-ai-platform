import type {
  LegalRetrievalRequest,
  LegalRetrievalResult,
  LegalSourceRetriever,
} from "./retrieval";
import type { LegalSourceRegistry } from "./sources";

export class RegistryLegalSourceRetriever
  implements LegalSourceRetriever
{
  private readonly registry: LegalSourceRegistry;

  constructor(registry: LegalSourceRegistry) {
    this.registry = registry;
  }

  async retrieve(
    request: LegalRetrievalRequest,
  ): Promise<LegalRetrievalResult> {
    const candidates = request.candidates ?? [];
    const sources = [];

    for (const candidate of candidates) {
      const source = this.registry.getById(candidate.id);

      if (!source) {
        throw new Error(
          `Legal source candidate "${candidate.id}" was not found in the source registry.`,
        );
      }

      sources.push(source);
    }

    return {
      sources,
      evidence: [],
      researchSources: [],
    };
  }
}
