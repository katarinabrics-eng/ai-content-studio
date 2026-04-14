"use client";

import { useEffect, useRef, useState } from "react";
import type { ScanResult, PillarAnalysisItem, SuggestedStrategistItem } from "@/app/start/ScanResultScrollExperience";

const C = {
  bg: "#f5f4ef",
  surface: "#ffffff",
  border: "#e8e8e3",
  text: "#111111",
  textMuted: "#777777",
  textMuted2: "#555555",
  lime: "#b4e842",
  limeDark: "#8fb82e",
  limeBg: "rgba(180,232,66,0.08)",
  limeBorder: "rgba(180,232,66,0.25)",
  warn: "#f0b429",
  danger: "#ef4444",
  black: "#111111",
  grayLight: "#e8e8e3",
} as const;

const PILLAR_IDS = ["light", "energy", "architecture", "identity", "trust"] as const;
const PILLAR_DISPLAY: Record<string, { label: string; icon: string; sub: string }> = {
  light: { label: "Hodnota", icon: "💡", sub: "Clarity of Value" },
  energy: { label: "Energie", icon: "⚡", sub: "Brand Energy" },
  architecture: { label: "Architektura", icon: "🏛", sub: "UX & Structure" },
  identity: { label: "Identita", icon: "💎", sub: "Brand Identity" },
  trust: { label: "Důvěra", icon: "🤝", sub: "Social Proof" },
};
const PILLAR_LABELS: Record<string, { title: string; sub: string }> = {
  light: { title: "Hodnota", sub: "Clarity of Value" },
  energy: { title: "Energie", sub: "Brand Energy" },
  architecture: { title: "Architektura", sub: "UX & Structure" },
  identity: { title: "Identita", sub: "Brand Identity" },
  trust: { title: "Důvěra", sub: "Social Proof" },
};

/** 8–10: limetková #b4e842, 5–7: žlutooranžová #f0b429, 1–4: červená #ef4444 */
function getScoreColor(score: number): string {
  if (score >= 8) return "#b4e842";
  if (score >= 5) return "#f0b429";
  return "#ef4444";
}

type Scraped = {
  url?: string;
  screenshot?: string | null;
  title?: string;
  description?: string;
  markdown?: string;
};

export type DiagnostikaResultsViewProps = {
  result: ScanResult;
  scraped?: Scraped | null;
  displayName?: string;
  displayWeb?: string;
  projectId?: string | null;
  accessUrl?: string | null;
  onBack?: () => void;
  onSaveLead?: (data: { email: string; name?: string; web?: string }) => void | Promise<void>;
  leadSubmitted?: boolean;
  leadError?: string | null;
  leadSubmitting?: boolean;
  /** When true, hide CTA + email capture (e.g. on view-by-token page where user already has access) */
  hideCta?: boolean;
  /** When false, hide only the email capture section (e.g. when already on view-by-token) */
  showEmailCapture?: boolean;
};

export function DiagnostikaResultsView({
  result,
  scraped,
  displayName = "",
  displayWeb = "",
  projectId,
  accessUrl = null,
  onBack,
  onSaveLead,
  leadSubmitted = false,
  leadError = null,
  leadSubmitting = false,
  hideCta = false,
  showEmailCapture = true,
}: DiagnostikaResultsViewProps) {
  const total = Math.min(100, Math.max(0, result.brandScore?.total ?? 0));
  const summary = result.summary?.trim() ?? "";
  const pillarAnalysis: Record<string, PillarAnalysisItem> = result.pillarAnalysis ?? {};
  const suggested = result.suggested_strategists ?? [];
  const brandName = displayName || ((result.brandDna as { name?: string } | undefined)?.name ?? "Vaše značka");
  const webUrl = displayWeb || (scraped?.url ?? "");

  const [scoreAnimated, setScoreAnimated] = useState(0);
  const [scoreVisible, setScoreVisible] = useState(false);
  const scoreRef = useRef<HTMLDivElement>(null);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pillarVisible, setPillarVisible] = useState<number>(-1);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const recsRef = useRef<HTMLDivElement>(null);
  const [recsVisible, setRecsVisible] = useState(false);
  const dnaRef = useRef<HTMLDivElement>(null);
  const [dnaVisible, setDnaVisible] = useState(false);
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const [screenshotReveal, setScreenshotReveal] = useState(false);
  const [placeholderGone, setPlaceholderGone] = useState(false);

  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState(displayName);
  const [leadWeb, setLeadWeb] = useState(displayWeb);
  const [ctaEmailOpen, setCtaEmailOpen] = useState(false);

  useEffect(() => {
    setLeadName(displayName);
    setLeadWeb(displayWeb);
  }, [displayName, displayWeb]);

  // Score: when in view, animate counter 0→total over 1.5s easeOut (ring animates in sync)
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
    const duration = 1500;
    let raf = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
    const tick = (now: number) => {
      const elapsed = (now - start) / duration;
      const t = Math.min(elapsed, 1);
      setScoreAnimated(Math.round(total * easeOut(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scoreVisible, total]);

  // Pillar cards stagger on scroll (each reveals with 150ms delay between)
  useEffect(() => {
    const refs = pillarRefs.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = refs.indexOf(e.target as HTMLDivElement);
          if (i >= 0 && i > pillarVisible) setPillarVisible(i);
        });
      },
      { threshold: 0.15 }
    );
    refs.forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, [pillarVisible]);

  // Brand DNA tags: in view → stagger fade-in
  useEffect(() => {
    const el = dnaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setDnaVisible(true);
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Doporučení section: scroll-triggered fade-in + translateY
  useEffect(() => {
    const el = recsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setRecsVisible(true);
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Firecrawl v2 vrací screenshot jako URL; base64 jen když už máme data: nebo raw base64
  const screenshotSrc = scraped?.screenshot
    ? scraped.screenshot.startsWith("data:")
      ? scraped.screenshot
      : scraped.screenshot.startsWith("http://") || scraped.screenshot.startsWith("https://")
        ? scraped.screenshot
        : `data:image/png;base64,${scraped.screenshot}`
    : null;

  // Screenshot: skeleton 1.5s then reveal image with fade + scale
  useEffect(() => {
    if (!screenshotSrc) {
      const t = setTimeout(() => setPlaceholderGone(true), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setScreenshotReveal(true), 1500);
    return () => clearTimeout(t);
  }, [screenshotSrc]);

  const scoreInterpretation = total >= 70 ? "Solidní základ" : total >= 50 ? "Potenciál růstu" : "Prostor ke zlepšení";
  const scoreDesc = total >= 65
    ? "Největší prostor je v důvěře a diferenciaci."
    : total >= 45
      ? "Největší prostor je v oblasti důvěry a diferenciace."
      : "Největší prostor je v jasnosti nabídky a důvěře.";

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      <style>{`
        .diag-results-container { max-width: 900px; margin: 0 auto; padding: 84px 32px 80px; }
        .diag-hero-label { font-size: 11px; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase; color: ${C.limeDark}; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 10px; }
        .diag-hero-label-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.lime}; animation: diagPulse 2s ease infinite; }
        @keyframes diagPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .diag-h1 { font-family: var(--font-playfair), serif; font-weight: 700; font-size: 32px; line-height: 1.2; color: ${C.text}; margin: 0 0 6px 0; }
        .diag-web-preview { border-radius: 14px; overflow: hidden; box-shadow: 0 16px 60px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.08); }
        .diag-browser-chrome { background: #2a2a2a; padding: 10px 16px; display: flex; align-items: center; gap: 12px; }
        .diag-browser-dots { display: flex; gap: 6px; }
        .diag-browser-dots span { width: 11px; height: 11px; border-radius: 50%; }
        .diag-browser-url { flex: 1; background: #1e1e1e; border-radius: 5px; padding: 5px 12px; font-size: 12px; color: #666; display: flex; align-items: center; gap: 6px; }
        .diag-browser-body { position: relative; min-height: 210px; overflow: hidden; }
        .diag-preview-skeleton { position: absolute; inset: 0; background: linear-gradient(90deg, #ebebeb 0%, #f5f5f5 50%, #ebebeb 100%); background-size: 200% 100%; animation: diagSkeleton 1.4s ease infinite; }
        .diag-preview-img { width: 100%; min-height: 210px; object-fit: cover; display: block; }
        .diag-preview-img.animate-in { animation: diagImgReveal 0.8s ease forwards; opacity: 0; transform: scale(0.98); }
        .diag-preview-placeholder { min-height: 210px; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
        @keyframes diagImgReveal { to { opacity: 1; transform: scale(1); } }
        @keyframes diagSkeleton { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .diag-main-grid { display: grid; grid-template-columns: 260px 1fr; gap: 24px; align-items: start; }
        @media (max-width: 700px) { .diag-main-grid { grid-template-columns: 1fr; } }
        .diag-score-card-dark { background: ${C.black}; border-radius: 20px; padding: 36px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .diag-pillars-card { background: ${C.surface}; border-radius: 20px; padding: 28px; border: 1px solid ${C.grayLight}; }
        .diag-pullquote { text-align: center; font-family: var(--font-playfair), serif; font-style: italic; font-size: 18px; color: rgba(0,0,0,0.25); margin: 32px 0; line-height: 1.6; }
        .diag-divider { height: 1px; background: ${C.border}; margin: 24px 0; }
        .diag-section-label { font-size: 10px; letter-spacing: 0.13em; text-transform: uppercase; color: ${C.textMuted}; margin-bottom: 16px; }
        .diag-pillar-card { background: ${C.surface}; border: 1px solid ${C.grayLight}; border-radius: 16px; margin-bottom: 16px; overflow: hidden; }
        .diag-pillar-card.visible { animation: diagFadeUp 0.5s ease forwards; }
        @keyframes diagFadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        .diag-dna-tag { opacity: 0; transform: translateY(6px); transition: opacity 0.4s ease, transform 0.4s ease; }
        .diag-dna-tag.visible { opacity: 1; transform: translateY(0); }
        .diag-rec-card { opacity: 0; transform: translateY(20px); }
        .diag-rec-card.visible { animation: diagRecReveal 0.5s ease forwards; }
        @keyframes diagRecReveal { to { opacity: 1; transform: translateY(0); } }
        .diag-strategist-card { background: #fafaf8; border: 1px solid ${C.grayLight}; border-radius: 10px; padding: 18px; }
        .diag-cta-dark { background: ${C.black}; color: #fff; border-radius: 24px; padding: 56px 48px; text-align: center; position: relative; overflow: hidden; }
        .diag-email-card { background: ${C.surface}; border: 1px solid ${C.grayLight}; border-radius: 20px; padding: 32px; }
        .diag-float-badge { position: absolute; background: #fff; border: 1px solid rgba(0,0,0,0.09); border-radius: 12px; padding: 12px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-size: 12px; display: flex; align-items: center; gap: 8px; z-index: 2; }
        .diag-brand-dna-dark { background: ${C.black}; border-radius: 20px; padding: 32px; }
        .diag-strategic-card { background: ${C.surface}; border: 1px solid ${C.grayLight}; border-radius: 20px; padding: 32px; }
        .diag-save-section { background: ${C.surface}; border: 1px solid ${C.grayLight}; border-radius: 20px; padding: 32px; }
        @media (max-width: 600px) { .diag-results-container { padding: 24px 20px 48px; } .diag-strategist-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {onBack && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 32px 0" }}>
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 13, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
            ← Analyzovat jiný web
          </button>
        </div>
      )}
      <div className="diag-results-container">
        {/* 1. HEADER */}
        <section className="results-header" style={{ textAlign: "center", marginBottom: 40 }}>
          <p className="diag-hero-label">
            <span className="diag-hero-label-dot" />
            Výsledky diagnostiky
          </p>
          <h1 className="diag-h1">Vaše značka byla analyzována.</h1>
          <p className="diag-results-sub" style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>
            {webUrl ? `${webUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}` : "—"} · Analýza dokončena právě teď
          </p>
        </section>

        {/* 2. BROWSER MOCKUP */}
        <section style={{ marginBottom: 40 }}>
          <div className="diag-web-preview">
            <div className="diag-browser-chrome">
              <div className="diag-browser-dots">
                <span style={{ background: "#ff5f57" }} />
                <span style={{ background: "#ffbd2e" }} />
                <span style={{ background: "#28c940" }} />
              </div>
              <div className="diag-browser-url">🔒 {webUrl ? webUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : "—"}</div>
            </div>
            <div className="diag-browser-body">
              {screenshotSrc ? (
                <>
                  {!screenshotReveal && <div className="diag-preview-skeleton" />}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshotSrc}
                    alt=""
                    className={`diag-preview-img ${screenshotReveal && screenshotLoaded ? "animate-in" : ""}`}
                    onLoad={() => setScreenshotLoaded(true)}
                    style={{ opacity: screenshotReveal ? 1 : 0, position: screenshotReveal ? "relative" : "absolute", inset: 0 }}
                  />
                </>
              ) : placeholderGone ? (
                <div className="diag-preview-placeholder">
                  <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Web byl analyzován</p>
                  {webUrl && <p style={{ fontSize: 11, color: C.textMuted2, marginTop: 4 }}>{webUrl}</p>}
                </div>
              ) : (
                <div className="diag-preview-skeleton" />
              )}
            </div>
          </div>
        </section>

        {/* 3. SCORE + PILLARS GRID (260px + 1fr) */}
        <section ref={scoreRef} style={{ marginBottom: 32, position: "relative" }}>
          {result.brandDna && (result.brandDna.positioning || (result.brandDna as { name?: string }).name) && (
            <div className="diag-float-badge" style={{ top: -12, right: 0 }}>
              <span style={{ fontSize: 16 }}>🎯</span>
              <div>
                <div style={{ fontWeight: 700, color: C.text }}>Identita nalezena</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Brand DNA kompletní</div>
              </div>
            </div>
          )}
          {suggested.length > 0 && (
            <div className="diag-float-badge" style={{ bottom: -12, left: 0 }}>
              <span style={{ fontSize: 16 }}>🧠</span>
              <div>
                <div style={{ fontWeight: 700, color: C.text }}>Stratég doporučen</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{suggested[0].label} · {(suggested[0].fit_score ?? 87)}% shoda</div>
              </div>
            </div>
          )}
          <div className="diag-main-grid">
            {/* LEFT: INDEX VIZUÁLNÍ ÚROVNĚ (dark card) */}
            <div className="diag-score-card-dark">
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Index vizuální úrovně</div>
              <div style={{ position: "relative", width: 150, height: 150, marginBottom: 20 }}>
                <ScoreRingSVG value={scoreVisible ? scoreAnimated : 0} dark />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{scoreAnimated}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>/ 100</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.lime, marginBottom: 6 }}>{scoreInterpretation}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{scoreDesc}</div>
            </div>
            {/* RIGHT: PĚT PILÍŘŮ ZNAČKY (light card) */}
            <div className="diag-pillars-card">
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: C.textMuted, marginBottom: 22 }}>Pět pilířů značky</div>
              {PILLAR_IDS.map((id, idx) => {
                const p = pillarAnalysis[id] as PillarAnalysisItem | undefined;
                const score = typeof p?.score === "number" ? p.score : 5;
                const disp = PILLAR_DISPLAY[id];
                const rowVisible = scoreVisible;
                const barW = rowVisible ? score * 10 : 0;
                const col = getScoreColor(score);
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{disp?.icon ?? "•"}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, width: 108, flexShrink: 0, color: "#444" }}>{disp?.label ?? id}</div>
                    <div style={{ flex: 1, height: 7, background: C.grayLight, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${barW}%`, background: col, borderRadius: 4, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, width: 28, textAlign: "right", flexShrink: 0, color: col }}>{score}/10</div>
                  </div>
                );
              })}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.grayLight}` }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Vaše značka není slabá.</div>
                <div style={{ fontSize: 13, color: C.textMuted2, lineHeight: 1.5 }}>Ale není ještě strategicky sladěná.</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DIVIDER QUOTE */}
        <section style={{ marginBottom: 24 }}>
          <p className="diag-pullquote">Značka není jen vizuál.<br />Je to systém.</p>
        </section>

        {/* 5. BRAND DNA — dark card */}
        {(() => {
          const d = result.brandDna as Record<string, unknown> | undefined;
          if (!d) return null;
          const tags: { label: string; lime?: boolean }[] = [];
          if (d.positioning && String(d.positioning).trim()) tags.push({ label: String(d.positioning).trim().slice(0, 30), lime: true });
          if (d.uniqueValue && String(d.uniqueValue).trim()) tags.push({ label: String(d.uniqueValue).trim().slice(0, 28), lime: false });
          (d.contentPillars as string[] | undefined)?.slice(0, 4).forEach((t) => tags.push({ label: t.slice(0, 24), lime: tags.length % 2 === 0 }));
          if (d.targetAudience && String(d.targetAudience).trim()) tags.push({ label: String(d.targetAudience).trim().slice(0, 24), lime: false });
          const desc = (d.positioning || d.uniqueValue || summary) ? (summary || String(d.positioning || d.uniqueValue || "").slice(0, 200)) : "Vaše značka komunikuje svou pozici. Zákazník vidí potenciál — chybí mu důkaz, že to funguje.";
          if (tags.length === 0 && !desc) return null;
          return (
            <section ref={dnaRef} style={{ marginBottom: 24 }}>
              <div className="diag-brand-dna-dark">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.limeBg, border: `1px solid ${C.limeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧬</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Brand DNA</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Jak vás vidí zákazník</div>
                  </div>
                </div>
                {tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`diag-dna-tag ${dnaVisible ? "visible" : ""}`}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          background: tag.lime ? "rgba(180,232,66,0.1)" : "rgba(255,255,255,0.06)",
                          color: tag.lime ? C.lime : "rgba(255,255,255,0.6)",
                          border: `1px solid ${tag.lime ? "rgba(180,232,66,0.2)" : "rgba(255,255,255,0.1)"}`,
                          transitionDelay: `${idx * 80}ms`,
                        }}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{desc}</div>
              </div>
            </section>
          );
        })()}

        {/* 4. PILÍŘE */}
        <section style={{ marginBottom: 40 }}>
          <p className="diag-section-label">PĚT PILÍŘŮ ZNAČKY — KOMPLETNÍ DIAGNOSTIKA</p>
          {PILLAR_IDS.map((id, index) => {
            const p = pillarAnalysis[id] as PillarAnalysisItem | undefined;
            const score = p?.score ?? 0;
            const label = PILLAR_LABELS[id];
            const isVisible = pillarVisible >= index;
            const isExpanded = expandedPillar === id;
            return (
              <div
                key={id}
                ref={(el) => { pillarRefs.current[index] = el; }}
                className={`diag-pillar-card ${isVisible ? "visible" : ""}`}
                data-expanded={isExpanded}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(32px)",
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <PillarCard
                  id={id}
                  title={label?.title ?? id}
                  subTitle={label?.sub}
                  pillar={p}
                  score={score}
                  isExpanded={isExpanded}
                  onToggle={() => setExpandedPillar(isExpanded ? null : id)}
                  isVisible={isVisible}
                  staggerDelayMs={index * 150}
                />
              </div>
            );
          })}
        </section>

        {/* 6. STRATEGICKÝ PROFIL (2 karty: rizika / akce) */}
        {(summary || suggested.length > 0) && (
          <section style={{ marginBottom: 24 }}>
            <div className="diag-strategic-card">
              <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, marginBottom: 24 }}>Strategický profil vaší značky</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "#fafaf8", borderRadius: 10, padding: 18, border: `1px solid ${C.grayLight}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: C.danger, marginBottom: 10 }}>3 klíčová rizika</div>
                  <ul style={{ margin: 0, paddingLeft: 14, listStyle: "none", fontSize: 13, color: "#666" }}>
                    <li style={{ padding: "4px 0", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "#ccc" }}>—</span> Absence reálných referencí klientů</li>
                    <li style={{ padding: "4px 0", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "#ccc" }}>—</span> Chybí případové studie s výsledky</li>
                    <li style={{ padding: "4px 0", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "#ccc" }}>—</span> Žádný manifesto-moment nebo slogan</li>
                  </ul>
                </div>
                <div style={{ background: "#fafaf8", borderRadius: 10, padding: 18, border: `1px solid ${C.grayLight}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: C.limeDark, marginBottom: 10 }}>Okamžité akce</div>
                  <ul style={{ margin: 0, paddingLeft: 14, listStyle: "none", fontSize: 13, color: "#666" }}>
                    <li style={{ padding: "4px 0", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "#ccc" }}>—</span> Přidat 2–3 přímé citace klientů s výsledky</li>
                    <li style={{ padding: "4px 0", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "#ccc" }}>—</span> Vytvořit jednu případovou studii</li>
                    <li style={{ padding: "4px 0", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "#ccc" }}>—</span> Doplnit přehled obsahu před ceník</li>
                  </ul>
                </div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: C.warn, marginBottom: 10 }}>Doporučený strategický posun</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>{summary || "Vaše značka má potenciál. Největší příležitost je v oblasti sociálního důkazu — přidání reálných výsledků klientů by výrazně zvýšilo konverzní potenciál."}</div>
            </div>
          </section>
        )}

        {/* 7. AI DOPORUČUJE STRATÉGY */}
        {suggested.length > 0 && (
          <section ref={recsRef} style={{ marginBottom: 24 }}>
            <p className="diag-section-label">AI DOPORUČUJE PRO TUTO ZNAČKU</p>
            <div className="diag-strategist-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {suggested.slice(0, 2).map((s, idx) => (
                <div key={s.id} className={`diag-rec-card ${recsVisible ? "visible" : ""}`} style={{ animationDelay: `${idx * 80}ms` }}>
                  <StrategistCard strategist={s} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. ULOŽIT VÝSLEDKY (save section) */}
        {!hideCta && showEmailCapture && onSaveLead && (
          <section style={{ marginBottom: 24 }}>
            <div className="diag-save-section">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.limeBg, border: `1px solid ${C.limeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💾</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Uložte výsledky pod svým projektem</div>
                  <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>Výsledky diagnostiky zůstanou dostupné 7 dní. Zadejte e-mail a získáte přístupový odkaz kdykoliv se vrátit.</div>
                </div>
              </div>
              {leadSubmitted && accessUrl ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 16, background: "rgba(180,232,66,0.06)", border: `1px solid ${C.limeBorder}`, borderRadius: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.lime, color: C.black, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>✓</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Diagnostika uložena.</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12, lineHeight: 1.5 }}>Odkaz pro návrat k výsledkům byl odeslán na váš e-mail. Platnost odkazu je 7 dní.</div>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(accessUrl); }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "9px 18px", borderRadius: 9,
                        background: C.lime, color: C.black,
                        border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).textContent = "✓ Zkopírováno!"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).innerHTML = "📋 Zkopírovat odkaz"; }}
                    >
                      📋 Zkopírovat odkaz
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Jméno projektu</label>
                      <input
                        type="text"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="např. Studio Lucifera — web 2026"
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.grayLight}`, fontSize: 14, fontFamily: "inherit", background: "#fafaf8", color: C.text, boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Váš e-mail</label>
                      <input
                        type="email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        placeholder="vas@email.cz"
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.grayLight}`, fontSize: 14, fontFamily: "inherit", background: "#fafaf8", color: C.text, boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={leadSubmitting || !leadEmail.trim()}
                    onClick={() => onSaveLead({ email: leadEmail.trim(), name: leadName || undefined, web: leadWeb || undefined })}
                    style={{ padding: "13px 28px", background: C.black, color: C.surface, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: leadSubmitting ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    {leadSubmitting ? "Ukládám…" : "Uložit diagnostiku →"}
                  </button>
                  {leadError && <p style={{ fontSize: 13, color: C.danger, marginTop: 12 }}>{leadError}</p>}
                  {leadSubmitted && !accessUrl && <p style={{ fontSize: 13, color: C.lime, marginTop: 12 }}>Odesláno. Brzy vám pošleme odkaz.</p>}
                </>
              )}
            </div>
          </section>
        )}

        {/* 9. CTA */}
        {!hideCta && (
          <div style={{ marginTop: 48 }}>

            {/* ── 3 príspevky ── */}
            <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7a00' }}>
              Tvůj obsah připravený k použití
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {[
                { label: 'GRAFIKA · INSTAGRAM', title: '"Každé ráno si říkám — dneska to zvládnu."', body: 'A pak přijde ten moment, kdy všechno zpomalí. Tohle je pro tebe.', tags: '#osobnirozvoj #mindset', src: '/placeholders/stock-vizualni knihovna/K04/k04-001.jpeg' },
                { label: 'VIDEO · REELS', title: '"Tohle ti nikdo neřekne."', body: 'Strávila jsem hodiny přemýšlením co postovat. Pak jsem to vzdala. A nechala systém pracovat za mě.', tags: '#podnikani #brand #marketing', src: '/placeholders/stock-vizualni knihovna/K07/k07-083.jpeg' },
                { label: 'CAROUSEL · INSTAGRAM', title: '"5 věcí které mě nikdo nenaučil o značce. Slide →"', body: 'Každý snímek ti řekne něco, co konkurence tají. Připraveno za 3 minuty.', tags: '#znacka #strategie #instagram', src: '/placeholders/stock-vizualni knihovna/K01/k01-001.jpeg' },
              ].map((post, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14, overflow: 'hidden', display: 'flex', gap: 0 }}>
                  <div style={{ width: 100, flexShrink: 0, overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: '14px 18px', flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: '#b7e94c', textTransform: 'uppercase', marginBottom: 5 }}>{post.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 5 }}>{post.title}</div>
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 8 }}>{post.body}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{post.tags}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Brand DNA preview → fade → zámok ── */}
            <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7a00' }}>
              Tvá Brand DNA strategie
            </div>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, border: '1px solid #e8e4dc', background: '#fff' }}>
              <div style={{ padding: '24px 24px 0' }}>
                <div style={{ fontSize: 14, color: '#333', lineHeight: 1.8, marginBottom: 8 }}>
                  <strong style={{ color: '#111' }}>Pozicinování:</strong> {result.brandDna?.positioning ?? 'Tvá značka komunikuje z pozice důvěry a osobního přístupu.'}
                </div>
                <div style={{ fontSize: 14, color: '#333', lineHeight: 1.8, marginBottom: 8 }}>
                  <strong style={{ color: '#111' }}>Tón komunikace:</strong> {result.brandDna?.tone ?? 'Klidný, autentický, s osobním příběhem.'}
                </div>
                <div style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>
                  <strong style={{ color: '#111' }}>Cílová skupina:</strong> {result.brandDna?.targetAudience ?? 'Ženy 28–45, budující osobní nebo profesní značku.'}
                </div>
              </div>

              {/* Fade overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 140,
                background: 'linear-gradient(to bottom, transparent, #fff)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: 24,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#1a1a1a', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 10px',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                    Odemkni plnou Brand DNA strategii
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                    Pozicinování · Pilíře obsahu · Archetyp · Doporučení stratéga
                  </div>
                </div>
              </div>

              {/* Spacer pre výšku fade */}
              <div style={{ height: 160 }} />
            </div>

            {/* ── CTA ── */}
            {leadSubmitted ? (
              <div style={{ marginTop: 24, background: '#f0fce0', border: '1px solid rgba(183,233,76,0.35)', borderRadius: 14, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>✓</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>Výsledky uloženy.</div>
                  <div style={{ fontSize: 13, color: '#555' }}>Odkaz pro návrat jsme odeslali na váš e-mail. Platnost 7 dní.</div>
                  {accessUrl && (
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(accessUrl)}
                      style={{ marginTop: 10, background: 'none', border: `1px solid ${C.limeBorder}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: C.limeDark, cursor: 'pointer', fontFamily: 'inherit' }}
                    >📋 Zkopírovat odkaz</button>
                  )}
                </div>
              </div>
            ) : !ctaEmailOpen ? (
              <div style={{ marginTop: 24, background: '#f5f2ec', borderRadius: 14, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' as const }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>Ulož výsledky zdarma</div>
                  <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>
                    Získáš přístup k plné Brand DNA, 3 příspěvkům ke stažení<br />a vizuální knihovně.
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => setCtaEmailOpen(true)}
                    style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, fontFamily: 'inherit' }}
                  >Uložit výsledky →</button>
                  <button
                    onClick={() => setCtaEmailOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: 12, color: '#aaa', cursor: 'pointer', fontFamily: 'inherit' }}
                  >Pokračovat bez uložení</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 24, background: '#fff', border: '1.5px solid #e8e4dc', borderRadius: 14, padding: '28px 28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>Kam poslat výsledky?</div>
                    <div style={{ fontSize: 13, color: '#777' }}>Odkaz pro přístup k Brand DNA + příspěvkům. Platnost 7 dní.</div>
                  </div>
                  <button onClick={() => setCtaEmailOpen(false)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#bbb', cursor: 'pointer', padding: 4, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: '#999', marginBottom: 6 }}>Jméno / značka</label>
                    <input
                      type="text"
                      value={leadName}
                      onChange={e => setLeadName(e.target.value)}
                      placeholder="např. Studio Marta"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1.5px solid #e8e4dc', fontSize: 14, fontFamily: 'inherit', background: '#fafaf8', color: '#111', boxSizing: 'border-box' as const, outline: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.lime; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e8e4dc'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: '#999', marginBottom: 6 }}>Váš e-mail *</label>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={e => setLeadEmail(e.target.value)}
                      placeholder="vas@email.cz"
                      autoFocus
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1.5px solid #e8e4dc', fontSize: 14, fontFamily: 'inherit', background: '#fafaf8', color: '#111', boxSizing: 'border-box' as const, outline: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.lime; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e8e4dc'; }}
                      onKeyDown={e => { if (e.key === 'Enter' && leadEmail.trim() && onSaveLead) onSaveLead({ email: leadEmail.trim(), name: leadName || undefined, web: leadWeb || undefined }); }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={leadSubmitting || !leadEmail.trim()}
                  onClick={() => { if (onSaveLead && leadEmail.trim()) onSaveLead({ email: leadEmail.trim(), name: leadName || undefined, web: leadWeb || undefined }); }}
                  style={{ width: '100%', padding: '13px', borderRadius: 10, background: leadEmail.trim() ? '#111' : '#e8e4dc', color: leadEmail.trim() ? '#fff' : '#aaa', border: 'none', fontSize: 14, fontWeight: 600, cursor: leadEmail.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'background .2s' }}
                >{leadSubmitting ? 'Ukládám…' : 'Odeslat a odemknout →'}</button>
                {leadError && <p style={{ fontSize: 12, color: C.danger, marginTop: 10 }}>{leadError}</p>}
                <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 10 }}>Nespamujeme. Pouze tento odkaz.</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function ScoreRingSVG({ value, dark = false }: { value: number; dark?: boolean }) {
  const r = 60;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const bgStroke = dark ? "rgba(255,255,255,0.07)" : C.border;
  return (
    <svg width={150} height={150} style={{ transform: "rotate(-90deg)" }} className="score-svg">
      <circle cx={75} cy={75} r={r} fill="none" stroke={bgStroke} strokeWidth={9} />
      <circle
        cx={75}
        cy={75}
        r={r}
        fill="none"
        stroke={C.lime}
        strokeWidth={9}
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)",
          filter: dark ? "drop-shadow(0 0 10px rgba(180,232,66,0.5))" : undefined,
        }}
      />
    </svg>
  );
}

function PillarCard({
  id,
  title,
  subTitle,
  pillar,
  score,
  isExpanded,
  onToggle,
  isVisible,
  staggerDelayMs = 0,
}: {
  id: string;
  title: string;
  subTitle: string;
  pillar: PillarAnalysisItem | undefined;
  score: number;
  isExpanded: boolean;
  onToggle: () => void;
  isVisible: boolean;
  staggerDelayMs?: number;
}) {
  const [scoreAnimated, setScoreAnimated] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const start = performance.now();
    const delay = staggerDelayMs;
    const duration = 800;
    let raf = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
    const tick = (now: number) => {
      const elapsed = (now - start - delay) / duration;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed, 1);
      setScoreAnimated(Math.round(score * easeOut(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, score, staggerDelayMs]);

  const color = getScoreColor(score);
  const observed = pillar?.observed ?? [];
  const notObserved = pillar?.notObserved ?? [];
  const strategicOpportunity = pillar?.strategicOpportunity?.trim();
  const interpretation = pillar?.interpretation?.trim();

  const disp = PILLAR_DISPLAY[id];
  return (
    <>
      <div style={{ padding: "24px 24px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>{title}{subTitle ? ` · ${subTitle}` : ""}</div>
            <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, fontWeight: 700, marginBottom: 10, color }}>{(disp?.label ?? title).toUpperCase()}: {scoreAnimated}/10</div>
            {interpretation && <div style={{ fontSize: 14, color: "#555", lineHeight: 1.65 }}>{interpretation}</div>}
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => e.key === "Enter" && onToggle()}
          style={{ fontSize: 12, color: C.limeDark, marginTop: 10, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, borderBottom: `1px solid ${C.limeBorder}`, paddingBottom: 1 }}
        >
          {isExpanded ? "— Skrýt metodiku" : "Zjistit jak jsme hodnotili →"}
        </div>
      </div>
      <div
        className="diag-pillar-detail"
        style={{
          borderTop: `1px solid ${C.grayLight}`,
          background: "#fafaf8",
          padding: isExpanded ? "20px 24px 28px" : 0,
          maxHeight: isExpanded ? 700 : 0,
          overflow: "hidden",
          transition: "max-height 0.5s ease, padding 0.3s ease",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.limeDark, marginBottom: 10 }}>↗ Co jsme zaznamenali</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 13, color: "#666", lineHeight: 1.6 }}>
            {observed.map((item, i) => (
              <li key={i} style={{ padding: "4px 0", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: C.limeDark, flexShrink: 0, marginTop: 1, width: 16, display: "inline-block" }}>↗</span>
                <span>{item}</span>
              </li>
            ))}
            {observed.length === 0 && <li style={{ color: "#bbb" }}>—</li>}
          </ul>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>→ Co jsme nezaznamenali</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 13, color: "#666", lineHeight: 1.6 }}>
            {notObserved.map((item, i) => (
              <li key={i} style={{ padding: "4px 0", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#bbb", flexShrink: 0, marginTop: 1 }}>→</span>
                <span>{item}</span>
              </li>
            ))}
            {notObserved.length === 0 && <li style={{ color: "#bbb" }}>—</li>}
          </ul>
        </div>
        {strategicOpportunity && (
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.65, padding: "14px 16px", background: "rgba(240,180,41,0.06)", borderLeft: "2px solid rgba(240,180,41,0.4)", borderRadius: "0 8px 8px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.warn, marginBottom: 6 }}>Proč to ovlivnilo skóre</div>
            {strategicOpportunity}
          </div>
        )}
      </div>
    </>
  );
}

function StrategistCard({ strategist }: { strategist: SuggestedStrategistItem }) {
  return (
    <div className="diag-strategist-card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{strategist.label}</span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", background: C.limeBg, color: C.limeDark, padding: "2px 8px", borderRadius: 6 }}>Fit</span>
      </div>
      {strategist.tagline && <p style={{ fontSize: 11, color: C.textMuted, margin: "0 0 8px 0" }}>{strategist.tagline}</p>}
      {strategist.reason && <p style={{ fontSize: 13, color: C.textMuted2, lineHeight: 1.5, marginBottom: 16 }}>{strategist.reason}</p>}
      <p style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", margin: "0", lineHeight: 1.5, textAlign: "center" }}>
        Plný potenciál Stratéga odhalíme během strategického hovoru.
      </p>
    </div>
  );
}
