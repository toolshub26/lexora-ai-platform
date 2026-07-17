import { buildPrompt, parseResponse } from "../lib";

export interface DeepSeekRequest {
  instruction: string;
  context?: string;
  system?: string;
}

export class DeepSeekProvider {
  async generate(request: DeepSeekRequest): Promise<string> {
    const prompt = buildPrompt({
      instruction: request.instruction,
      context: request.context,
      system: request.system,
    });

    const result = {
      text: `DeepSeek response: ${prompt}`,
    };

    return parseResponse(result).text;
  }
}

export const deepSeekProvider = new DeepSeekProvider();
