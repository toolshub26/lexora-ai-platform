"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);

    // TODO: Connect forgot password service
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessage(
      "If an account exists, a password reset email has been sent.",
    );

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h1>Forgot Password</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>

        {message && (
          <p>{message}</p>
        )}

        <p style={{ textAlign: "center" }}>
          <Link href="/login">
            Back to Login
          </Link>
        </p>
      </form>
    </main>
  );
}
