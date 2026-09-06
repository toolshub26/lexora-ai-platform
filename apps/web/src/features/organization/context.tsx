"use client";

import {
  createContext,
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
  const [organizations, setOrganizations] = useState<
    OrganizationSummary[]
  >([]);
  const [active, setActive] =
    useState<OrganizationContext | null>(null);

  const loadOrganizations = async (userId: string) => {
    const items =
      await organizationService.getUserOrganizations(userId);

    setOrganizations(items);

    if (items.length === 0) {
      setActive(null);
      return;
    }

    const current =
      active && items.some((item) => item.id === active.organization.id)
        ? active.organization.id
        : items[0].id;

    const context =
      await organizationService.getOrganizationContext(
        current,
        userId,
      );

    setActive(context);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setIsLoading(true);

        try {
          if (!user) {
            setOrganizations([]);
            setActive(null);
            return;
          }

          await loadOrganizations(user.uid);
        } finally {
          setIsLoading(false);
        }
      },
    );

    return unsubscribe;
  }, []);

  const setActiveOrganization = async (
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
  };

  const refresh = async () => {
    const user = auth.currentUser;

    if (!user) {
      setOrganizations([]);
      setActive(null);
      return;
    }

    await loadOrganizations(user.uid);
  };

  const value = useMemo(
    () => ({
      isLoading,
      active,
      organizations,
      setActiveOrganization,
      refresh,
    }),
    [isLoading, active, organizations],
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
