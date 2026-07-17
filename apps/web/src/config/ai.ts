/**
 * Lexora AI Platform
 * AI Configuration
 */

import type {
  AIProvider,
  AIModel,
  AIProviderConfig,
} from "../lib/ai";

export const DEFAULT_PROVIDER: AIProvider = "gemini";

export const DEFAULT_MODEL: AIModel = "gemini-2.5-pro";

export const AI_TIMEOUT = 30_000;

export const AI_MAX_RETRIES = 3;

export const GEMINI_CONFIG: AIProviderConfig = {
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "",
  model: "gemini-2.5-pro",
  timeout: AI_TIMEOUT,
};

export const OPENAI_CONFIG: AIProviderConfig = {
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
  model: "gpt-4.1",
  timeout: AI_TIMEOUT,
};

export const AI_CONFIG = {
  defaultProvider: DEFAULT_PROVIDER,
  defaultModel: DEFAULT_MODEL,
  retries: AI_MAX_RETRIES,
  timeout: AI_TIMEOUT,
  providers: {
    gemini: GEMINI_CONFIG,
    openai: OPENAI_CONFIG,
  },
} as const;
