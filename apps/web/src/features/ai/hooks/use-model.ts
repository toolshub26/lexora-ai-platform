"use client";

import { useCallback } from "react";

import { useAI } from "../context";

export function useModel() {
  const { model, setModel } = useAI();

  const changeModel = useCallback(
    (nextModel: string) => {
      setModel(nextModel);
    },
    [setModel]
  );

  return {
    model,
    setModel: changeModel,
  };
}
