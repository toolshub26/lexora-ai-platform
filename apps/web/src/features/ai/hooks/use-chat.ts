"use client";

import { useState } from "react";

export function useChat() {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    setLoading,
  };
}
