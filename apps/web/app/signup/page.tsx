"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/features/auth";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 2l20 20" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9.5 5 10.5 7-0.4.8-1.3 2.1-2.7 3.4" />
      <path d="M6.6 6.6C4.1 8.1 2.5 10.3 1.5 12c1 2 5 7 10.5 7 1 0 2-.2 2.9-.5" />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await register({
        name,
        email,
        password,
        confirmPassword,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.replace("/verify-email");
    } catch {
      setError("Unable to create your account. Please try again.");
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
      <div style={{ width: "100%", maxWidth: "460px" }}>
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
              Create your account
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "var(--muted)",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Set up your account and start using Lexora.
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
              <span style={{ fontSize: "14px", fontWeight: 600 }}>
                Full Name
              </span>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>
                Confirm Password
              </span>

              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  title={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EyeIcon hidden={showConfirmPassword} />
                </button>
              </div>
            </label>

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
              {loading ? "Creating Account..." : "Create Account"}
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
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "#60a5fa",
                fontWeight: 700,
              }}
            >
              Sign In
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
