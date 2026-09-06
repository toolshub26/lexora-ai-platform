"use client";

import { ReactNode } from "react";
import { OrganizationProvider } from "./src/features/organization";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  );
}
