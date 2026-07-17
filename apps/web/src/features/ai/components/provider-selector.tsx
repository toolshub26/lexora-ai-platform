import React from "react";
import { AI_PROVIDERS } from "../config";
import { useAI } from "../context";

export function ProviderSelector() {
  const { provider, setProvider } = useAI();

  return (
    <label>
      <span>AI Provider</span>

      <select
        value={provider}
        onChange={(e) => setProvider(e.target.value as typeof provider)}
      >
        {AI_PROVIDERS.map((item) => (
          <option key={item.id} value={item.id} disabled={!item.enabled}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
