export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Lexora AI",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
