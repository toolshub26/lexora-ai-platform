"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/src/context/AuthContext";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
