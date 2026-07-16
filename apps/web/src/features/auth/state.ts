import type { User } from "./types";

export interface AuthState {
  isAuthenticated: boolean;

  isLoading: boolean;

  accessToken: string | null;

  refreshToken: string | null;

  expiresAt: number | null;

  userId: string | null;

  user: User | null;

  error: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,

  isLoading: false,

  accessToken: null,

  refreshToken: null,

  expiresAt: null,

  userId: null,

  user: null,

  error: null,
};
