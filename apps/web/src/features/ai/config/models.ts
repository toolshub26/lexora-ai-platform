import type { AIProvider } from "../types/provider";

export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
}

export const AI_MODELS: ModelConfig[] = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "gemini",
  },
  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "claude",
  },
  {
    id: "grok-4",
    name: "Grok 4",
    provider: "grok",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
  },
];
