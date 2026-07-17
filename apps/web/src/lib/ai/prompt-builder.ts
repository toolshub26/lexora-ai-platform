import type { AIMessage } from "./types";

export class PromptBuilder {
  private readonly messages: AIMessage[] = [];

  system(content: string): this {
    this.messages.push({
      role: "system",
      content,
    });

    return this;
  }

  user(content: string): this {
    this.messages.push({
      role: "user",
      content,
    });

    return this;
  }

  assistant(content: string): this {
    this.messages.push({
      role: "assistant",
      content,
    });

    return this;
  }

  build(): AIMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages.length = 0;
  }
}
