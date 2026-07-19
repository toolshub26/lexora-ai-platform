
"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import {
  AIRequest,
  AIResponse,
} from "../lib/ai";

import aiService from "../services/ai.service";

interface AIContextValue {
  loading: boolean;
  response: AIResponse | null;
  error: string | null;

  generate(
    request: AIRequest,
  ): Promise<AIResponse | null>;

  clear(): void;
}

const AIContext =
  createContext<
    AIContextValue | undefined
  >(undefined);

export function AIProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [loading, setLoading] =
    useState(false);

  const [response, setResponse] =
    useState<AIResponse | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(
      null,
    );

  async function generate(
    request: AIRequest,
  ): Promise<AIResponse | null> {

    try {

      setLoading(true);
      setError(null);

      const result =
        await aiService.generate(
          request,
        );

      setResponse(result);

      return result;

        } catch (err) {

      const message =
        err instanceof Error
          ? err.message
          : "Unknown AI error";

      setError(message);

      return null;

    } finally {

      setLoading(false);

    }
  }

  function clear() {
    setResponse(null);
    setError(null);
  }

  const value = useMemo(
    () => ({
      loading,
      response,
      error,
      generate,
      clear,
    }),
    [
      loading,
      response,
      error,
    ],
  );

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {

  const context =
    useContext(AIContext);

  if (!context) {
    throw new Error(
      "useAI must be used inside AIProvider",
    );
  }

  return context;
}
