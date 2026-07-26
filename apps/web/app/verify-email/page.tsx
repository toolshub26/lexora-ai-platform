"use client";

import Link from "next/link";

export default function VerifyEmailPage() {
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
          Your account has been created successfully.
        </p>

        <p>
          Please check your inbox and click the verification link before logging in.
        </p>

        <Link href="/login">
          Go to Login
        </Link>
      </div>
    </main>
  );
}
