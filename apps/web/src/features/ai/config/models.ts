import type { AIProvider } from "../types/provider";

export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  enabled: boolean;
  contextWindow: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
}

export const AI_MODELS: readonly ModelConfig[] = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    enabled: true,
    contextWindow: 128000,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    enabled: true,
    contextWindow: 128000,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "gemini",
    enabled: true,
    contextWindow: 1000000,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "claude",
    enabled: true,
    contextWindow: 200000,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: "grok-4",
    name: "Grok 4",
    provider: "grok",
    enabled: true,
    contextWindow: 256000,
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    enabled: true,
    contextWindow: 64000,
    supportsVision: false,
    supportsStreaming: true,
  },
] as const;
