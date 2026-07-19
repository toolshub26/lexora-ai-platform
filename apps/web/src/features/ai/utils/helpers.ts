import type { AIProvider } from "../types";

import { SUPPORTED_PROVIDERS } from "./constants";

export function isSupportedProvider(
  provider: string
): provider is AIProvider {
  return (SUPPORTED_PROVIDERS as readonly string[]).includes(provider);
}

export function generateChatId(): string {
  return crypto.randomUUID();
}

export function generateMessageId(): string {
  return crypto.randomUUID();
}

export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}

export function truncateText(
  text: string,
  maxLength: number
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
