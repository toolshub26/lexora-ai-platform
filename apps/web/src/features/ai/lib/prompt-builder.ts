export interface PromptOptions {
  system?: string;
  context?: string;
  instruction: string;
}

export function buildPrompt(options: PromptOptions): string {
  const sections: string[] = [];

  if (options.system) {
    sections.push(`System:\n${options.system}`);
  }

  if (options.context) {
    sections.push(`Context:\n${options.context}`);
  }

  sections.push(`Instruction:\n${options.instruction}`);

  return sections.join("\n\n");
}
