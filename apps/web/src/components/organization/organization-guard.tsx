"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOrganization } from "@/features/organization";

export function OrganizationGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, active, organizations, error } = useOrganization();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      return;
    }

    if (!active && organizations.length === 0) {
      if (pathname !== "/onboarding/organization") {
        router.replace("/onboarding/organization");
      }
    }
  }, [
    active,
    error,
    isLoading,
    organizations.length,
    pathname,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] text-sm text-slate-500">
        Loading organization workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] px-4 text-center text-sm text-red-300">
        Unable to load organization data. Please try again.
      </div>
    );
  }

  if (!active && organizations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] text-sm text-slate-500">
        Redirecting to organization setup...
      </div>
    );
  }

  return <>{children}</>;
}
