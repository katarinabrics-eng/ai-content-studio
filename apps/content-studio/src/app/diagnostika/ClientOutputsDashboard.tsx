"use client";

import { useState, useEffect, useRef } from "react";
import type { ScanResult, PillarAnalysisItem } from "@/app/start/ScanResultScrollExperience";

export type ExtendedScanResult = ScanResult & {
  strategic_plan?: string | Record<string, unknown> | null;
  saved_strategies?: Array<{ id: string; name?: string; created_at?: string; content?: string }>;
};

const C = {
  lime: "#b4e842",
  limeDark: "#8fb82e",
  limeBg: "rgba(180,232,66,0.07)",
  limeBorder: "rgba(180,232,66,0.22)",
  black: "#111",
  dark: "#1a1a1a",
  cream: "#f5f4ef",
  sand: "#eceae3",
  white: "#fff",
  gray: "#777",
  grayLight: "#e8e6df",
  grayMid: "#ccc",
  red: "#ef4444",
  orange: "#f0b429",
  teal: "#2dd4bf",
  violet: "#a78bfa",
  r: 16,
  shadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const PILLAR_IDS = ["light", "energy", "architecture", "identity", "trust"] as const;
const PILLAR_DISPLAY: Record<string, { label: string; icon: string; sub: string }> = {
  light: { label: "Hodnota", icon: "💡", sub: "Clarity of Value" },
  energy: { label: "Energie", icon: "⚡", sub: "Brand Energy" },
  architecture: { label: "Architektura", icon: "🏛", sub: "UX & Structure" },
  identity: { label: "Identita", icon: "💎", sub: "Brand Identity" },
  trust: { label: "Důvěra", icon: "🤝", sub: "Social Proof" },
};

function getScoreColor(score: number) {
  if (score >= 8) return C.lime;
  if (score >= 5) return C.orange;
  return C.red;
}

type ClientOutputsDashboardProps = {
  result: ExtendedScanResult;
  projectName: string;
  projectCreated?: string | null;
};

export function ClientOutputsDashboard({
  result,
  projectName,
  projectCreated,
}: ClientOutputsDashboardProps) {
  const [activePage, setActivePage] = useState<"diag" | "strat" | "visual">("diag");
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [scoreAnimated, setScoreAnimated] = useState(0);
  const scoreRef = useRef<HTMLDivElement>(null);
  const [scoreVisible, setScoreVisible] = useState(false);

  const total = Math.min(100, Math.max(0, result.brandScore?.total ?? 0));
  const pillarAnalysis: Record<string, PillarAnalysisItem> = result.pillarAnalysis ?? {};
  const brandDna = result.brandDna as {
    positioning?: string;
    uniqueValue?: string;
    targetAudience?: string;
    tone?: string;
    contentPillars?: string[];
  } | undefined;
  const strategicPlan =
    typeof result.strategic_plan === "string"
      ? result.strategic_plan
      : result.strategic_plan && typeof result.strategic_plan === "object"
        ? JSON.stringify(result.strategic_plan)
        : "";
  const savedStrategies = result.saved_strategies ?? [];
  const displayName = projectName || (brandDna as { name?: string } | undefined)?.name ?? "Vaše značka";
  const datum = projectCreated
    ? new Date(projectCreated).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  useEffect(() => {
    const el = scoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setScoreVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!scoreVisible) return;
    const start = performance.now();
    const duration = 2000;
    let raf = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const elapsed = (now - start) / duration;
      const t = Math.min(elapsed, 1);
      setScoreAnimated(Math.round(total * easeOut(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scoreVisible, total]);

  const circumference = 2 * Math.PI * 65;
  const ringOffset = circumference - (circumference * scoreAnimated) / 100;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.cream, color: C.black, minHeight: "100vh" }}>
      <style>{`
        @keyframes pageIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ringAnim { to { stroke-dashoffset: var(--ring-offset, 131); } }
        .client-outputs-page { display: none; animation: pageIn 0.4s ease; }
        .client-outputs-page.active { display: block; }
      `}</style>

      {/* TOPBAR */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(245,244,239,0.96)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, letterSpacing: "0.06em", marginRight: 24 }}>
          △ <span style={{ color: C.limeDark }}>LUCIFERA</span>
        </div>
        <div style={{ fontSize: 13, color: C.gray, flex: 1, paddingLeft: 20, borderLeft: `1px solid ${C.grayLight}` }}>
          Výstup pro <strong style={{ color: C.black, fontWeight: 600 }}>{displayName}</strong> · Analýza dokončena {datum}
        </div>
        <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          {[
            { id: "diag" as const, label: "Brand Scan", icon: "📊" },
            { id: "strat" as const, label: "Strategický plán", icon: "🗺" },
            { id: "visual" as const, label: "Vizuální board", icon: "🎨" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePage(tab.id)}
              style={{
                padding: "0 20px",
                height: 56,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: activePage === tab.id ? 600 : 500,
                color: activePage === tab.id ? C.black : C.gray,
                cursor: "pointer",
                border: "none",
                background: "none",
                borderBottom: `2px solid ${activePage === tab.id ? C.limeDark : "transparent"}`,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>
        {/* PAGE 1 — DIAGNOSTIKA */}
        <div className={`client-outputs-page ${activePage === "diag" ? "active" : ""}`} id="page-diag">
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, marginBottom: 24 }} ref={scoreRef}>
            <div
              style={{
                background: C.black,
                borderRadius: C.r,
                padding: "36px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
                Index vizuální úrovně značky
              </div>
              <div style={{ position: "relative", width: 160, height: 160, marginBottom: 18 }}>
                <svg width={160} height={160} style={{ transform: "rotate(-90deg)" }} viewBox="0 0 160 160">
                  <circle cx={80} cy={80} r={65} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
                  <circle
                    cx={80}
                    cy={80}
                    r={65}
                    fill="none"
                    stroke={C.lime}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={408}
                    strokeDashoffset={408 - (408 * scoreAnimated) / 100}
                    style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }}
                  />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{scoreAnimated}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>/ 100</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.lime, marginBottom: 6 }}>
                {total >= 70 ? "Solidní základ" : total >= 50 ? "Potenciál růstu" : "Prostor ke zlepšení"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
                Největší prostor je v důvěře a diferenciaci.
              </div>
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: C.r, boxShadow: C.shadow, padding: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: C.gray, marginBottom: 20 }}>
                Pět pilířů značky · {displayName}
              </div>
              {PILLAR_IDS.map((id) => {
                const p = pillarAnalysis[id];
                const score = typeof p?.score === "number" ? p.score : 5;
                const disp = PILLAR_DISPLAY[id];
                const col = getScoreColor(score);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 15 }}>
                    <div style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{disp?.icon ?? "•"}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#555", width: 110, flexShrink: 0 }}>{disp?.label ?? id}</div>
                    <div style={{ flex: 1, height: 8, background: "#f0ede6", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(score / 10) * 100}%`,
                          background: col,
                          borderRadius: 4,
                          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, width: 32, textAlign: "right", flexShrink: 0, color: col }}>{score}/10</div>
                  </div>
                );
              })}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.grayLight}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 12, color: C.gray, fontStyle: "italic", lineHeight: 1.5 }}>
                  „Vaše značka není slabá. Ale není ještě strategicky sladěná."
                </div>
              </div>
            </div>
          </div>

          {/* Pillar details */}
          <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.limeDark }}>Detailní rozbor pilířů</div>
          {PILLAR_IDS.map((id) => {
            const p = pillarAnalysis[id];
            const score = typeof p?.score === "number" ? p.score : 5;
            const disp = PILLAR_DISPLAY[id];
            const col = getScoreColor(score);
            const open = expandedPillar === id;
            return (
              <div
                key={id}
                style={{
                  background: C.white,
                  border: `1px solid ${C.grayLight}`,
                  borderRadius: 12,
                  marginBottom: 12,
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedPillar(open ? null : id)}
                  style={{
                    width: "100%",
                    padding: "20px 22px 16px",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    font: "inherit",
                    color: "inherit",
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gray, marginBottom: 3 }}>
                      {disp?.label ?? id} · {disp?.sub ?? ""}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: col }}>
                      {(disp?.label ?? id).toUpperCase()}: {score}/10
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{p?.interpretation ?? p?.strategicOpportunity ?? "—"}</div>
                  <div style={{ fontSize: 11, color: C.limeDark, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, borderBottom: `1px solid ${C.limeBorder}`, paddingBottom: 1 }}>
                    {open ? "— Skrýt metodiku" : "Zjistit jak jsme hodnotili →"}
                  </div>
                </button>
                {open && (
                  <div style={{ maxHeight: 500, padding: "18px 22px 22px", background: "#fafaf8", borderTop: `1px solid ${C.grayLight}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 8, color: C.limeDark }}>↗ Co jsme zaznamenali</div>
                    <ul style={{ listStyle: "none", margin: "0 0 14px 0", paddingLeft: 16 }}>
                      {(p?.observed ?? []).map((item, i) => (
                        <li key={i} style={{ fontSize: 12, color: "#666", padding: "3px 0", position: "relative", lineHeight: 1.55 }}>
                          <span style={{ position: "absolute", left: 0, color: C.limeDark }}>↗</span> {item}
                        </li>
                      ))}
                    </ul>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 8, color: "#aaa" }}>→ Co jsme nezaznamenali</div>
                    <ul style={{ listStyle: "none", margin: "0 0 14px 0", paddingLeft: 16 }}>
                      {(p?.notObserved ?? []).map((item, i) => (
                        <li key={i} style={{ fontSize: 12, color: "#666", padding: "3px 0", position: "relative", lineHeight: 1.55 }}>
                          <span style={{ position: "absolute", left: 0, color: "#bbb" }}>→</span> {item}
                        </li>
                      ))}
                    </ul>
                    {p?.reasoning && (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 8, color: C.orange }}>Proč to ovlivnilo skóre</div>
                        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.65, padding: "12px 14px", background: "rgba(240,180,41,0.06)", borderLeft: "2px solid rgba(240,180,41,0.3)", borderRadius: "0 6px 6px 0" }}>{p.reasoning}</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Brand DNA */}
          <div
            style={{
              background: C.black,
              borderRadius: C.r,
              padding: 28,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: C.limeBg,
                  border: `1px solid ${C.limeBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                }}
              >
                🧬
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Brand DNA · {displayName}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Jak vás vidí zákaznice</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {[
                ...(brandDna?.contentPillars ?? []).slice(0, 3).map((t) => ({ t, lime: true })),
                ...(brandDna?.targetAudience ? [{ t: brandDna.targetAudience.slice(0, 24), lime: false }] : []),
                ...(brandDna?.positioning ? [{ t: brandDna.positioning.slice(0, 24), lime: false }] : []),
              ].map(({ t, lime }, i) => (
                <span
                  key={i}
                  style={{
                    padding: "5px 13px",
                    borderRadius: 16,
                    fontSize: 11,
                    fontWeight: 500,
                    background: lime ? "rgba(180,232,66,0.1)" : "rgba(255,255,255,0.06)",
                    color: lime ? C.lime : "rgba(255,255,255,0.55)",
                    border: `1px solid ${lime ? C.limeBorder : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
              {result.summary?.trim() ||
                (brandDna?.positioning && brandDna.uniqueValue
                  ? `Značka komunikuje ${brandDna.positioning}. ${brandDna.uniqueValue}.`
                  : "Značka má potenciál. Jeden silný manifesto-moment a důkazy výsledků by transformovaly vnímání.")}
            </div>
          </div>

          {/* Strategic summary */}
          <div style={{ marginBottom: 14, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.limeDark }}>Strategický profil</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, color: C.red }}>3 klíčová rizika</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <li style={{ fontSize: 12, color: "#555", padding: "4px 0 4px 14px", position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.grayMid }}>—</span> Absence případových studií s čísly</li>
                <li style={{ fontSize: 12, color: "#555", padding: "4px 0 4px 14px", position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.grayMid }}>—</span> Hero sekce webu bez CTA</li>
                <li style={{ fontSize: 12, color: "#555", padding: "4px 0 4px 14px", position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.grayMid }}>—</span> Chybí pojmenovaná metodologie</li>
              </ul>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, color: C.limeDark }}>Okamžité akce</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <li style={{ fontSize: 12, color: "#555", padding: "4px 0 4px 14px", position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.grayMid }}>—</span> Vytvořit 3 případové studie s výsledky</li>
                <li style={{ fontSize: 12, color: "#555", padding: "4px 0 4px 14px", position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.grayMid }}>—</span> Přidat hero CTA na web</li>
                <li style={{ fontSize: 12, color: "#555", padding: "4px 0 4px 14px", position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.grayMid }}>—</span> Pojmenovat a popsat vlastní metodu</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              background: C.black,
              borderRadius: C.r,
              padding: "48px 40px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(180,232,66,0.08), transparent 70%)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.lime, marginBottom: 12 }}>Další krok</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#fff", lineHeight: 1.25, marginBottom: 8 }}>
              Značka má potenciál.<br />
              <em style={{ color: C.lime, fontStyle: "italic" }}>Otázka je, zda ho chcete využít.</em>
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 28 }}>Vstupní hovor · 56 minut · Vizuální board + 3 Canva šablony</p>
            <a
              href="/rezervace?from=premiova"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: C.lime,
                color: C.black,
                padding: "14px 34px",
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                textDecoration: "none",
                boxShadow: "0 0 35px rgba(180,232,66,0.25)",
              }}
            >
              Rezervovat vstupní hovor →
            </a>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 12 }}>7 800 Kč · Bez závazku Fáze 1</div>
          </div>
        </div>

        {/* PAGE 2 — STRATEGICKÝ PLÁN */}
        <div className={`client-outputs-page ${activePage === "strat" ? "active" : ""}`} id="page-strat">
          <div
            style={{
              background: C.black,
              borderRadius: C.r,
              padding: 40,
              marginBottom: 24,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 32,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.lime, marginBottom: 10 }}>Strategický plán · 3 fáze</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "#fff", lineHeight: 1.2, marginBottom: 8 }}>
                Od ambice k výsledku.<br />
                <em style={{ color: C.lime, fontStyle: "italic" }}>Systém který pracuje za vás.</em>
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, maxWidth: 540 }}>
                {strategicPlan.slice(0, 280) || "Na základě Brand Scan diagnostiky byl navržen 3fázový plán zaměřený na posílení důvěry, strukturu obsahu a automatizaci publikování."}
                {strategicPlan.length > 280 ? "…" : ""}
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: C.lime }}>3</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Fáze</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: C.lime }}>90</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Dní</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Skóre nyní</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, fontWeight: 700, color: C.lime, lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>cíl po 3 fázích</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 700, color: "rgba(180,232,66,0.4)", lineHeight: 1 }}>89</div>
            </div>
          </div>

          {/* Positioning */}
          <div style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: C.r, padding: 32, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.limeDark, marginBottom: 8 }}>Positioning & diferenciace</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Kde stojíte. Kam směřujete.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginTop: 20 }}>
              <div style={{ padding: 18, background: "#fafaf8", borderRadius: 10, border: `1px solid ${C.grayLight}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.limeDark, marginBottom: 8 }}>Cílová skupina</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{brandDna?.targetAudience?.slice(0, 40) ?? "—"}</div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>Service-based business, příjmy 50–200k/měs. Chtějí škálovat bez vyhoření.</div>
              </div>
              <div style={{ padding: 18, background: "#fafaf8", borderRadius: 10, border: `1px solid ${C.grayLight}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.limeDark, marginBottom: 8 }}>Unikátní hodnota</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{brandDna?.uniqueValue?.slice(0, 30) ?? "Systém, ne motivace"}</div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>Konkrétní business systém. Výsledky za 90 dní.</div>
              </div>
              <div style={{ padding: 18, background: "#fafaf8", borderRadius: 10, border: `1px solid ${C.grayLight}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.limeDark, marginBottom: 8 }}>Cenové ukotvení</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Prémiový segment</div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>Vizuální úroveň musí odrážet cenu.</div>
              </div>
            </div>
          </div>

          {/* 3 phases */}
          <div style={{ marginBottom: 14, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.limeDark }}>Struktura spolupráce</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { num: "0", badge: "Fáze 0 · Vstup", title: "Strategický vstup", price: "7 800 Kč", dark: false, items: ["Vstupní strategický rozhovor 56 min", "Vizuální board — cesta značky", "3 Canva šablony na míru", "Podklad pro Fázi 1"] },
              { num: "1", badge: "Fáze 1 · Obsah", title: "Reálný obsah", price: "25 000 Kč", dark: true, items: ["Strategický plán + Brand DNA", "Foto/video den v ateliéru Praha", "500+ fotografií pro obsah", "Video záběry pro Reels", "3 případové studie s výsledky"] },
              { num: "2", badge: "Fáze 2 · Systém", title: "Systém za vás", price: "24 000 Kč", dark: true, items: ["2měsíční výcvik AI agenta značky", "Tvorba příspěvků, grafiky, Reels", "Agent plánuje a připravuje", "Vstup do aplikace Lucifera"] },
            ].map((phase) => (
              <div
                key={phase.num}
                style={{
                  borderRadius: C.r,
                  padding: 24,
                  position: "relative",
                  overflow: "hidden",
                  background: phase.dark ? C.black : C.white,
                  border: phase.dark ? "none" : `1px solid ${C.grayLight}`,
                }}
              >
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 700, lineHeight: 1, opacity: 0.15, position: "absolute", top: 12, right: 18, color: phase.dark ? "#fff" : C.black }}>{phase.num}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, background: phase.num === "0" ? "rgba(0,0,0,0.05)" : phase.num === "1" ? C.limeBg : "rgba(167,139,250,0.1)", color: phase.num === "0" ? C.black : phase.num === "1" ? C.lime : C.violet }}>{phase.badge}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: phase.dark ? "#fff" : C.black }}>{phase.title}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, marginBottom: 12, color: phase.num === "0" ? C.black : phase.num === "1" ? C.lime : C.violet }}>{phase.price}</div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {phase.items.map((item, i) => (
                    <li key={i} style={{ fontSize: 12, padding: "4px 0 4px 16px", position: "relative", lineHeight: 1.5, color: phase.dark ? "rgba(255,255,255,0.5)" : "#555" }}>
                      <span style={{ position: "absolute", left: 4, color: phase.dark ? C.lime : C.limeDark }}>·</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Hook variants */}
          <div style={{ background: C.black, borderRadius: C.r, padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.lime, marginBottom: 4 }}>Obsahové hooky — generováno z Brand DNA</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "#fff", marginBottom: 4 }}>5 variant příspěvků připravených k publikaci</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>Každý hook cílí jiný segment zákaznic a jiný moment rozhodování.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                { type: "Výsledek", text: "Za 90 dní z 80k na 180k. Jedna změna v nastavení ceny.", cls: "hc-result", col: C.lime },
                { type: "Problém", text: "Máte plný kalendář a prázdný účet. To není náhoda — je to systém.", cls: "hc-problem", col: "#f87171" },
                { type: "Otázka", text: "Kolik vás stojí každý měsíc bez jasné strategie?", cls: "hc-question", col: C.orange },
                { type: "Číslo", text: "73 % podnikatelek v mém programu zdvojnásobilo příjmy do 6 měsíců.", cls: "hc-number", col: C.teal },
                { type: "Provokace", text: "Práce na sobě nestačí. Musíte pracovat na svém businessu.", cls: "hc-provoke", col: C.violet },
              ].map((h) => (
                <div
                  key={h.type}
                  style={{
                    borderRadius: 10,
                    padding: 14,
                    background: `${h.col}14`,
                    border: `1px solid ${h.col}33`,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: h.col }}>{h.type}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>{h.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved strategies */}
          {savedStrategies.length > 0 && (
            <div style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: C.r, padding: 28, marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gray, marginBottom: 14 }}>Uložené strategie</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {savedStrategies.map((s) => (
                  <div key={s.id} style={{ padding: 14, background: "#fafaf8", borderRadius: 10, border: `1px solid ${C.grayLight}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{s.name ?? "Strategie"}</div>
                    <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{(s.content ?? "").slice(0, 300)}{(s.content?.length ?? 0) > 300 ? "…" : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PAGE 3 — VIZUÁLNÍ BOARD */}
        <div className={`client-outputs-page ${activePage === "visual" ? "active" : ""}`} id="page-visual">
          <div
            style={{
              position: "relative",
              borderRadius: C.r,
              overflow: "hidden",
              height: 320,
              marginBottom: 24,
              display: "flex",
              alignItems: "flex-end",
              background: "linear-gradient(135deg, #1a1208 0%, #2a2012 50%, #1a1208 100%)",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
            <div style={{ position: "relative", padding: "32px 36px", width: "100%" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Vizuální board · Studio Lucifera pro {displayName}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, color: "#fff", lineHeight: 1.15, marginBottom: 6 }}>
                <strong style={{ fontWeight: 700 }}>Od ambice</strong>
                <br />
                <em style={{ color: "#c9a96e", fontStyle: "italic" }}>k výsledku.</em>
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>Prémiový segment · Ženy-podnikatelky</div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                {["Teplá zemitost", "Autoritativní & ženský", "Editorial elegance", "Serif + natural light"].map((tag) => (
                  <span key={tag} style={{ padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 500, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Color palette */}
          <div style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: C.r, padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.limeDark, marginBottom: 8 }}>Barevná paleta</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Teplá zemitost — prémiová ženská estetika</div>
            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              {[
                { name: "Midnight Earth", hex: "#1A1208", role: "Primární tmavá" },
                { name: "Warm Gold", hex: "#C9A96E", role: "Hlavní akcent" },
                { name: "Linen Sand", hex: "#E8D5B0", role: "Světlý tón" },
                { name: "Cream Paper", hex: "#F5F0E8", role: "Pozadí stránek" },
                { name: "Warm Brown", hex: "#6B5C47", role: "Sekundární text" },
                { name: "Forest Deep", hex: "#2D4A3E", role: "Kontrast akcent" },
              ].map((s) => (
                <div key={s.hex} style={{ flex: "1 1 120px", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: 80, background: s.hex }} />
                  <div style={{ padding: "10px 12px", background: "#fafaf8", border: `1px solid ${C.grayLight}`, borderTop: "none", borderRadius: "0 0 10px 10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: C.gray, fontFamily: "monospace" }}>{s.hex}</div>
                    <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>{s.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: C.r, padding: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gray, marginBottom: 14 }}>Display · Cormorant Garamond</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 600, lineHeight: 1.2, marginBottom: 6 }}>Ambice se stává<br /><em style={{ fontStyle: "italic", fontWeight: 300 }}>výsledkem.</em></div>
              <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.65 }}>Elegantní serif. Používá se na headline, citáty, hero sekce.</div>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: C.r, padding: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gray, marginBottom: 14 }}>Body · DM Sans</div>
              <div style={{ fontSize: 11, color: C.gray, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{displayName}</div>
              <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7 }}>Pracuji s podnikatelkami které jsou dobré v tom co dělají — ale nevidí proč to nefunguje tak jak by mělo.</div>
              <div style={{ fontSize: 11, color: C.limeDark, fontWeight: 500, marginTop: 12 }}>DM Sans · Light 300 · Regular 400 · Medium 500</div>
            </div>
          </div>

          {/* Visual rules */}
          <div style={{ marginBottom: 14, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.limeDark }}>Vizuální pravidla</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            {[
              { icon: "📷", title: "Světlo & atmosféra", text: "Vždy teplé přirozené světlo nebo studio s teplými gely.", do: "Přirozené okno, zlatá hodinka", dont: "Studené flash, bílé pozadí" },
              { icon: "🎭", title: "Výraz & energie", text: "Přímý pohled do kamery. Žádné nucené úsměvy.", do: "Zamyšlená, přítomná", dont: "Přehrávaný úsměv" },
              { icon: "🏛", title: "Prostředí", text: "Prémiové interiéry s charakterem — světlé plochy, tmavé dřevo.", do: "Kavárny, ateliér, Praha", dont: "Kancelářský park" },
            ].map((r) => (
              <div key={r.title} style={{ background: C.white, border: `1px solid ${C.grayLight}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{r.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>{r.text}</div>
                <div style={{ marginTop: 10, padding: 8, background: "#fafaf8", borderRadius: 7, fontSize: 11, color: "#555", border: `1px solid ${C.grayLight}` }}>
                  <span style={{ color: C.limeDark, fontWeight: 600 }}>✓ DO:</span> {r.do}<br />
                  <span style={{ color: C.red, fontWeight: 600 }}>✗ DON'T:</span> {r.dont}
                </div>
              </div>
            ))}
          </div>

          {/* Photo brief */}
          <div style={{ background: C.black, borderRadius: C.r, padding: 32, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.lime, marginBottom: 8 }}>Brief pro focení · Studio Lucifera</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Jeden den. 500+ fotografií. Obsah na 6 měsíců.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 18 }}>
              {[
                { label: "Hero portréty (60 ks)", text: "Různé pózy a výrazy, tmavé i světlé pozadí. Vertikální i horizontální. Pro web, Instagram, LinkedIn." },
                { label: "Pracovní moment (80 ks)", text: "S laptopem, notes, v rozhovoru. Autentické záběry bez pózování. Pro stories, b-roll, karusely." },
                { label: "Detail záběry (40 ks)", text: "Ruce, desky, káva, prostředí. Materiálové detaily. Pro grafiky, pozadí příspěvků." },
                { label: "Video b-roll (20 klipů)", text: "15–30s klipy: chůze, sezení u stolu. Pro Reels a LinkedIn videa. Teplý grading." },
              ].map((b) => (
                <div key={b.label} style={{ padding: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.lime, marginBottom: 8 }}>{b.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{b.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
