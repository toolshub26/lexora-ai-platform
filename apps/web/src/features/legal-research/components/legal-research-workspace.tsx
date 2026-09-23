"use client";

import { FormEvent, useEffect, useState } from "react";
import { useOrganization } from "@/features/organization";
import { legalResearchService } from "../service";
import type {
  LegalResearchQuery,
  LegalResearchSession,
  LegalSourceType,
} from "../types";
import type { LegalResearchSearchResult } from "../service";

const SOURCE_TYPES: LegalSourceType[] = [
  "cases",
  "statutes",
  "regulations",
  "rules",
  "official-publications",
  "administrative-decisions",
  "treaties",
  "official-guidance",
  "secondary",
];

function formatDate(value: Date | string | undefined): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function sourceTypeLabel(value: LegalSourceType): string {
  return value.replaceAll("-", " ");
}

export default function LegalResearchWorkspace() {
  const { active, isLoading: organizationLoading, error: organizationError } =
    useOrganization();

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LegalResearchSearchResult | null>(null);
  const [sessions, setSessions] = useState<LegalResearchSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const organizationId = active?.organization.id ?? null;

  async function loadHistory(id: string) {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const items = await legalResearchService.listSessions(id);
      setSessions(items.slice(0, 8));
    } catch (cause) {
      setHistoryError(
        cause instanceof Error
          ? cause.message
          : "Unable to load research history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    if (!organizationId) {
      setSessions([]);
      return;
    }

    void loadHistory(organizationId);
  }, [organizationId]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = query.trim();

    if (!organizationId) {
      setError("Select an active organization before starting research.");
      return;
    }

    if (!normalizedQuery) {
      setError("Enter a legal research question.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const searchRequest: LegalResearchQuery = {
      query: normalizedQuery,
      sources: SOURCE_TYPES,
    };

    try {
      const researchResult = await legalResearchService.search(
        organizationId,
        searchRequest,
      );

      setResult(researchResult);
      setQuery("");
      await loadHistory(organizationId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Legal research request failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (organizationLoading) {
    return (
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8">
        <div className="text-sm text-slate-400">
          Loading organization context...
        </div>
      </section>
    );
  }

  if (organizationError) {
    return (
      <section className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6">
        <div className="text-sm font-semibold text-red-300">
          Organization context unavailable
        </div>
        <p className="mt-2 text-xs text-red-200/70">{organizationError}</p>
      </section>
    );
  }

  if (!organizationId) {
    return (
      <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-6">
        <div className="text-sm font-semibold text-amber-300">
          No active organization
        </div>
        <p className="mt-2 text-xs text-amber-200/70">
          Legal Research requires an active organization membership.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            Legal Intelligence
          </div>

          <h1 className="text-2xl font-bold tracking-[-0.03em] text-white">
            Legal Research
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Research legal issues, authorities and precedents using the
            organization&apos;s authorized research workflow.
          </p>

          <div className="mt-2 text-[10px] text-slate-600">
            Organization:{" "}
            <span className="text-slate-400">
              {active?.organization.name ?? "Organization"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6">
          <label
            htmlFor="legal-research-query"
            className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"
          >
            Research question
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              id="legal-research-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Example: What is the current legal position on..."
              className="min-h-[92px] flex-1 resize-y rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-700 focus:border-indigo-400/40 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading}
              className="h-fit rounded-xl bg-indigo-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Researching..." : "Start Research"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-lg border border-red-400/20 bg-red-400/[0.04] px-3 py-2 text-xs text-red-300"
            >
              {error}
            </div>
          )}
        </form>
      </section>

      {result && (
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Research Result
              </div>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {result.research.query}
              </h2>
            </div>

            <div className="text-left text-[10px] text-slate-600 sm:text-right">
              <div>{result.research.totalResults} result(s)</div>
              <div>{result.research.executionTimeMs} ms</div>
              <div>{formatDate(result.research.completedAt)}</div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/15 p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Summary
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {result.research.summary || "No research summary was returned."}
            </p>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                Sources
              </div>
              <div className="text-[10px] text-slate-600">
                {result.research.sources.length} source(s)
              </div>
            </div>

            {result.research.sources.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] p-4 text-xs text-slate-600">
                No sources were returned.
              </div>
            ) : (
              <div className="space-y-3">
                {result.research.sources.map((source) => (
                  <article
                    key={source.id}
                    className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200">
                          {source.title}
                        </h3>

                        <div className="mt-1 text-[10px] text-slate-600">
                          {source.citation}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.1em]">
                        <span className="rounded-full border border-white/[0.08] px-2 py-1 text-slate-500">
                          {sourceTypeLabel(source.sourceType)}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-1 ${
                            source.verificationStatus === "verified"
                              ? "border-emerald-400/20 text-emerald-300"
                              : "border-amber-400/20 text-amber-300"
                          }`}
                        >
                          {source.verificationStatus}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-6 text-slate-500">
                      {source.snippet}
                    </p>

                    {source.sourceUrl && (
                      <a
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-[10px] text-indigo-300 hover:text-indigo-200"
                      >
                        Open source ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Research History
            </div>
            <h2 className="mt-1 text-base font-semibold text-white">
              Recent research
            </h2>
          </div>

          {historyLoading && (
            <span className="text-[10px] text-slate-600">Loading...</span>
          )}
        </div>

        {historyError && (
          <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/[0.04] px-3 py-2 text-xs text-red-300">
            {historyError}
          </div>
        )}

        {!historyLoading && !historyError && sessions.length === 0 && (
          <div className="mt-4 rounded-xl border border-white/[0.06] p-4 text-xs text-slate-600">
            No research sessions yet.
          </div>
        )}

        {sessions.length > 0 && (
          <div className="mt-4 divide-y divide-white/[0.06]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-slate-300">
                    {session.query.query}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600">
                    {formatDate(session.updatedAt)}
                  </div>
                </div>

                <span className="w-fit rounded-full border border-white/[0.08] px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-slate-500">
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
