"use client";

interface BrandIdentityCardProps {
  colorPalette: string[];
  typography?: { primary?: string; secondary?: string };
  tone: string;
}

const FALLBACK_COLORS = ["#2C1A1A", "#8B4513", "#D4A853"];
const TONE_TAGS = ["Vzdělávací", "Přímý", "Přívětivý", "Odborný"];

export function BrandIdentityCard({
  colorPalette,
  typography,
  tone,
}: BrandIdentityCardProps) {
  const colors =
    colorPalette.length >= 3 ? colorPalette.slice(0, 3) : FALLBACK_COLORS;
  const tones = tone
    ? tone
        .split(",")
        .map((t) => t.trim())
        .slice(0, 4)
    : TONE_TAGS;

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
          marginBottom: 16,
        }}
      >
        Brand identita
      </div>

      {/* Color palette */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div
              style={{
                height: 48,
                background: c,
                borderRadius: 8,
                marginBottom: 4,
              }}
            />
            <div style={{ fontSize: 9, color: "#aaa", textAlign: "center" }}>
              {c}
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            background: "#f5f2ec",
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              fontSize: 8,
              color: "#bbb",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Primární font
          </div>
          <div
            style={{ fontFamily: "Georgia, serif", fontSize: 19, color: "#111" }}
          >
            {typography?.primary ?? "Georgia"}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            background: "#f5f2ec",
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              fontSize: 8,
              color: "#bbb",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Sekundární
          </div>
          <div style={{ fontFamily: "sans-serif", fontSize: 15, color: "#555" }}>
            {typography?.secondary ?? "DM Sans"}
          </div>
        </div>
      </div>

      {/* Tone tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tones.map((t, i) => (
          <span
            key={i}
            style={{
              background: i === 0 ? "#f0fce0" : "transparent",
              color: i === 0 ? "#3d6b00" : "#555",
              border: `1px solid ${i === 0 ? "#b7e94c" : "#e8e4dc"}`,
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 10,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
