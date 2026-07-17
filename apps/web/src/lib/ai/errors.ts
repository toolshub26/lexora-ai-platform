/**
 * Lexora AI Platform
 * AI Error Classes
 */

export class AIError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "AIError";
  }
}

export class AIProviderError extends AIError {
  constructor(provider: string, message: string) {
    super(`[${provider}] ${message}`);

    this.name = "AIProviderError";
  }
}

export class AIConfigurationError extends AIError {
  constructor(message: string) {
    super(message);

    this.name = "AIConfigurationError";
  }
}

export class AIRateLimitError extends AIError {
  constructor(message = "AI rate limit exceeded.") {
    super(message);

    this.name = "AIRateLimitError";
  }
}

export class AIRequestError extends AIError {
  constructor(message: string) {
    super(message);

    this.name = "AIRequestError";
  }
}
