export interface AIRequest<T = unknown> {
  provider: string;
  model: string;
  input: T;
}

export function createRequest<T>(
  provider: string,
  model: string,
  input: T
): AIRequest<T> {
  return {
    provider,
    model,
    input,
  };
}

export function validateRequest(request: AIRequest): boolean {
  return Boolean(
    request.provider &&
      request.model &&
      request.input !== undefined &&
      request.input !== null
  );
}
