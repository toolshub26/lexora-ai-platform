import type {
  LegalSourceCandidate,
  LegalSourceDiscoveryProvider,
  LegalSourceDiscoveryRequest,
  LegalSourceDiscoveryResult,
} from "./discovery";
import type { LegalSourceRegistry } from "./sources";

export class RegistryLegalSourceDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  private readonly registry: LegalSourceRegistry;

  constructor(registry: LegalSourceRegistry) {
    this.registry = registry;
  }

  async discover(
    request: LegalSourceDiscoveryRequest,
  ): Promise<LegalSourceDiscoveryResult> {
    const requestedSourceTypes = new Set(
      request.query.sources,
    );

    const sources = request.query.jurisdiction
      ? this.registry.getByJurisdiction(
          request.query.jurisdiction,
        )
      : request.query.sources.flatMap((sourceType) =>
          this.registry.getByType(sourceType),
        );

    const candidates: LegalSourceCandidate[] = sources
      .filter((source) =>
        requestedSourceTypes.has(source.sourceType),
      )
      .map((source) => ({
        id: source.id,
        title: source.title,
        sourceType: source.sourceType,
        jurisdiction: source.jurisdiction,
        authorityId: source.authorityId,
        authorityName: source.authorityName,
        sourceUrl: source.sourceUrl,
        citation: source.citation,
      }));

    return { candidates };
  }
}
