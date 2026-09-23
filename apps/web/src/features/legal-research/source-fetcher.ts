export interface LegalSourceFetchRequest {
  url: string;
}

export interface LegalSourceFetchResponse {
  status: number;
  contentType: string;
  finalUrl: string;
  body: string;
}

export type LegalSourceFetchTransport = (
  request: LegalSourceFetchRequest,
) => Promise<LegalSourceFetchResponse>;

export interface LegalSourceFetcher {
  fetch(
    request: LegalSourceFetchRequest,
  ): Promise<LegalSourceFetchResponse>;
}

export class InMemoryLegalSourceFetcher
  implements LegalSourceFetcher
{
  private readonly transport: LegalSourceFetchTransport;

  constructor(
    transport: LegalSourceFetchTransport,
  ) {
    this.transport = transport;
  }

  async fetch(
    request: LegalSourceFetchRequest,
  ): Promise<LegalSourceFetchResponse> {
    return this.transport(request);
  }
}
