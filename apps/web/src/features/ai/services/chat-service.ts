import { modelService } from "./model-service";
import { openAIProvider } from "../providers/openai-provider";
import { geminiProvider } from "../providers/gemini-provider";
import { claudeProvider } from "../providers/claude-provider";
import { grokProvider } from "../providers/grok-provider";
import { deepSeekProvider } from "../providers/deepseek-provider";

export class ChatService {
  async sendMessage(message: string): Promise<string> {
    const provider = modelService.getProvider();

    switch (provider) {
      case "openai":
        return openAIProvider.generate({
          instruction: message,
          context: "",
          system: "",
        });

      case "gemini":
        return geminiProvider.generate({
          instruction: message,
          context: "",
          system: "",
        });

      case "claude":
        return claudeProvider.generate({
          instruction: message,
          context: "",
          system: "",
        });

      case "grok":
        return grokProvider.generate({
          instruction: message,
          context: "",
          system: "",
        });

      case "deepseek":
        return deepSeekProvider.generate({
          instruction: message,
          context: "",
          system: "",
        });

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}

export const chatService = new ChatService();
