export interface AIErrorOptions {
  cause?: unknown;
}

export class AIError extends Error {
  override readonly name = "AIError";
  readonly cause?: unknown;

  constructor(message: string, options: AIErrorOptions = {}) {
    super(message);

    this.cause = options.cause;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
