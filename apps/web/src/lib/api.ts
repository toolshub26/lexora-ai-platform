export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
