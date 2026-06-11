"use client";

interface BrandVoiceCardProps {
  keyMessages: string[];
}

export function BrandVoiceCard({ keyMessages }: BrandVoiceCardProps) {
  const msgs = keyMessages.slice(0, 4);
  while (msgs.length < 4) msgs.push("Vaše sdělení bude doplněno po dokončení strategie.");

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
        Hlas značky
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {msgs.map((msg, i) => (
          <div
            key={i}
            style={{
              borderLeft: `3px solid ${i === 0 ? "#b7e94c" : "#e8e4dc"}`,
              background: i === 0 ? "#f8fdf0" : "#f5f2ec",
              padding: "12px 16px",
              borderRadius: "0 10px 10px 0",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: i === 0 ? 14 : 13,
              color: i === 0 ? "#222" : "#777",
              lineHeight: 1.6,
            }}
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
