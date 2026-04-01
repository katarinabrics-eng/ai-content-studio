"use client";

import { useState } from "react";
import { ScoreRing } from "@/components/ScoreRing";
import type { ScanResult, BrandDna, BrandScore } from "@/app/start/ScanResultScrollExperience";
import { tokens } from "@/lib/design-tokens";

const TABS = [
  { id: "brand-dna", label: "Brand DNA" },
  { id: "persony", label: "Cílové persony" },
  { id: "content", label: "Content strategie" },
  { id: "funnel", label: "Funnel mapa" },
  { id: "kalendar", label: "30denní kalendář" },
  { id: "kpi", label: "KPI & metriky" },
  { id: "vizual", label: "Vizuální brief" },
  { id: "predpoklady", label: "Předpoklady agenta" },
] as const;

const sectionStyle: React.CSSProperties = {
  background: tokens.colors.card,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: 16,
  padding: 20,
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  color: tokens.colors.muted,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: 6,
  display: "block",
};

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 13, color: tokens.colors.text, lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function BrandDnaTab({ result }: { result: ScanResult }) {
  const d: BrandDna | undefined = result.brandDna;
  const s: BrandScore | undefined = result.brandScore;
  const total = Math.min(100, Math.max(0, result.brandScore?.total ?? 0));

  return (
    <div className="space-y-4">
      <div style={{ ...sectionStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <ScoreRing score={total} />
      </div>
      <div style={sectionStyle}>
        <span style={labelStyle}>Co jsme našli</span>
        <ul style={{ fontSize: 13, color: tokens.colors.text, listStyle: "disc", paddingLeft: 20 }}>
          {s?.hasHeadline && <li>Positioning / hlavní zpráva</li>}
          {s?.hasOffer && <li>Definovaná nabídka</li>}
          {s?.hasTargetAudience && <li>Cílová skupina</li>}
          {s?.hasCTA && <li>Výzva k akci</li>}
          {s?.hasVisualIdentity && <li>Vizuální identita</li>}
          {s?.hasSocialProof && <li>Reference / důkazy</li>}
        </ul>
      </div>
      <div style={sectionStyle}>
        <Row label="Název" value={d?.name} />
        <Row label="Positioning" value={d?.positioning} />
        <Row label="Tón" value={d?.tone} />
        <Row label="Cílová skupina" value={d?.targetAudience} />
        <Row label="Unikátní hodnota" value={d?.uniqueValue} />
        {d?.contentPillars && d.contentPillars.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={labelStyle}>Obsahové pilíře</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {d.contentPillars.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    background: `${tokens.colors.muted}20`,
                    border: `1px solid ${tokens.colors.border}`,
                    color: tokens.colors.muted,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
        {d?.missingElements && d.missingElements.length > 0 && (
          <div>
            <div style={labelStyle}>Co posílí brand</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {d.missingElements.map((m) => (
                <span
                  key={m}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    background: `${tokens.colors.error}18`,
                    border: `1px solid ${tokens.colors.error}40`,
                    color: tokens.colors.error,
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {result.summary && (
        <div style={{ ...sectionStyle, borderColor: `${tokens.colors.primary}30`, background: `${tokens.colors.primary}08` }}>
          <span style={labelStyle}>Hodnocení stratéga</span>
          <p style={{ fontSize: 13, color: tokens.colors.text, lineHeight: 1.7 }}>{result.summary}</p>
        </div>
      )}
    </div>
  );
}

function PlaceholderTab() {
  return (
    <div style={sectionStyle}>
      <p style={{ fontSize: 14, color: tokens.colors.muted }}>
        Tato sekce bude k dispozici po vygenerování kompletní strategie.
      </p>
    </div>
  );
}

function PredpokladyTab() {
  return (
    <div
      style={{
        ...sectionStyle,
        borderColor: "#f59e0b40",
        background: "#f59e0b0c",
      }}
    >
      <span style={{ ...labelStyle, color: "#f59e0b" }}>Transparentnost</span>
      <p style={{ fontSize: 13, color: tokens.colors.text, lineHeight: 1.6 }}>
        Zde uvidíte, jaké předpoklady agent použil při sestavování strategie (zdroje dat, interpretace). Sekce bude doplněna po zapojení generování strategie.
      </p>
    </div>
  );
}

/** Tabbed výstup strategie: 8 sekcí, Brand DNA z result, zbytek placeholder. Předpoklady agenta = amber. */
export function StrategyOutput({
  result,
  projectId,
  onBack,
}: {
  result: ScanResult;
  projectId: string | null;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.colors.bg,
        color: tokens.colors.text,
        fontFamily: tokens.font,
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: `1px solid ${tokens.colors.border}`,
          background: `${tokens.colors.bg}ee`,
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: tokens.colors.muted,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          ← Analyzovat jiný web
        </button>
        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: tokens.colors.muted }}>
          Strategický výstup
        </span>
      </header>

      <div
        style={{
          overflowX: "auto",
          padding: "12px 16px",
          borderBottom: `1px solid ${tokens.colors.border}`,
          display: "flex",
          gap: 4,
          flexWrap: "nowrap",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flexShrink: 0,
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: activeTab === tab.id ? tokens.colors.primary : "transparent",
              color: activeTab === tab.id ? "#000" : tokens.colors.muted,
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ padding: "20px 16px 100px", maxWidth: 720, margin: "0 auto" }}>
        {activeTab === "brand-dna" && <BrandDnaTab result={result} />}
        {activeTab === "predpoklady" && <PredpokladyTab />}
        {!["brand-dna", "predpoklady"].includes(activeTab) && <PlaceholderTab />}
      </main>

      <footer
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          borderTop: `1px solid ${tokens.colors.border}`,
          background: `${tokens.colors.bg}ee`,
          backdropFilter: "blur(8px)",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {projectId ? (
          <span style={{ fontSize: 12, color: tokens.colors.success, display: "flex", alignItems: "center" }}>
            ✓ Uloženo do projektu
          </span>
        ) : (
          <span style={{ fontSize: 12, color: tokens.colors.muted }}>Výsledek byl uložen při dokončení analýzy.</span>
        )}
        {projectId && (
          <a
            href={`/api/admin/projects/${projectId}/export-plan`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 18px",
              background: tokens.colors.card,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 10,
              color: tokens.colors.text,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Stáhnout plán (TXT)
          </a>
        )}
      </footer>
    </div>
  );
}
