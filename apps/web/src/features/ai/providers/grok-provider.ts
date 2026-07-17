import { buildPrompt, parseResponse } from "../lib";

export interface GrokRequest {
  instruction: string;
  context?: string;
  system?: string;
}

export class GrokProvider {
  async generate(request: GrokRequest): Promise<string> {
    const prompt = buildPrompt({
      instruction: request.instruction,
      context: request.context,
      system: request.system,
    });

    const result = {
      text: `Grok response: ${prompt}`,
    };

    return parseResponse(result).text;
  }
}

export const grokProvider = new GrokProvider();
