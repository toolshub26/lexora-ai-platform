"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  auth,
  refreshEmailVerificationStatus,
  verifyEmail,
} from "@/features/auth";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const checkVerification = useCallback(async () => {
    setChecking(true);
    setError("");

    try {
      const verified = await refreshEmailVerificationStatus();

      if (verified) {
        router.replace("/dashboard");
        return;
      }

      setMessage(
        "Your email is not verified yet. Please check your inbox.",
      );
    } catch {
      setError("Unable to check verification status.");
    } finally {
      setChecking(false);
    }
  }, [router]);
  async function resendVerification() {
    setSending(true);
    setMessage("");
    setError("");

    try {
      await verifyEmail();

      setMessage(
        "A new verification email has been sent.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send verification email.",
      );
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/login");
      return;
    }

    void checkVerification();
  }, [router, checkVerification]);

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
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          textAlign: "center",
        }}
      >
        <h1>Verify Your Email</h1>

        <p>
          We sent a verification link to your email address.
        </p>

        <p>
          Please verify your email before continuing.
        </p>

        {checking && <p>Checking verification status...</p>}

        {message && (
          <p style={{ color: "green" }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={checkVerification}
          disabled={checking}
        >
          {checking
            ? "Checking..."
            : "I Have Verified My Email"}
        </button>

        <button
          type="button"
          onClick={resendVerification}
          disabled={sending}
        >
          {sending
            ? "Sending..."
            : "Resend Verification Email"}
        </button>

        <Link href="/login">
          Back to Login
        </Link>
      </div>
    </main>
  );
}
