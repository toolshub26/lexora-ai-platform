import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Legal Research",
    text: "Accelerate case research, precedent discovery, legal analysis and matter preparation.",
  },
  {
    number: "02",
    title: "AI Drafting",
    text: "Create contracts, pleadings, opinions, notices and other legal documents faster.",
  },
  {
    number: "03",
    title: "Document Intelligence",
    text: "Analyze, summarize, compare and review complex legal documents with AI.",
  },
  {
    number: "04",
    title: "Matter Management",
    text: "Bring matters, documents, activity and collaboration into one controlled workspace.",
  },
];

const enterprisePoints = [
  "Organization-level access control",
  "Auditability and security controls",
  "AI governance and usage visibility",
  "Centralized documents and matters",
  "Scalable multi-user architecture",
  "Enterprise reporting and analytics",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
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
            <a href="#platform" className="transition hover:text-cyan-300">
              Platform
            </a>
            <a href="#solutions" className="transition hover:text-cyan-300">
              Solutions
            </a>
            <a href="#security" className="transition hover:text-cyan-300">
              Security
            </a>
            <a href="#resources" className="transition hover:text-cyan-300">
              Resources
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-[#04111d] transition hover:bg-cyan-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Enterprise Legal Intelligence
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              AI intelligence for{" "}
              <span className="text-cyan-300">modern legal work.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              Lexora brings legal research, drafting, document intelligence,
              matter management and enterprise AI governance into one
              professional workspace.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-[#04111d] transition hover:bg-cyan-300"
              >
                Start with Lexora
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
              >
                Sign in
              </Link>
              <a
                href="#platform"
                className="rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Explore Platform
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-slate-500">
              <span>Research</span>
              <span>Draft</span>
              <span>Analyze</span>
              <span>Review</span>
              <span>Manage</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-[#0b1224] p-3 shadow-2xl shadow-cyan-950/30">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
                <div>
                  <div className="text-xs font-bold text-white">
                    Lexora Workspace
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    Enterprise Legal AI
                  </div>
                </div>
                <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[9px] font-bold text-cyan-300">
                  SECURE
                </div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 p-2">
                <div className="space-y-1">
                  {[
                    "Dashboard",
                    "AI Assistant",
                    "Legal Research",
                    "Documents",
                    "Matters & Cases",
                    "Analytics",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-lg px-3 py-2 text-[10px] ${
                        index === 1
                          ? "bg-cyan-400/10 font-bold text-cyan-300"
                          : "text-slate-500"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-white/10 bg-[#070d1c] p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                    Ask Lexora
                  </div>
                  <div className="mt-3 text-sm font-semibold">
                    Legal AI Assistant
                  </div>
                  <p className="mt-2 text-[10px] leading-5 text-slate-500">
                    Research a case, review a contract, analyze a document or
                    draft legal content.
                  </p>

                  <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[10px] text-slate-600">
                    Ask a legal question...
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {["Research case", "Review contract", "Draft document", "Analyze document"].map(
                      (item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-white/10 px-2 py-2 text-[9px] text-slate-400"
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-white/10 bg-[#10182b] px-4 py-3 shadow-xl sm:block">
              <div className="text-[9px] uppercase tracking-wider text-slate-500">
                AI Governance
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Enterprise Controls
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              One legal intelligence platform
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your legal team needs to work with intelligence.
            </h2>
            <p className="mt-5 leading-7 text-slate-400">
              From the first research question to the final document, Lexora
              is designed around the complete legal workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.04]"
              >
                <div className="text-xs font-bold text-cyan-300">
                  {feature.number}
                </div>
                <h3 className="mt-8 text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="border-b border-white/10 bg-[#070b18]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              Built for legal organizations
            </div>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Powerful AI. Controlled by your organization.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              Lexora is designed for law firms, corporate legal departments,
              compliance teams and professional legal operations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {enterprisePoints.map((point) => (
              <div
                key={point}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs text-cyan-300">
                    ✓
                  </span>
                  <span className="text-sm text-slate-300">{point}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d172b] to-[#070b18] p-8 sm:p-12">
            <div className="max-w-3xl">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                Security & governance
              </div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Enterprise controls belong at the core.
              </h2>
              <p className="mt-5 leading-7 text-slate-400">
                Authentication, authorization, organization isolation,
                auditability and AI governance are foundational capabilities,
                not afterthoughts.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {["Access Control", "Audit Evidence", "AI Governance"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-black/10 p-5"
                  >
                    <div className="text-sm font-bold">{item}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-500">
                      Designed for accountable enterprise legal operations.
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="resources" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            Start building your legal intelligence workflow
          </div>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold sm:text-5xl">
            Move from fragmented legal work to one intelligent workspace.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Create your Lexora account or sign in to enter the platform.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-cyan-400 px-7 py-3.5 text-sm font-bold text-[#04111d] transition hover:bg-cyan-300"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/15 px-7 py-3.5 text-sm font-semibold transition hover:bg-white/5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>© 2026 Lexora AI. Enterprise Legal Intelligence.</div>
        <div className="flex gap-5">
          <a href="#security" className="hover:text-slate-300">
            Security
          </a>
          <a href="#platform" className="hover:text-slate-300">
            Platform
          </a>
          <Link href="/login" className="hover:text-slate-300">
            Login
          </Link>
        </div>
      </footer>
    </main>
  );
}
