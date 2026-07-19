export interface ParsedResponse {
  text: string;
  raw: unknown;
  metadata?: Record<string, unknown>;
}

export function parseResponse(raw: unknown): ParsedResponse {
  if (typeof raw === "string") {
    return {
      text: raw.trim(),
      raw,
    };
  }

  if (
    raw &&
    typeof raw === "object" &&
    "text" in raw &&
    typeof (raw as { text: unknown }).text === "string"
  ) {
    const response = raw as {
      text: string;
      metadata?: Record<string, unknown>;
    };

    return {
      text: response.text.trim(),
      raw,
      metadata: response.metadata,
    };
  }

  return {
    text: JSON.stringify(raw, null, 2),
    raw,
  };
}
