import { buildPrompt, parseResponse } from "../lib";

export interface GeminiRequest {
  instruction: string;
  context?: string;
  system?: string;
}

export class GeminiProvider {
  async generate(request: GeminiRequest): Promise<string> {
    const prompt = buildPrompt({
      instruction: request.instruction,
      context: request.context,
      system: request.system,
    });

    const result = {
      text: `Gemini response: ${prompt}`,
    };

    return parseResponse(result).text;
  }
}

export const geminiProvider = new GeminiProvider();
