"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { authProvider } from "@/src/features/auth/provider";

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

  const refresh = () => {
    const state = authProvider.getState();
    setUser(state?.user ?? null);
  };

  useEffect(() => {
    authProvider.initialize();

    const unsubscribe = authProvider.subscribe((state) => {
      setUser(state?.user ?? null);
      setLoading(false);
    });

    refresh();

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
