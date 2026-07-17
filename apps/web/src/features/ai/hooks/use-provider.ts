"use client";

import { useState } from "react";
import type { AIProvider } from "../types";

export function useProvider() {
  const [provider, setProvider] = useState<AIProvider>("openai");

  return {
    provider,
    setProvider,
  };
}
