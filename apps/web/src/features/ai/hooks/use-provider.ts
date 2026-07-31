"use client";

import { useCallback } from "react";
import { useAI } from "../context";
import type { AIProviderType } from "../types/provider";

export interface UseProviderResult {
  provider: AIProviderType;
  setProvider: (provider: AIProviderType) => void;
}

export function useProvider(): UseProviderResult {
  const { provider, setProvider } = useAI();

  const changeProvider = useCallback(
    (nextProvider: AIProviderType) => {
      setProvider(nextProvider);
    },
    [setProvider]
  );

  return {
    provider,
    setProvider: changeProvider,
  };
}

export default useProvider;
