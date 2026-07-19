export const DEFAULT_PROVIDER = "openai";

export const SUPPORTED_PROVIDERS = [
  "openai",
  "gemini",
  "claude",
  "grok",
  "deepseek",
] as const;

export const DEFAULT_MODEL = "gpt-4.1";

export const DEFAULT_TEMPERATURE = 0.7;

export const MAX_CHAT_MESSAGES = 100;

export const MAX_PROMPT_LENGTH = 32000;

export const REQUEST_TIMEOUT = 60_000;

export const AI_CACHE_TTL = 5 * 60 * 1000;

export const AI_RETRY_LIMIT = 3;
