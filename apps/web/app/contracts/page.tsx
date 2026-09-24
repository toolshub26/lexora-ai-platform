"use client";

import Link from "next/link";
import { useOrganization } from "@/features/organization";
import { contractService } from "@/features/contracts/service";
import { useEffect, useState } from "react";

interface Contract {
  id: string;
  title: string;
  status: string;
  counterpartyName?: string;
}

interface ContractsPageProps {
  organizationId: string;
}

export default function ContractsPage() {
  const { active } = useOrganization();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setError("No active organization.");
      setLoading(false);
      return;
    }

    const loadContracts = async () => {
      try {
        const contracts = await contractService.getContracts(active.organization.id);
        setContracts(contracts);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load contracts.",
        );
        setLoading(false);
      }
    };

    loadContracts();
  }, [active]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] text-slate-500">
        <div className="flex min-h-screen items-center justify-center p-4">
          Loading contracts...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#050914] px-4 text-center text-red-300">
        <h1>Error</h1>
        <p>{error}</p>
        <Link href="/dashboard" className="mt-4 rounded-xl bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400">Back to Dashboard</Link>
      </main>
    );
  }

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
            <Link href="/dashboard" className="transition hover:text-cyan-300">
              Dashboard
            </Link>
            <Link href="/matters" className="transition hover:text-cyan-300">
              Matters
            </Link>
            <Link href="/contracts" className="transition hover:text-cyan-300 active">
              Contracts
            </Link>
            <Link href="/compliance" className="transition hover:text-cyan-300">
              Compliance
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:block">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              Contract Management
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Your Contracts
            </h2>

            {error && (
              <p className="mt-3 text-red-400 text-sm">
                {error}
              </p>
            )}

            {active && (
              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0b1120] p-6">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[10px] text-slate-500"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-bg-red-500 text-red-300">
                      ⚖
                    </span>
                    <span>{contract.title}</span>
                  </div>
                ))}
              </div>
            )}

            {!active && (
              <div className="mt-6 text-slate-500">
                <p>Select an organization to view contracts.</p>
                <Link href="/onboarding/organization" className="text-indigo-400 hover:text-indigo-300">
                  Create or select organization
                </Link>
              </div>
            )} 

            <div className="mt-8">
              <Link
                href="/onboarding/organization"
                className="rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-bold text-[#04111d] transition hover:bg-indigo-300"
              >
                Create New Contract
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