"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import type { AIProvider } from "../types/provider";

export interface AIContextValue {
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;

  model: string;
  setModel: (model: string) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  streaming: boolean;
  setStreaming: (streaming: boolean) => void;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function AIProvider({ children }: Props) {
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const value = useMemo(
    () => ({
      provider,
      setProvider,
      model,
      setModel,
      loading,
      setLoading,
      streaming,
      setStreaming,
    }),
    [provider, model, loading, streaming]
  );

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);

  if (!context) {
    throw new Error("useAI must be used inside AIProvider");
  }

  return context;
}
