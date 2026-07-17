import { AIProvider } from "../types";

export function isSupportedProvider(
  provider: string
): provider is AIProvider {
  return [
    "openai",
    "gemini",
    "claude",
    "grok",
    "deepseek",
  ].includes(provider);
}

export function generateChatId(): string {
  return crypto.randomUUID();
}
