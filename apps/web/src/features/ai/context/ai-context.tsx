import React, { createContext, useContext, useMemo, useState } from "react";
import type { AIProvider } from "../types/provider";

export interface AIContextValue {
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

export function AIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [provider, setProvider] = useState<AIProvider>("openai");

  const value = useMemo(
    () => ({
      provider,
      setProvider,
    }),
    [provider]
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
    throw new Error("useAI must be used within AIProvider");
  }

  return context;
}
