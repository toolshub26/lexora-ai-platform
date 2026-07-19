
"use client";

import { useAI } from "../context/ai-context";

import type {
  AIRequest,
  AIResponse,
} from "../lib/ai";

export function useAISession() {

  const {
    loading,
    response,
    error,
    generate,
    clear,
  } = useAI();

  async function ask(
    request: AIRequest,
  ): Promise<AIResponse | null> {

    return generate(request);
  }

  return {
    loading,
    response,
    error,
    ask,
    clear,
  };
}

export default useAISession;
