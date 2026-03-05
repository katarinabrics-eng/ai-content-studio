"use client";

const C = {
  lime: "#c8ff00",
  purple: "#b57bee",
  pink: "#f06ba8",
  bg0: "#080808",
  bg2: "#141414",
  border: "#1f1f1f",
  muted: "#888",
};

export type AIDoporuceniStrategist = {
  id: string;
  label: string;
  fit: number;
  reason: string;
  color: string;
};

type Props = {
  strategists?: AIDoporuceniStrategist[];
  onSpustit?: (strategistId: string) => void;
  loading?: boolean;
};

export default function AIDoporuceni({ strategists = [], onSpustit, loading = false }: Props) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
      {/* Header */}
      <div style={{ padding: "10px 16px", background: "#0f0f0f", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: C.purple, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em" }}>
          AI DOPORUČUJE PRO TUTO ZNAČKU
        </span>
      </div>

      {/* Karty */}
      <div style={{ padding: 16, background: C.bg0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {strategists.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", fontSize: 11, color: C.muted }}>Žádné doporučení. Spusťte diagnostiku.</div>
        ) : (
          strategists.map((s) => (
            <div
              key={s.id}
              style={{
                padding: 16,
                borderRadius: 10,
                background: C.bg2,
                border: `1px solid ${s.color}28`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Fit badge */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: s.color,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderBottomLeftRadius: 8,
                }}
              >
                {s.fit}% shoda
              </div>

              {/* Název */}
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8, paddingRight: 80 }}>
                {s.label}
              </div>

              {/* Důvod */}
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>{s.reason}</div>

              {/* Tlačítko */}
              <button
                type="button"
                onClick={() => onSpustit?.(s.id)}
                disabled={loading}
                style={{
                  padding: "6px 16px",
                  borderRadius: 7,
                  border: `1px solid ${s.color}70`,
                  background: "transparent",
                  color: s.color,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "◈ Generuji strategii…" : "Spustit →"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
