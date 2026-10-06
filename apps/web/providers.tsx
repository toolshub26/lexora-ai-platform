"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "./src/context/AuthContext";
import { OrganizationProvider } from "./src/features/organization";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <AuthProvider>
      <OrganizationProvider>
        {children}
      </OrganizationProvider>
    </AuthProvider>
  );
}
