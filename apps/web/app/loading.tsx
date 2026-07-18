export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            border: "6px solid rgba(255,255,255,0.15)",
            borderTop: "6px solid var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
          }}
        >
          Lexora AI
        </h2>

        <p
          style={{
            color: "var(--muted)",
          }}
        >
          Loading Enterprise AI Platform...
        </p>

        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </main>
  );
}
