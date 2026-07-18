"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import AIOrchestrator from "../core/ai";
import { AI_CONFIG } from "../config/ai";

const AIContext =
  createContext<AIOrchestrator | null>(
    null,
  );

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({
  children,
}: AIProviderProps) {
  const orchestrator = useMemo(
    () =>
      new AIOrchestrator(
        AI_CONFIG.providers,
      ),
    [],
  );

  
  return (
    <AIContext.Provider
      value={orchestrator}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context =
    useContext(AIContext);

  if (!context) {
    throw new Error(
      "useAI must be used within AIProvider.",
    );
  }

  return context;
}

export default AIProvider;
