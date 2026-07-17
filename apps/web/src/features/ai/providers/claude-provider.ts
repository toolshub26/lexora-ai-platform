import { buildPrompt, parseResponse } from "../lib";

export interface ClaudeRequest {
  instruction: string;
  context?: string;
  system?: string;
}

export class ClaudeProvider {
  async generate(request: ClaudeRequest): Promise<string> {
    const prompt = buildPrompt({
      instruction: request.instruction,
      context: request.context,
      system: request.system,
    });

    const result = {
      text: `Claude response: ${prompt}`,
    };

    return parseResponse(result).text;
  }
}

export const claudeProvider = new ClaudeProvider();
