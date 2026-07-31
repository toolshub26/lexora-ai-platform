import { AIError } from "./ai-error";

export class ProviderError extends AIError {
  readonly provider: string;

  constructor(
    provider: string,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);

    this.provider = provider;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
