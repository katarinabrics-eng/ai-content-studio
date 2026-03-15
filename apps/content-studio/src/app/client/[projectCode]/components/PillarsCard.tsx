"use client";
import { useEffect, useRef, useState } from "react";

interface PillarData {
  score?: number;
  interpretation?: string;
  strategicOpportunity?: string;
}
interface PillarsCardProps {
  pillarAnalysis?: Record<string, PillarData>;
}

const PILLARS = [
  { key: "light", label: "💡 Světlo", sub: "Clarity of Value" },
  { key: "energy", label: "⚡ Energie", sub: "Brand Vitality" },
  { key: "architecture", label: "🏛 Architektura", sub: "Strategic Structure" },
  { key: "identity", label: "🎯 Identita", sub: "Visual Identity" },
  { key: "trust", label: "🤝 Důvěra", sub: "Social Proof" },
];

function PillarRow({
  label,
  sub,
  score,
}: {
  label: string;
  sub: string;
  score: number;
}) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setWidth((score / 10) * 100), 100);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [score]);

  const color =
    score >= 8 ? "#5a8a00" : score >= 5 ? "#f59e0b" : "#ef4444";

  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 5,
        }}
      >
        <span style={{ fontSize: 13, color: "#333", flex: 1 }}>{label}</span>
        <span style={{ fontSize: 9, color: "#bbb", marginRight: 6 }}>{sub}</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color,
            minWidth: 18,
            textAlign: "right",
          }}
        >
          {score}
        </span>
      </div>
      <div
        style={{
          background: "#ede9e0",
          height: 7,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 4,
            background: color,
            width: `${width}%`,
            transition: "width 800ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

export function PillarsCard({ pillarAnalysis }: PillarsCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e8e4dc",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#aaa",
          marginBottom: 18,
        }}
      >
        Pilíře značky
      </div>
      {PILLARS.map((p) => (
        <PillarRow
          key={p.key}
          label={p.label}
          sub={p.sub}
          score={pillarAnalysis?.[p.key]?.score ?? 5}
        />
      ))}
    </div>
  );
}
