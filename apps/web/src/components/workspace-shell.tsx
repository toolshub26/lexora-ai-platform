"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, logout } from "@/features/auth";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "AI Assistant", href: "/ai-assistant", icon: "✦" },
  { label: "Legal Research", href: "/legal-research", icon: "⌕" },
  { label: "Drafting", href: "/drafting", icon: "◇" },
  { label: "Matters & Cases", href: "/matters", icon: "▣" },
  { label: "Documents", href: "/documents", icon: "□" },
  { label: "Contracts", href: "/contracts", icon: "▤" },
  { label: "Compliance", href: "/compliance", icon: "✓" },
  { label: "Analytics", href: "/analytics", icon: "⌁" },
  { label: "Reports", href: "/reports", icon: "▤" },
  { label: "Users & Teams", href: "/users", icon: "◎" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

export default function WorkspaceShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");
      setChecking(false);
    });

    return unsubscribe;
  }, [router]);

  const name = useMemo(() => {
    const raw = email.split("@")[0] || "User";

    return raw
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }, [email]);

  const active = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    router.push(`/documents?search=${encodeURIComponent(query)}`);
    setSearch("");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] text-sm text-slate-500">
        Loading secure workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100">
      {menuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[235px] flex-col border-r border-white/[0.07] bg-[#080d19] transition-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[68px] items-center border-b border-white/[0.07] px-5">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="group"
          >
            <div className="text-[19px] font-black tracking-[-0.04em] text-white">
              LEXORA
            </div>
            <div className="text-[8px] uppercase tracking-[0.22em] text-slate-600">
              Legal Intelligence
            </div>
          </Link>

          <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.5)]" />
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-4">
          <div className="mb-2 px-3 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Workspace
          </div>

          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] transition ${
                active(item.href)
                  ? "bg-indigo-500/15 text-white shadow-[inset_2px_0_0_rgba(129,140,248,.9)]"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              <span className="w-4 text-center text-sm">{item.icon}</span>
              <span>{item.label}</span>

              {active(item.href) && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          ))}
        </div>

        <div className="border-t border-white/[0.07] p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <span>↪</span>
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-[235px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-white/[0.07] bg-[#050914]/90 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.05] lg:hidden"
            aria-label="Open navigation"
          >
            ☰
          </button>

          <div className="hidden text-[10px] text-slate-600 sm:block">
            Lexora /{" "}
            <span className="text-slate-300">
              {pathname === "/dashboard"
                ? "Dashboard"
                : pathname.slice(1).replaceAll("-", " ")}
            </span>
          </div>

          <form
            onSubmit={submitSearch}
            className="ml-auto hidden w-full max-w-[420px] md:block"
          >
            <div className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 focus-within:border-indigo-400/40">
              <span className="text-slate-500">⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search matters, documents, research..."
                className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-slate-600"
              />

              <kbd className="rounded border border-white/10 px-1.5 text-[9px] text-slate-600">
                Enter
              </kbd>
            </div>
          </form>

          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((value) => !value)}
              className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.04] hover:text-white"
            >
              ♧
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-white/[0.08] bg-[#0b1120] p-3 shadow-2xl">
                <div className="text-[11px] font-semibold text-white">
                  Notifications
                </div>
                <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-[10px] text-slate-500">
                  No new notifications.
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold">
              {name.charAt(0)}
            </div>

            <div className="hidden sm:block">
              <div className="max-w-[120px] truncate text-[10px] font-semibold">
                {name}
              </div>
              <div className="text-[8px] text-slate-600">Administrator</div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-3 py-5 sm:px-5 lg:px-7">
          {children}
        </main>
      </div>
    </div>
  );
}
