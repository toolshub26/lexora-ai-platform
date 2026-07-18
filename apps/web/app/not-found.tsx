import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "700px",
        }}
      >
        <h1
          className="gradient-text"
          style={{
            fontSize: "5rem",
            fontWeight: 900,
            marginBottom: "1rem",
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            color: "var(--muted)",
            lineHeight: 1.8,
            marginBottom: "2rem",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            background: "var(--primary)",
            color: "#fff",
            borderRadius: "12px",
            fontWeight: 600,
          }}
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
