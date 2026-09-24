import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { OrganizationGuard } from "@/components/organization/organization-guard";

const modules = [
  ["AI Assistant", "/ai-assistant", "Ask Lexora, analyze legal information and work with AI."],
  ["Legal Research", "/legal-research", "Research cases, authorities, precedents and legal issues."],
  ["Drafting", "/drafting", "Create and manage professional legal drafts."],
  ["Matters & Cases", "/matters", "Organize legal matters, clients, cases and activity."],
  ["Documents", "/documents", "Centralize, search and manage legal documents."],
  ["Contracts", "/contracts", "Review, manage and analyze contractual work."],
  ["Compliance", "/compliance", "Track compliance obligations and organizational controls."],
  ["Analytics", "/analytics", "Understand legal operations and AI usage."],
];

function Metric({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0b1120] p-5">
      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
        {title}
      </div>
      <div className="mt-4 text-2xl font-bold text-white">{value}</div>
      <div className="mt-2 text-[10px] text-slate-600">{description}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <OrganizationGuard>
      <WorkspaceShell>
      <div className="mb-7">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">
          Enterprise Legal Intelligence
        </div>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Enterprise Workspace
            </h1>
            <p className="mt-2 max-w-2xl text-[11px] leading-6 text-slate-500">
              Your centralized environment for legal research, documents,
              matters, drafting, AI and organizational operations.
              </p>
        </div>

          <div className="flex gap-2">
            <Link
              href="/documents"
              className="rounded-lg border border-white/10 px-4 py-2.5 text-[10px] font-semibold text-slate-300 hover:bg-white/[0.04]"
            >
              Upload Document
            </Link>
            <Link
              href="/matters"
              className="rounded-lg bg-indigo-500 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-indigo-400"
            >
              New Matter
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Matters"
          value="—"
          description="Connect your matter data source"
        />
        <Metric
          title="Documents"
          value="—"
          description="No document repository connected"
        />
        <Metric
          title="Research"
          value="—"
          description="Research activity will appear here"
        />
        <Metric
          title="AI Usage"
          value="—"
          description="AI usage telemetry pending"
        />
      </div>

      <section className="mt-4 rounded-2xl border border-white/[0.07] bg-[#0b1120]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="text-sm font-bold">Ask Lexora</div>
          <div className="mt-1 text-[10px] text-slate-600">
            Your legal AI command center.
          </div>
        </div>

        <div className="p-5">
          <Link
            href="/ai-assistant"
            className="flex min-h-[90px] items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/[0.05] p-5 transition hover:border-indigo-400/40"
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-400">
                AI Workspace
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                Start a legal AI session
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                Research, review, summarize, analyze or draft.
              </div>
            </div>
            <span className="text-xl text-indigo-400">→</span>
          </Link>
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-3">
          <div className="text-sm font-bold">Legal Workspaces</div>
          <div className="mt-1 text-[10px] text-slate-600">
            Open a workspace to continue your legal workflow.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map(([title, href, description]) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-white/[0.07] bg-[#0b1120] p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-[#0d1425]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                  ✦
                </div>
                <span className="text-slate-700 transition group-hover:text-indigo-300">
                  →
                </span>
              </div>
              <h2 className="mt-5 text-sm font-bold text-white">{title}</h2>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-[#0b1120] p-5">
          <div className="text-sm font-bold">Security & Governance</div>
          <p className="mt-2 text-[10px] leading-5 text-slate-600">
            Authentication is active. Organization authorization, audit
            evidence and data controls are managed through the enterprise
            architecture.
          </p>
          <Link
            href="/settings"
            className="mt-4 inline-block text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Open security settings →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#0b1120] p-5">
          <div className="text-sm font-bold">Organization</div>
          <p className="mt-2 text-[10px] leading-5 text-slate-600">
            Manage users, teams, roles, permissions, integrations and
            organization settings.
          </p>
          <Link
            href="/users"
            className="mt-4 inline-block text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Manage users & teams →
          </Link>
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-3">
          <div className="text-sm font-bold">Matters & Cases</div>
          <div className="mt-1 text-[10px] text-slate-600">
            Organize legal matters, clients, cases and activity.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map(([title, href, description]) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-white/[0.07] bg-[#0b1120] p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-[#0d1425]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                  ✦
                </div>
                <span className="text-slate-700 transition group-hover:text-indigo-300">
                  →
                </span>
              </div>
              <h2 className="mt-5 text-sm font-bold text-white">{title}</h2>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-3">
          <div className="text-sm font-bold">Contracts</div>
          <div className="mt-1 text-[10px] text-slate-600">
            Review, manage and analyze contractual work.
            </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[["AI Assistant", "/ai-assistant", "Ask Lexora, analyze legal information and work with AI."], ["Legal Research", "/legal-research", "Research cases, authorities, precedents and legal issues."], ["Drafting", "/drafting", "Create and manage professional legal drafts."], ["Matters & Cases", "/matters", "Organize legal matters, clients, cases and activity."], ["Contracts", "/contracts", "Review, manage and analyze contractual work."], ["Compliance", "/compliance", "Track compliance obligations and organizational controls."], ["Analytics", "/analytics", "Understand legal operations and AI usage."]].map(
            ([title, href, description]) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-white/[0.07] bg-[#0b1120] p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-[#0d1425]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                    ✦
                  </div>
                  <span className="text-slate-700 transition group-hover:text-indigo-300">
                    →
                  </span>
                </div>
                <h2 className="mt-5 text-sm font-bold text-white">{title}</h2>
                <p className="mt-2 text-[10px] leading-5 text-slate-600">
                  {description}
                </p>
              </Link>
            )
          )}
        </div>
      </section>
      </WorkspaceShell>
    </OrganizationGuard>
  );
}
