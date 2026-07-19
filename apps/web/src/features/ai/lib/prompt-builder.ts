export interface PromptOptions {
  system?: string;
  context?: string;
  instruction: string;
  examples?: string[];
}

export function buildPrompt(options: PromptOptions): string {
  const sections: string[] = [];

  if (options.system?.trim()) {
    sections.push(`# System\n${options.system.trim()}`);
  }

  if (options.context?.trim()) {
    sections.push(`# Context\n${options.context.trim()}`);
  }

  if (options.examples?.length) {
    sections.push(`# Examples\n${options.examples.join("\n\n")}`);
  }

  sections.push(`# Instruction\n${options.instruction.trim()}`);

  return sections.join("\n\n");
}
