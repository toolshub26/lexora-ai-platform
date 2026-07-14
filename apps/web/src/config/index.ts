export const APP_CONFIG = {
  name: "Lexora AI",
  description: "Enterprise Legal AI Platform",
  version: "1.0.0",
  environment: process.env.NODE_ENV ?? "development",
} as const;
