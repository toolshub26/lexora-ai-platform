import { modelService } from "./model-service";
import { chatService } from "./chat-service";

export class AIService {
  setProvider(provider: Parameters<typeof modelService.setProvider>[0]) {
    modelService.setProvider(provider);
  }

  getProvider() {
    return modelService.getProvider();
  }

  getModels() {
    return modelService.getAvailableModels();
  }

  async sendMessage(message: string) {
    return chatService.sendMessage(message);
  }
}

export const aiService = new AIService();
