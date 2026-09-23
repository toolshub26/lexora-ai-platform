"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../auth/firebase";
import { organizationService } from "./service";
import type {
  OrganizationContext,
  OrganizationSummary,
} from "./types";

interface OrganizationContextState {
  isLoading: boolean;
  error: string | null;
  active: OrganizationContext | null;
  organizations: OrganizationSummary[];
  setActiveOrganization: (
    organizationId: string,
  ) => Promise<void>;
  refresh: () => Promise<void>;
}

const OrganizationContextProvider =
  createContext<OrganizationContextState | null>(null);

export function OrganizationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<
    OrganizationSummary[]
  >([]);
  const [active, setActive] =
    useState<OrganizationContext | null>(null);

  const loadOrganizations = useCallback(
    async (
    userId: string,
    preferredOrganizationId?: string | null,
  ) => {
    setError(null);

    try {
      const items =
        await organizationService.getUserOrganizations(userId);

      setOrganizations(items);

      if (items.length === 0) {
        setActive(null);
        return;
      }

      const current =
        preferredOrganizationId &&
        items.some((item) => item.id === preferredOrganizationId)
          ? preferredOrganizationId
          : items[0].id;

      const context =
        await organizationService.getOrganizationContext(
          current,
          userId,
        );

      if (!context) {
        throw new Error(
          "Unable to load the active organization.",
        );
      }

      setActive(context);
    } catch (cause) {
      setOrganizations([]);
      setActive(null);
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load organization data.",
      );
    }
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setIsLoading(true);
        setError(null);

        try {
          if (!user) {
            setOrganizations([]);
            setActive(null);
            return;
          }

          await loadOrganizations(user.uid, null);
        } finally {
          setIsLoading(false);
        }
      },
    );

    return unsubscribe;
  }, [loadOrganizations]);

  const setActiveOrganization = useCallback(
    async (
    organizationId: string,
  ) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Authentication required");
    }

    const context =
      await organizationService.getOrganizationContext(
        organizationId,
        user.uid,
      );

    if (!context) {
      throw new Error(
        "You do not have access to this organization",
      );
    }

    setActive(context);
    },
    [],
  );

  const refresh = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setOrganizations([]);
      setActive(null);
      return;
    }

    await loadOrganizations(
      user.uid,
      active?.organization.id ?? null,
    );
    },
    [active, loadOrganizations],
  );

  const value = useMemo(
    () => ({
      isLoading,
      error,
      active,
      organizations,
      setActiveOrganization,
      refresh,
    }),
    [isLoading, error, active, organizations, setActiveOrganization, refresh],
  );

  return (
    <OrganizationContextProvider.Provider value={value}>
      {children}
    </OrganizationContextProvider.Provider>
  );
}

export function useOrganization(): OrganizationContextState {
  const context = useContext(OrganizationContextProvider);

  if (!context) {
    throw new Error(
      "useOrganization must be used inside OrganizationProvider",
    );
  }

  return context;
}
