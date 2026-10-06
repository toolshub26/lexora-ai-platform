"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authProvider } from "@/features/auth/provider";
import type { User } from "@/features/auth/types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refresh: () => void;
};

const AuthContext =
  createContext<AuthContextType>({
    user: null,
    loading: true,
    refresh: () => {},
  });

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refresh = () => {
    const state =
      authProvider.getState();

    setUser(state.user);
    setLoading(state.isLoading);
  };

  useEffect(() => {
    authProvider.initialize();

    const unsubscribe =
      authProvider.subscribe((state) => {
        setUser(state.user);
        setLoading(state.isLoading);
      });

    return () => {
      unsubscribe();
    };
  }, []);

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
