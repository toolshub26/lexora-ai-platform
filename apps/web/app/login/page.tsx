"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, loginWithGoogle } from "@/features/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await login({ email, password });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      const result = await loginWithGoogle();

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Unable to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background:
          "radial-gradient(circle at 20% 10%, rgba(37,99,235,.18), transparent 35%), radial-gradient(circle at 85% 85%, rgba(34,211,238,.12), transparent 35%), #020617",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link
            href="/"
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            <span className="gradient-text">LEXORA</span>
          </Link>

          <p
            style={{
              marginTop: "8px",
              color: "var(--muted)",
              fontSize: "14px",
            }}
          >
            Enterprise Legal AI Platform
          </p>
        </div>

        <section
          className="card shadow-soft"
          style={{
            padding: "34px",
            borderRadius: "20px",
            background:
              "linear-gradient(145deg, rgba(15,23,42,.98), rgba(8,15,30,.98))",
            border: "1px solid rgba(96,165,250,.16)",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h1
              style={{
                fontSize: "28px",
                lineHeight: 1.2,
                fontWeight: 750,
                letterSpacing: "-0.03em",
              }}
            >
              Welcome back
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "var(--muted)",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Sign in to continue to your Lexora workspace.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  height: "50px",
                  padding: "0 15px",
                  borderRadius: "10px",
                  border: "1px solid #334155",
                  background: "#020617",
                  color: "var(--foreground)",
                  fontSize: "15px",
                }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Password</span>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    height: "50px",
                    padding: "0 48px 0 15px",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    background: "#020617",
                    color: "var(--foreground)",
                    fontSize: "15px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "transparent",
                    color: "var(--muted)",
                    fontSize: "18px",
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 2l20 20" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9.5 5 10.5 7" />
                      <path d="M6.6 6.6C4.1 8.1 2.5 10.3 1.5 12c1 2 5 7 10.5 7 1 0 2-.2 2.9-.5" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <div style={{ textAlign: "right", marginTop: "-6px" }}>
              <Link
                href="/forgot-password"
                style={{
                  color: "#60a5fa",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(239,68,68,.3)",
                  background: "rgba(239,68,68,.08)",
                  color: "#fca5a5",
                  fontSize: "14px",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "10px",
                background: loading
                  ? "#1e40af"
                  : "linear-gradient(135deg, #2563eb, #0891b2)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              <span style={{ flex: 1, height: "1px", background: "#1e293b" }} />
              OR
              <span style={{ flex: 1, height: "1px", background: "#1e293b" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "10px",
                background: "#0f172a",
                border: "1px solid #334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                color: "#f8fafc",
                fontSize: "15px",
                fontWeight: 600,
                opacity: loading ? 0.75 : 1,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.7 3.1-4.2 3.1-7.5Z" />
                <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.6c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.7A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.2 13.7a6 6 0 0 1 0-3.4V7.6H2.9a10 10 0 0 0 0 9.2l3.3-3.1Z" />
                <path fill="#EA4335" d="M12 6c1.5 0 2.9.5 4 1.5l3-3C17 2.9 14.7 2 12 2a10 10 0 0 0-9.1 5.6l3.3 2.7C7 7.8 9.3 6 12 6Z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          <p
            style={{
              marginTop: "26px",
              paddingTop: "22px",
              borderTop: "1px solid #1e293b",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "14px",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: "#60a5fa",
                fontWeight: 700,
              }}
            >
              Create Account
            </Link>
          </p>
        </section>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          Secure authentication powered by Lexora
        </p>
      </div>
    </main>
  );
}
