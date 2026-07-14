export const AUTH_STORAGE_KEY = "lexora.auth";

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  PROFILE: "/profile",
} as const;

export const SESSION_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
