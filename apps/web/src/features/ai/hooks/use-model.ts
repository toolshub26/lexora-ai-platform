"use client";

import { useState } from "react";

export function useModel() {
  const [model, setModel] = useState("openai");

  return {
    model,
    setModel,
  };
}
