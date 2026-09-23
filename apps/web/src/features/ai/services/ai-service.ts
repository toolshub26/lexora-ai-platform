import { getFunctions, httpsCallable } from "firebase/functions";

import { firebaseApp } from "@/lib/firebase";
import type { AIModel, AIProvider, AIRequest, AIResponse } from "@/lib/ai";
import { modelService } from "@/features/ai/services/model-service";

const functions = getFunctions(firebaseApp);

interface AskAIRequest {
  prompt: string;
  provider?: string;
  model?: string;
  organizationId?: string;
}

interface AskAIResponse {
  success: boolean;
  provider?: string;
  model?: string;
  message?: string;
  response: string;
  error?: string | null;
  timestamp?: number;
}

function normalizeProvider(provider?: string): AIProvider {
  switch (provider) {
    case "openai":
    case "gemini":
    case "claude":
    case "grok":
    case "deepseek":
      return provider;
    case "google":
    default:
      return "gemini";
  }
}

function normalizeModel(model?: string): AIModel {
  switch (model) {
    case "gpt-4.1":
    case "gpt-4o":
    case "gpt-4o-mini":
    case "gpt-5":
    case "gemini-2.5-pro":
    case "gemini-2.5-flash":
    case "claude-4-sonnet":
    case "grok-4":
    case "deepseek-chat":
      return model;
    default:
      return "gemini-2.5-flash";
  }
}

export class AIService {
  async sendMessage(
    message: string,
    organizationId?: string,
  ): Promise<{
    success: boolean;
    response: string;
    error: string | null;
  }> {
    const callable = httpsCallable<AskAIRequest, AskAIResponse>(
      functions,
      "askAI",
    );

    try {
      const result = await callable({
        prompt: message,
        ...(organizationId ? { organizationId } : {}),
      });

      if (!result.data.success) {
        return {
          success: false,
          response: "",
          error: result.data.error ?? "AI service error.",
        };
      }

      return {
        success: true,
        response: result.data.response,
        error: null,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "AI service request failed.";

      return {
        success: false,
        response: "",
        error: message,
      };
    }
  }

  async generate(
    request: AIRequest,
    organizationId?: string,
  ): Promise<AIResponse | null> {
    try {
      const { provider, model, messages } = request;

      const prompt =
        messages.length > 0
          ? messages
              .map(
                (message) =>
                  `${message.role}: ${message.content.replace(/\n/g, " ")}`,
              )
              .join("\n\n")
          : "";

      const callable = httpsCallable<AskAIRequest, AskAIResponse>(
        functions,
        "askAI",
      );

      const result = await callable({
        prompt,
        provider,
        model,
        ...(organizationId ? { organizationId } : {}),
      });

      if (!result.data.success || !result.data.response) {
        return null;
      }

      const usage: AIResponse["usage"] = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };

      return {
        id: crypto.randomUUID(),
        provider: normalizeProvider(result.data.provider ?? provider),
        model: normalizeModel(result.data.model ?? model),
        text: result.data.response,
        usage,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("AI generate error:", error);
      return null;
    }
  }

  setProvider(provider: Parameters<typeof modelService.setProvider>[0]) {
    modelService.setProvider(provider);
  }

  getProvider() {
    return modelService.getProvider();
  }

  getModels() {
    return modelService.getAvailableModels();
  }
}

export const aiService = new AIService();
