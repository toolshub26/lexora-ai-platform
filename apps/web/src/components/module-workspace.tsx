"use client";

import { useMemo, useState } from "react";

export type ModuleConfig = {
  eyebrow: string;
  title: string;
  description: string;
  actions: string[];
  sections: string[];
};

const sectionData: Record<string, string[]> = {
  "AI Assistant": [
    "Legal AI conversations",
    "Case research",
    "Contract review",
    "Document analysis",
  ],
  "Legal Research": [
    "Authorities and precedents",
    "Research sessions",
    "Saved authorities",
    "Research history",
  ],
  Drafting: [
    "Legal document drafting",
    "Draft history",
    "Templates",
    "Review queue",
  ],
  "Matters & Cases": [
    "Active matters",
    "Matter activity",
    "Clients",
    "Case workspace",
  ],
  Documents: [
    "Document repository",
    "Recent documents",
    "Collections",
    "AI document intelligence",
  ],
  Contracts: [
    "Contract portfolio",
    "Contract reviews",
    "Renewal tracking",
    "Risk overview",
  ],
  Compliance: [
    "Compliance controls",
    "Obligations",
    "Evidence",
    "Risk activity",
  ],
  Analytics: [
    "Operational analytics",
    "AI usage",
    "Matter trends",
    "Activity intelligence",
  ],
  Reports: [
    "Report center",
    "Recent reports",
    "Scheduled reports",
    "Export center",
  ],
  "Users & Teams": [
    "Organization users",
    "Teams",
    "Roles and permissions",
    "Access activity",
  ],
  Settings: [
    "Organization settings",
    "Security controls",
    "Integrations",
    "Platform preferences",
  ],
};

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0b1120] p-4">
      <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[9px] text-emerald-400">{detail}</div>
    </div>
  );
}

export default function ModuleWorkspace({
  config,
}: {
  config: ModuleConfig;
}) {
  const [activeAction, setActiveAction] = useState("");
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const source = sectionData[config.title] ?? config.sections;

    if (!query.trim()) return source;

    return source.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    );
  }, [config.sections, config.title, query]);

  return (
    <>
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            {config.eyebrow}
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {config.title}
          </h1>

          <p className="mt-2 max-w-2xl text-[11px] leading-6 text-slate-500">
            {config.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {config.actions.map((action, index) => (
            <button
              key={action}
              onClick={() => setActiveAction(action)}
              className={`rounded-lg border px-4 py-2.5 text-[10px] font-semibold transition ${
                index === 0
                  ? "border-indigo-400/20 bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 hover:bg-indigo-400"
                  : "border-white/10 bg-white/[0.025] text-slate-300 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {activeAction && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-indigo-400/20 bg-indigo-500/[0.08] px-4 py-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-indigo-300">
              Workspace action
            </div>
            <div className="mt-1 text-[11px] font-semibold text-white">
              {activeAction}
            </div>
          </div>

          <button
            onClick={() => setActiveAction("")}
            className="rounded-md px-2 py-1 text-[10px] text-slate-500 hover:text-white"
          >
            Close
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Workspace items" value="128" detail="+12.4%" />
        <Stat label="Active workflows" value="42" detail="+8.1%" />
        <Stat label="AI operations" value="326" detail="+21.0%" />
        <Stat label="Completion rate" value="94%" detail="Healthy" />
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1120]">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-white">
              {config.title} Workspace
            </h2>
            <p className="mt-1 text-[9px] text-slate-600">
              Enterprise workspace controls and operational intelligence.
            </p>
          </div>

          <div className="w-full sm:w-[260px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${config.title.toLowerCase()}...`}
              className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-[10px] text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-400/40"
            />
          </div>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-2">
          {filteredSections.map((section, index) => (
            <button
              key={section}
              onClick={() => setActiveAction(section)}
              className={`group rounded-xl border border-white/[0.07] bg-[#080e1b] p-4 text-left transition hover:border-indigo-400/25 hover:bg-indigo-500/[0.05] ${
                index === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  {index + 1}
                </div>

                <span className="text-[10px] text-slate-700 transition group-hover:text-indigo-400">
                  →
                </span>
              </div>

              <h3 className="mt-4 text-[12px] font-semibold text-slate-200">
                {section}
              </h3>

              <p className="mt-2 max-w-xl text-[9px] leading-5 text-slate-600">
                Manage, review and analyze {section.toLowerCase()} from the
                Lexora enterprise workspace.
              </p>
            </button>
          ))}

          {filteredSections.length === 0 && (
            <div className="md:col-span-2 rounded-xl border border-dashed border-white/[0.08] p-10 text-center">
              <div className="text-lg text-indigo-400">⌕</div>
              <div className="mt-2 text-[11px] font-semibold text-slate-400">
                No matching workspace items
              </div>
              <button
                onClick={() => setQuery("")}
                className="mt-3 text-[10px] text-indigo-400 hover:text-indigo-300"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/[0.07] bg-[#0b1120] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Enterprise controls
            </div>
            <h2 className="mt-2 text-sm font-semibold text-white">
              Built for controlled legal operations
            </h2>
          </div>

          <span className="rounded-md border border-emerald-400/10 bg-emerald-400/[0.06] px-2 py-1 text-[8px] font-semibold text-emerald-400">
            SECURE WORKSPACE
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Access Control", "Organization-level authorization"],
            ["Audit Evidence", "Action visibility and accountability"],
            ["AI Governance", "Controlled AI operations"],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4"
            >
              <div className="text-[10px] font-semibold text-slate-300">
                {title}
              </div>
              <div className="mt-2 text-[9px] leading-5 text-slate-600">
                {text}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
