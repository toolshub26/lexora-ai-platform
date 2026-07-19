export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly requests = new Map<string, RateLimitRecord>();

  isAllowed(key: string, options: RateLimitOptions): boolean {
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

    current.count++;

    this.requests.set(key, current);

    return true;
  }

  getRemaining(key: string, options: RateLimitOptions): number {
    const current = this.requests.get(key);

    if (!current || current.resetAt <= Date.now()) {
      return options.maxRequests;
    }

    return Math.max(0, options.maxRequests - current.count);
  }

  getResetTime(key: string): number | null {
    return this.requests.get(key)?.resetAt ?? null;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  clear(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();
