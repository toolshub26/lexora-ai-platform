export interface ParsedResponse {
  text: string;
  raw: unknown;
}

export function parseResponse(raw: unknown): ParsedResponse {
  if (typeof raw === "string") {
    return {
      text: raw,
      raw,
    };
  }

  if (
    raw &&
    typeof raw === "object" &&
    "text" in raw &&
    typeof (raw as { text: unknown }).text === "string"
  ) {
    return {
      text: (raw as { text: string }).text,
      raw,
    };
  }

  return {
    text: JSON.stringify(raw, null, 2),
    raw,
  };
}
