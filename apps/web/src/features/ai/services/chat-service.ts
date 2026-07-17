import { aiService } from "./ai-service";

export class ChatService {
  async sendMessage(message: string): Promise<string> {
    return aiService.generateResponse(message);
  }
}

export const chatService = new ChatService();
