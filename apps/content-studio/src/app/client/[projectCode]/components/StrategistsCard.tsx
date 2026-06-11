"use client";

interface StrategistRef {
  id: string;
  label: string;
  fit_score?: number;
  reason?: string;
}
interface StrategistsCardProps {
  strategistIds: StrategistRef[];
}

const STRATEGIST_DETAILS: Record<
  string,
  { emoji: string; desc: string; when: string }
> = {
  the_architect: {
    emoji: "🏗",
    desc: "Vytvoří neodolatelnou nabídku postavenou na hodnotovém vzorci. Identifikuje co zákazník skutečně kupuje — výsledek, ne produkt.",
    when: "Slabá konverze, zákazníci nerozumí hodnotě, cena se zdá vysoká.",
  },
  ilumina: {
    emoji: "✨",
    desc: "Mistryně příběhu a jasného sdělení. Pomůže vám komunikovat tak, aby zákazník okamžitě pochopil vaši hodnotu.",
    when: "Nejasná komunikace, slabý brand story, nízká angažovanost.",
  },
  impuls: {
    emoji: "⚡",
    desc: "Mistr energie, dosahu a viditelnosti. Zaměří se na obsah který šíří a zvyšuje dosah vaší značky.",
    when: "Nízký dosah, malé povědomí, potřeba virálního obsahu.",
  },
  katalyzator: {
    emoji: "🔥",
    desc: "Mistr emoce, transformace a prodeje. Propojí zákazníka s vaší značkou na hlubší úrovni.",
    when: "Slabé propojení se zákazníkem, nízká loajalita, potřeba transformace.",
  },
  signal: {
    emoji: "📡",
    desc: "Mistr hlasu, niche a permission marketingu. Pomůže vám najít váš jedinečný hlas a cílovou skupinu.",
    when: "Nejasné pozicování, velká konkurence, hledání niche.",
  },
  content_strategist: {
    emoji: "✍",
    desc: "Hlas a příběh značky — texty, bio, claims. Převede vaše Brand DNA do konkrétních textů.",
    when: "Potřeba textového obsahu, bio, webových textů nebo social copy.",
  },
  the_illuminator: {
    emoji: "✨",
    desc: "Mistryně příběhu a jasného sdělení. Pomůže vám komunikovat tak, aby zákazník okamžitě pochopil vaši hodnotu.",
    when: "Nejasná komunikace, slabý brand story, nízká angažovanost.",
  },
  the_pulse: {
    emoji: "⚡",
    desc: "Mistr energie, dosahu a viditelnosti. Zaměří se na obsah který šíří a zvyšuje dosah vaší značky.",
    when: "Nízký dosah, malé povědomí, potřeba virálního obsahu.",
  },
  the_catalyst: {
    emoji: "🔥",
    desc: "Mistr emoce, transformace a prodeje. Propojí zákazníka s vaší značkou na hlubší úrovni.",
    when: "Slabé propojení se zákazníkem, nízká loajalita, potřeba transformace.",
  },
  the_signal: {
    emoji: "📡",
    desc: "Mistr hlasu, niche a permission marketingu. Pomůže vám najít váš jedinečný hlas a cílovou skupinu.",
    when: "Nejasné pozicování, velká konkurence, hledání niche.",
  },
  the_content_voice: {
    emoji: "✍",
    desc: "Hlas a příběh značky — texty, bio, claims. Převede vaše Brand DNA do konkrétních textů.",
    when: "Potřeba textového obsahu, bio, webových textů nebo social copy.",
  },
  the_pathfinder: {
    emoji: "🗺",
    desc: "Mistryně funnelu, cesty a konverze. Zmapuje cestu zákazníka a navrhne Value Ladder.",
    when: "Nízká konverze, nejasná cesta zákazníka, potřeba funnel architektury.",
  },
  the_luminary: {
    emoji: "🌟",
    desc: "Mistryně ženské osobní značky a komunity. Rozvinutí autentické autority.",
    when: "Budování osobní značky, komunity a autentické autority.",
  },
  the_horizon: {
    emoji: "🔭",
    desc: "Stratég trendů a pozicování pro 2026+. AI integrace a 12měsíční roadmapa.",
    when: "Potřeba dlouhodobé strategie a připravenosti na trendy.",
  },
};

export function StrategistsCard({ strategistIds }: StrategistsCardProps) {
  const items = strategistIds.slice(0, 2);

  if (items.length === 0) {
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
            marginBottom: 14,
          }}
        >
          Doporučení stratégové
        </div>
        <div style={{ fontSize: 13, color: "#bbb" }}>
          Spusťte diagnostiku pro doporučení stratégů.
        </div>
      </div>
    );
  }

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
          marginBottom: 14,
        }}
      >
        Doporučení stratégové
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      >
        {items.map((s, i) => {
          const detail = STRATEGIST_DETAILS[s.id] ?? {
            emoji: "🧠",
            desc: s.reason ?? "",
            when: "",
          };
          const isPrimary = i === 0;
          return (
            <div
              key={s.id}
              style={{
                background: isPrimary ? "#f0fce0" : "#f5f2ec",
                border: `1px solid ${isPrimary ? "#d4f0a0" : "#e8e4dc"}`,
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div
                style={{ display: "flex", gap: 16, marginBottom: 12 }}
              >
                <span style={{ fontSize: 28 }}>{detail.emoji}</span>
                <div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: isPrimary ? "#3d6b00" : "#bbb",
                      lineHeight: 1,
                    }}
                  >
                    {s.fit_score ?? 80}%
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isPrimary ? "#111" : "#aaa",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: isPrimary ? "#555" : "#bbb",
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {detail.desc}
              </div>
              {detail.when && (
                <div
                  style={{
                    fontSize: 11,
                    color: isPrimary ? "#5a8a00" : "#ccc",
                    background: isPrimary ? "#fff" : "transparent",
                    borderRadius: 8,
                    padding: isPrimary ? "8px 10px" : "0",
                    borderLeft: isPrimary ? "3px solid #b7e94c" : "none",
                    marginBottom: 12,
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Kdy:</strong> {detail.when}
                </div>
              )}
              <button
                disabled={!isPrimary}
                style={{
                  background: isPrimary ? "#111" : "#e8e4dc",
                  color: isPrimary ? "#fff" : "#aaa",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 20px",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: isPrimary ? "pointer" : "default",
                  fontFamily: "inherit",
                }}
              >
                Spustit strategii →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
