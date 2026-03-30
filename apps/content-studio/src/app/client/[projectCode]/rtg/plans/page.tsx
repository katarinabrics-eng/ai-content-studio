"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const PLANS = [
  {
    id: "start",
    name: "Start",
    tagline: "Vezmi a použij.",
    price: 2900,
    video: 2,
    grafika: 8,
    carousel: null as number | null,
    features: [
      "AI zpracování nahraného videa",
      "Hook + grafika overlay",
      "Střih na max 45s",
      "2 varianty každého příspěvku",
      "Klientský portál pro schvalování",
      "Vizuální banka",
    ],
    featured: false,
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "Nahraješ → dostaneš.",
    price: 4900,
    video: 4,
    grafika: 16,
    carousel: 4,
    features: [
      "Vše ze Start",
      "Prioritní zpracování",
      "Analytika — co fungovalo",
      "Vlastní brand šablony",
      "Archiv schváleného obsahu",
    ],
    featured: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Maximální výstup.",
    price: 7900,
    video: 8,
    grafika: 30,
    carousel: 8,
    features: [
      "Vše z Plus",
      "AI klientský agent",
      "Google Drive sync",
      "Dedikovaný account manager",
      "Download ZIP každý měsíc",
    ],
    featured: false,
  },
] as const;

function PlansInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectCode = params.projectCode as string;
  const token = searchParams.get("token") ?? "";
  const t = token ? `?token=${encodeURIComponent(token)}` : "";

  // Aktuální plán klienta — Start je výchozí
  const currentPlan = "start";

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 60px" }}>
      {/* Zpět */}
      <Link
        href={`/client/${projectCode}/rtg${t}`}
        style={{
          fontSize: 13,
          color: "#888",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          marginBottom: 32,
        }}
      >
        ← Zpět na obsah
      </Link>

      {/* Nadpis */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32,
            fontWeight: 800,
            color: "#111",
            margin: "0 0 8px",
          }}
        >
          Plány a obsah
        </h1>
        <p style={{ fontSize: 15, color: "#666", margin: 0, lineHeight: 1.6 }}>
          Každý měsíc nový obsah připravený k publikaci.
        </p>
      </div>

      {/* Pricing karty */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              style={{
                background: "#fff",
                border: plan.featured ? "2px solid #b7e94c" : "1px solid #e8e4dc",
                borderRadius: 14,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Badge Nejoblíbenější */}
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -13,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#b7e94c",
                    color: "#111",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}
                >
                  Nejoblíbenější
                </div>
              )}

              {/* Název + tagline */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#aaa",
                    marginBottom: 4,
                  }}
                >
                  {plan.name}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>{plan.tagline}</div>
              </div>

              {/* Cena */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 38,
                    fontWeight: 800,
                    color: "#111",
                    lineHeight: 1,
                  }}
                >
                  {plan.price.toLocaleString("cs-CZ")}
                </span>
                <span style={{ fontSize: 13, color: "#aaa" }}>Kč / měsíc</span>
              </div>

              {/* Počty */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: "#eff8ff",
                    color: "#2563eb",
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  ▶ {plan.video} videa
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: "#f0fdf4",
                    color: "#16a34a",
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  ◻ {plan.grafika} grafik
                </span>
                {plan.carousel != null && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#fefce8",
                      color: "#854d0e",
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    ◻ {plan.carousel} carousely
                  </span>
                )}
              </div>

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: 1,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 13,
                      color: "#444",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        color: "#b7e94c",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✔
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "12px 20px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    background: "#f5f3ee",
                    color: "#aaa",
                    border: "1px solid #e8e4dc",
                  }}
                >
                  Aktuální plán
                </div>
              ) : (
                <button
                  onClick={() =>
                    alert(
                      `Zájem o plán ${plan.name} — brzy dostupné. Napište nám na studio@lucifera.cz`
                    )
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    padding: "12px 20px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: plan.featured ? "#b7e94c" : "#f5f3ee",
                    color: plan.featured ? "#111" : "#555",
                    border: plan.featured ? "none" : "1px solid #e8e4dc",
                  }}
                >
                  {plan.id === "plus" ? "Začít s Plus →" : "Přejít na Pro →"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#aaa",
          marginTop: 28,
          lineHeight: 1.6,
        }}
      >
        Ceny bez DPH · bez závazku · zrušení kdykoliv · ozveme se do 24 hodin
      </p>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: "2px solid #e8e4dc",
              borderTopColor: "#b7e94c",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <PlansInner />
    </Suspense>
  );
}
