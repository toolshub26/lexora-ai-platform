/**
 * Lexora AI Platform
 * Enterprise AI Core Types
 */

export type AIProvider =
  | "openai"
  | "gemini"
  | "claude"
  | "grok"
  | "deepseek";

export type AIModel =
  | "gpt-4.1"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-5"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "claude-4-sonnet"
  | "grok-4"
  | "deepseek-chat";

export type AIMessageRole =
  | "system"
  | "user"
  | "assistant";

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export interface AIRequest {
  provider: AIProvider;
  model: AIModel;
  messages: AIMessage[];

  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIResponse {
  id: string;

  provider: AIProvider;

  model: AIModel;

  text: string;

  usage: AIUsage;

  createdAt: string;
}

export interface AIProviderConfig {
  apiKey: string;

  model: AIModel;

  baseUrl?: string;

  timeout?: number;
}

export interface AIProviderClient {
  generate(
    request: AIRequest
  ): Promise<AIResponse>;
}
