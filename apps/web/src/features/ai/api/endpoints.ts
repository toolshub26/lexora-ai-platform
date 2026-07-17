export const AI_ENDPOINTS = {
  chat: "/api/ai/chat",
  models: "/api/ai/models",
  providers: "/api/ai/providers",
  health: "/api/ai/health",
} as const;

export type AIEndpoint =
  (typeof AI_ENDPOINTS)[keyof typeof AI_ENDPOINTS];
