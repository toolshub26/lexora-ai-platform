export interface APIClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class APIClient {
  constructor(private options: APIClientOptions = {}) {}

  async request<T>(
    endpoint: string,
    init: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(
      `${this.options.baseUrl ?? ""}${endpoint}`,
      {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...this.options.headers,
          ...(init.headers ?? {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export const apiClient = new APIClient();
