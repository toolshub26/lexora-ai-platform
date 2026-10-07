"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authProvider } from "@/features/auth/provider";

type AuthContextType = {
  user: unknown;
  loading: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: () => {},
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authProvider.subscribe((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });

    authProvider.initialize();

    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = () => {
    const state = authProvider.getState();

    setUser(state.user);
    setLoading(state.isLoading);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
