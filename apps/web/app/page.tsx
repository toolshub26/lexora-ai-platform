export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div className="container">
        <h1
          className="gradient-text"
          style={{
            fontSize: "3rem",
            fontWeight: 800,
            marginBottom: "1rem",
          }}
        >
          Lexora AI
        </h1>

        <p
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            color: "var(--muted)",
            fontSize: "1.15rem",
            lineHeight: 1.8,
          }}
        >
          Enterprise AI Legal Platform powered by OpenAI, Gemini, Claude,
          Grok and DeepSeek.
        </p>

        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              background: "var(--primary)",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: 600,
            }}
          >
            Get Started
          </button>

          <button
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid var(--card-border)",
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: 600,
            }}
          >
            Documentation
          </button>
        </div>

        <div
          style={{
            marginTop: "4rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "1rem",
          }}
        >
          {[
            "OpenAI",
            "Gemini",
            "Claude",
            "Grok",
            "DeepSeek",
            "Legal Automation",
          ].map((item) => (
            <div key={item} className="card" style={{ padding: "1.5rem" }}>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
