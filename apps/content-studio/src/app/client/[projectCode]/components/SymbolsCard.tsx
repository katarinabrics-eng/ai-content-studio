"use client";

interface SymbolsCardProps {
  archetype: string;
  brandDna?: Record<string, unknown>;
}

const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
  Mistr: ["Excelence", "Expertise", "Výsledky"],
  Tvůrce: ["Inovace", "Originalita", "Tvorba"],
  Průkopník: ["Vize", "Odvaha", "Nové cesty"],
  Autorita: ["Důvěra", "Zkušenost", "Vedení"],
  Spojka: ["Komunita", "Propojení", "Sdílení"],
  Vizionář: ["Strategie", "Budoucnost", "Design"],
};

const DEFAULT_SYMBOLS = [
  { emoji: "🌱", name: "Růst", desc: "Kontinuální rozvoj a zlepšování" },
  { emoji: "💎", name: "Hodnota", desc: "Prémiová kvalita a výsledky" },
  { emoji: "🔑", name: "Přístup", desc: "Klíč k transformaci klienta" },
];

export function SymbolsCard({ archetype, brandDna }: SymbolsCardProps) {
  void brandDna;
  const keywords = ARCHETYPE_KEYWORDS[archetype] ?? ["Autenticita", "Hodnota", "Růst"];

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
        Symboly značky
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr) auto",
          gap: 10,
        }}
      >
        {DEFAULT_SYMBOLS.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#f5f2ec",
              border: "1px solid #e8e4dc",
              borderRadius: 12,
              padding: "16px 14px",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.emoji}</div>
            <div
              style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 4 }}
            >
              {s.name}
            </div>
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>
              {s.desc}
            </div>
          </div>
        ))}
        {/* Archetype card */}
        <div
          style={{
            background: "#f0fce0",
            border: "1px solid #d4f0a0",
            borderRadius: 12,
            padding: "16px 14px",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🧭</div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#3d6b00",
              marginBottom: 6,
            }}
          >
            {archetype}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {keywords.map((k, i) => (
              <span
                key={i}
                style={{
                  fontSize: 9,
                  background: "#fff",
                  color: "#5a8a00",
                  border: "1px solid #b7e94c",
                  borderRadius: 10,
                  padding: "2px 7px",
                }}
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
