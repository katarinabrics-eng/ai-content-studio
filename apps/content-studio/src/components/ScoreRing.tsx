"use client";

import { useEffect, useState } from "react";
import { tokens } from "@/lib/design-tokens";

const SCORE_BANDS = [
  { max: 40, color: tokens.colors.error, label: "Slabé podklady" },
  { max: 69, color: tokens.colors.warning, label: "Potřebuje doplnění" },
  { max: 89, color: tokens.colors.success, label: "Dobrý základ" },
  { max: 100, color: tokens.colors.primary, label: "Výborný základ" },
] as const;

function getBand(score: number) {
  const clamped = Math.min(100, Math.max(0, score));
  return SCORE_BANDS.find((b) => clamped <= b.max) ?? SCORE_BANDS[3];
}

const DURATION_MS = 1500;

/** Kruhové skóre 0–100: 4 pásma barev, animace čísla 0→výsledek za 1.5 s. */
export function ScoreRing({ score }: { score: number }) {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    setDisplayScore(0);
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / DURATION_MS);
      const eased = 1 - (1 - t) ** 2;
      setDisplayScore(Math.round(eased * clampedScore));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [clampedScore]);

  const { color, label } = getBand(clampedScore);
  const c = 2 * Math.PI * 40;
  const dash = (displayScore / 100) * c;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke={tokens.colors.border} strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.15s ease-out" }}
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
          <span style={{ fontSize: 22, fontWeight: 700, color }}>{displayScore}</span>
          <span style={{ fontSize: 9, color: tokens.colors.muted }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}
