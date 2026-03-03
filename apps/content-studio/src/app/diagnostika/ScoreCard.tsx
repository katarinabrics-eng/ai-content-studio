"use client";

import { ScoreRing } from "@/components/ScoreRing";

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: 20,
  marginBottom: 12,
};

/** Kruhové skóre + krátký text (co bylo zjištěno / doplňte výběrem). */
export function ScoreCard({
  score,
  url,
  subtitle,
  hint,
  screenshot,
}: {
  score: number;
  url?: string;
  subtitle?: string;
  hint?: string;
  screenshot?: string | null;
}) {
  const lblStyle: React.CSSProperties = {
    fontSize: 9,
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    marginBottom: 5,
    display: "block",
  };
  return (
    <>
      {screenshot && (
        <div style={{ ...cardStyle, padding: 10, marginBottom: 12 }}>
          <span style={lblStyle}>Náhled webu</span>
          <img
            src={screenshot.startsWith("data:") ? screenshot : `data:image/png;base64,${screenshot}`}
            alt="screenshot webu"
            style={{
              width: "100%",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.05)",
              maxHeight: 200,
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        </div>
      )}
      <div style={{ ...cardStyle, display: "flex", gap: 18, alignItems: "center" }}>
        <ScoreRing score={score} />
        <div>
          {url && <p style={{ fontSize: 12, color: "#333", marginBottom: 4 }}>{url}</p>}
          {subtitle && <p style={{ fontSize: 14, color: "#ccc", fontWeight: 600, marginBottom: 4 }}>{subtitle}</p>}
          {hint && <p style={{ fontSize: 12, color: "#444" }}>{hint}</p>}
        </div>
      </div>
    </>
  );
}
