export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  refreshToken: null,
  userId: null,
};
