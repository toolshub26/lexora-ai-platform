import React from "react";
import { AI_MODELS } from "../config";
import { useAI } from "../context";

export function ModelSelector() {
  const { provider } = useAI();

  const models = AI_MODELS.filter(
    (model) => model.provider === provider
  );

  return (
    <label>
      <span>AI Model</span>

      <select defaultValue={models[0]?.id}>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </label>
  );
}
