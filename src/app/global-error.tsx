"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "'DM Sans', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif",
          backgroundColor: "#fafafa",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            Oops
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#999",
              marginTop: 8,
              marginBottom: 32,
            }}
          >
            Something went wrong. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: "#1a1a1a",
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
