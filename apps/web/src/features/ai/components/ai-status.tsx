import React from "react";
import { useAI } from "../context";

export function AIStatus() {
  const { provider } = useAI();

  return (
    <div>
      <strong>AI Status</strong>

      <p>
        Provider: <strong>{provider}</strong>
      </p>

      <p>Status: Ready</p>
    </div>
  );
}
