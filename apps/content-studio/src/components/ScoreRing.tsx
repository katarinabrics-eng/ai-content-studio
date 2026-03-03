"use client";

/** Kruhové skóre 0–100 s barevným rozlišením a popiskem. */
export function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#a8e063" : score >= 40 ? "#f5c842" : "#e05a5a";
  const label = score >= 70 ? "Silná značka" : score >= 40 ? "Potřebuje doplnění" : "Slabé podklady";
  const c = 2 * Math.PI * 40;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a28" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * c} ${c}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color }}>{score}</span>
          <span style={{ fontSize: 9, color: "#444" }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}
