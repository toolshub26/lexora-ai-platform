"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: ErrorProps) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--background)",
          color: "var(--foreground)",
          fontFamily: "Inter, Arial, sans-serif",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            width: "100%",
            textAlign: "center",
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "16px",
            padding: "2.5rem",
            boxShadow: "0 12px 40px rgba(0,0,0,.35)",
          }}
        >
          <h1
            className="gradient-text"
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              marginBottom: "1rem",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.8,
              marginBottom: "2rem",
            }}
          >
            An unexpected error occurred while loading Lexora AI.
            Please try again. If the problem continues, contact support.
          </p>

          {process.env.NODE_ENV === "development" && (
            <pre
              style={{
                textAlign: "left",
                overflowX: "auto",
                background: "#0b1220",
                padding: "1rem",
                borderRadius: "10px",
                fontSize: "0.85rem",
                marginBottom: "2rem",
              }}
            >
              {error.message}
            </pre>
          )}

          <button
            onClick={reset}
            style={{
              padding: "14px 28px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
