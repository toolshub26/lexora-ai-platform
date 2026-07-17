export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private readonly requests = new Map<
    string,
    {
      count: number;
      resetAt: number;
    }
  >();

  isAllowed(
    key: string,
    options: RateLimitOptions
  ): boolean {
    const now = Date.now();

    const current = this.requests.get(key);

    if (!current || current.resetAt <= now) {
      this.requests.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });

      return true;
    }

    if (current.count >= options.maxRequests) {
      return false;
    }

    current.count += 1;

    this.requests.set(key, current);

    return true;
  }

  clear(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();
