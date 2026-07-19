"use client";

import { useCallback } from "react";

import { useAI } from "../context";
import type { AIProvider } from "../types/provider";

export function useProvider() {
  const { provider, setProvider } = useAI();

  const changeProvider = useCallback(
    (nextProvider: AIProvider) => {
      setProvider(nextProvider);
    },
    [setProvider]
  );

  return {
    provider,
    setProvider: changeProvider,
  };
}
