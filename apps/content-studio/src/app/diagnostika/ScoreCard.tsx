"use client";

import { ScoreRing } from "@/components/ScoreRing";
import { tokens } from "@/lib/design-tokens";

const cardStyle: React.CSSProperties = {
  background: tokens.colors.card,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: 16,
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
    color: tokens.colors.muted,
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
              borderRadius: 12,
              border: `1px solid ${tokens.colors.border}`,
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
          {url && <p style={{ fontSize: 12, color: tokens.colors.muted, marginBottom: 4 }}>{url}</p>}
          {subtitle && <p style={{ fontSize: 14, color: tokens.colors.text, fontWeight: 600, marginBottom: 4 }}>{subtitle}</p>}
          {hint && <p style={{ fontSize: 12, color: tokens.colors.muted }}>{hint}</p>}
        </div>
      </div>
    </>
  );
}
