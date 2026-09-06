"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/features/auth";
import { useOrganization } from "@/features/organization";

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const { active, isLoading, error, refresh } = useOrganization();
  const [authChecked, setAuthChecked] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!auth.currentUser) {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
  }, [isLoading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    if (!trimmedName) {
      setFormError("Organization name is required.");
      return;
    }

    setSubmitting(true);

    try {
      const { organizationService } = await import(
        "@/features/organization"
      );

      await organizationService.createOrganization(
        trimmedName,
        trimmedSlug || undefined,
      );

      await refresh();
      router.replace("/dashboard");
    } catch (cause) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : "Unable to create the organization.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050914] px-4 text-slate-400">
        {!isLoading && !auth.currentUser
          ? "Redirecting to login..."
          : "Loading organization workspace..."}
      </main>
    );
  }

  if (active) {
    router.replace("/dashboard");

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050914] px-4 text-slate-400">
        Opening your workspace...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050914] px-4 py-10 text-slate-100">
      <section className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0b1120] p-6 shadow-2xl sm:p-8">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">
          Lexora Enterprise
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Create your organization
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Set up your organization workspace before continuing to Lexora.
        </p>

        {(formError || error) && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-xs text-red-300">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="organization-name"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
            >
              Organization name
            </label>

            <input
              id="organization-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example Legal Associates"
              maxLength={120}
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/50"
            />
          </div>

          <div>
            <label
              htmlFor="organization-slug"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
            >
              Workspace slug
            </label>

            <input
              id="organization-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="example-legal-associates"
              maxLength={63}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/50"
            />

            <p className="mt-2 text-[10px] leading-5 text-slate-600">
              Leave this empty to generate a slug automatically.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating organization..." : "Create organization"}
          </button>
        </form>
      </section>
    </main>
  );
}
