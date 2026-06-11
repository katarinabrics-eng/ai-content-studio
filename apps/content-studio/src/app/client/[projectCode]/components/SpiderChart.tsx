"use client";

interface SpiderChartProps {
  scores: {
    light: number;
    energy: number;
    architecture: number;
    identity: number;
    trust: number;
  };
}

export function SpiderChart({ scores }: SpiderChartProps) {
  const cx = 120,
    cy = 110,
    r = 80;
  const angles = [270, 342, 54, 126, 198]; // light, energy, architecture, trust, identity
  const keys: Array<keyof typeof scores> = [
    "light",
    "energy",
    "architecture",
    "trust",
    "identity",
  ];
  const labels = ["Světlo", "Energie", "Architektura", "Důvěra", "Identita"];

  const toPoint = (angle: number, radius: number) => {
    const a = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const grid = [0.3, 0.6, 1.0].map((factor) =>
    angles.map((a) => toPoint(a, r * factor))
  );

  const dataPoints = keys.map((k, i) =>
    toPoint(angles[i], (scores[k] / 10) * r)
  );
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") +
    " Z";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e8e4dc",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#aaa",
          marginBottom: 12,
          alignSelf: "flex-start",
        }}
      >
        Spider Chart
      </div>
      <svg width="240" height="220" viewBox="0 0 240 220">
        {/* Grid */}
        {grid.map((pts, gi) => (
          <polygon
            key={gi}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={["#e8e4dc", "#ede9e0", "#f0ece4"][gi]}
            strokeWidth="1"
          />
        ))}
        {/* Axes */}
        {angles.map((a, i) => {
          const pt = toPoint(a, r);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="#f0ece4"
              strokeWidth="1"
            />
          );
        })}
        {/* Data */}
        <path
          d={dataPath}
          fill="rgba(183,233,76,0.18)"
          stroke="#b7e94c"
          strokeWidth="2"
        />
        {/* Points */}
        {dataPoints.map((p, i) => {
          const s = scores[keys[i]];
          const color =
            s >= 8 ? "#5a8a00" : s >= 5 ? "#f59e0b" : "#ef4444";
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="5"
              fill={color}
              stroke="#fff"
              strokeWidth="1.5"
            />
          );
        })}
        {/* Labels */}
        {angles.map((a, i) => {
          const pt = toPoint(a, r + 18);
          return (
            <text
              key={i}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="#999"
            >
              {labels[i]} {scores[keys[i]]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
