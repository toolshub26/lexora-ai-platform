import type { AIProvider } from "../types/provider";

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  enabled: boolean;
}

export const AI_PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    enabled: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    enabled: true,
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    enabled: true,
  },
  {
    id: "grok",
    name: "xAI Grok",
    enabled: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    enabled: true,
  },
];
