import type { AIProvider } from "../types/provider";

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  enabled: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
}

export const AI_PROVIDERS: readonly ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    enabled: true,
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    enabled: true,
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    enabled: true,
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: "grok",
    name: "xAI Grok",
    enabled: true,
    supportsStreaming: true,
    supportsVision: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    enabled: true,
    supportsStreaming: true,
    supportsVision: false,
  },
] as const;
