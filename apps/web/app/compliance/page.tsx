"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrganizationGuard } from "@/components/organization/organization-guard";
import { useOrganization } from "@/features/organization";
import { complianceService, type ComplianceItem } from "@/features/compliance";

export default function CompliancePage() {
  return (
    <OrganizationGuard>
      <ComplianceContent />
    </OrganizationGuard>
  );
}

function ComplianceContent() {
  const { active } = useOrganization();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!active) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await complianceService.getItems(active.organization.id);

        if (!cancelled) {
          setItems(result);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load compliance data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [active]);

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 font-black text-[#050816]">
              L
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">Lexora</div>
              <div className="text-[9px] uppercase tracking-[0.28em] text-slate-500">
                Legal Intelligence
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <Link
              href="/dashboard"
              className="transition hover:text-cyan-300"
            >
              Dashboard
            </Link>

            <Link
              href="/matters"
              className="transition hover:text-cyan-300"
            >
              Matters
            </Link>

            <Link
              href="/contracts"
              className="transition hover:text-cyan-300"
            >
              Contracts
            </Link>

            <Link
              href="/compliance"
              className="text-cyan-300"
            >
              Compliance
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              Compliance Tracker
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Compliance Obligations
            </h2>

            {error && (
              <p className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {loading && active && (
              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0b1120] p-6 text-sm text-slate-500">
                Loading compliance items...
              </div>
            )}

            {!loading && active && (
              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0b1120] p-6">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No compliance obligations found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => {
                      const statusClass =
                        item.status === "active"
                          ? "bg-green-500/10 text-green-400"
                          : item.status === "expired"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400";

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-3 text-sm"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${statusClass}`}
                          >
                            ●
                          </span>

                          <div className="flex-1">
                            <div className="text-slate-200">
                              {item.title}
                            </div>

                            {item.deadline && (
                              <div className="mt-1 text-[9px] text-slate-500">
                                Deadline:{" "}
                                {new Date(item.deadline).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!active && (
              <div className="mt-6 text-slate-500">
                <p>Select an organization to view compliance items.</p>

                <Link
                  href="/onboarding/organization"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Create or select organization
                </Link>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/onboarding/organization"
                className="rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-bold text-[#04111d] transition hover:bg-indigo-300"
              >
                Add Compliance Item
              </Link>

              <Link
                href="/dashboard"
                className="rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
