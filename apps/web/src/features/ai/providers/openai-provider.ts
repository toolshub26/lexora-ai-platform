import { buildPrompt } from "../lib";
import { parseResponse } from "../lib";

export interface OpenAIRequest {
  instruction: string;
  context?: string;
  system?: string;
}

export class OpenAIProvider {
  async generate(request: OpenAIRequest): Promise<string> {
    const prompt = buildPrompt({
      instruction: request.instruction,
      context: request.context,
      system: request.system,
    });

    const result = {
      text: `OpenAI response: ${prompt}`,
    };

    return parseResponse(result).text;
  }
}

export const openAIProvider = new OpenAIProvider();
