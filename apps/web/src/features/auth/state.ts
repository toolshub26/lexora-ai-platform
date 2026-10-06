import type { User } from "./types";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  user: User | null;
  error: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  user: null,
  error: null,
};
