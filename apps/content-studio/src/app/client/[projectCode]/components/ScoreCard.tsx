"use client";
import { useEffect, useState } from "react";

interface ScoreCardProps {
  score: number;
  persona: string;
  topPillar: string;
  weakPillar: string;
}

export function ScoreCard({
  score,
  persona,
  topPillar,
  weakPillar,
}: ScoreCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(ease * score));
      setProgress(ease * score);
      if (t < 1) requestAnimationFrame(animate);
    };
    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const r = 58;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e8e4dc",
        padding: "28px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg
          width="140"
          height="140"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="#ede9e0"
            strokeWidth="12"
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="#b7e94c"
            strokeWidth="12"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
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
          <span
            style={{ fontSize: 34, fontWeight: 700, color: "#111", lineHeight: 1 }}
          >
            {displayed}
          </span>
          <span style={{ fontSize: 13, color: "#aaa" }}>/100</span>
        </div>
      </div>
      <div
        style={{
          background: "#f0fce0",
          color: "#3d6b00",
          fontSize: 12,
          padding: "5px 18px",
          borderRadius: 20,
          fontWeight: 600,
          letterSpacing: "0.05em",
          border: "1px solid #d4f0a0",
        }}
      >
        {persona}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#aaa",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: "#5a8a00" }}>↑ Silná {topPillar}</span>
        {"  ·  "}
        <span style={{ color: "#f59e0b" }}>↓ Slabá {weakPillar}</span>
      </div>
    </div>
  );
}
