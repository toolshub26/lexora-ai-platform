export class AIService {
  async generateResponse(prompt: string): Promise<string> {
    return `AI response: ${prompt}`;
  }
}

export const aiService = new AIService();
