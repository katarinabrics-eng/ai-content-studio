"use client";

import { useEffect, useRef, useState } from "react";
import type { ScanResult, PillarAnalysisItem, SuggestedStrategistItem } from "@/app/start/ScanResultScrollExperience";

const C = {
  bg: "#fafaf8",
  surface: "#ffffff",
  border: "#e8e8e0",
  text: "#111111",
  textMuted: "#888888",
  textMuted2: "#555555",
  lime: "#b4e842",
  limeDark: "#8fc42a",
  limeBg: "#f2fcd8",
  warn: "#f0b429",
  danger: "#ef4444",
} as const;

const PILLAR_IDS = ["light", "energy", "architecture", "identity", "trust"] as const;
const PILLAR_LABELS: Record<string, { title: string; sub: string }> = {
  light: { title: "SVĚTLO", sub: "Clarity of Value" },
  energy: { title: "ENERGIE", sub: "" },
  architecture: { title: "ARCHITEKTURA", sub: "" },
  identity: { title: "IDENTITA", sub: "" },
  trust: { title: "DŮVĚRA", sub: "" },
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

  // Screenshot: skeleton 1.5s then reveal image with fade + scale
  useEffect(() => {
    if (!screenshotSrc) {
      const t = setTimeout(() => setPlaceholderGone(true), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setScreenshotReveal(true), 1500);
    return () => clearTimeout(t);
  }, [screenshotSrc]);

  const screenshotSrc = scraped?.screenshot
    ? (scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`)
    : null;

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
        .diag-results-container { max-width: 720px; margin: 0 auto; padding: 24px; }
        .diag-hero-label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.textMuted}; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .diag-hero-label-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.lime}; }
        .diag-h1 { font-family: var(--font-playfair), serif; font-weight: 700; font-size: clamp(28px, 4vw, 36px); color: ${C.text}; margin: 0 0 6px 0; }
        .diag-web-preview { border: 1px solid ${C.border}; border-radius: 12px; overflow: hidden; background: ${C.surface}; position: relative; margin-top: 16px; }
        .diag-browser-chrome { height: 36px; background: #f0f0ec; border-bottom: 1px solid ${C.border}; display: flex; align-items: center; gap: 8px; padding: 0 12px; }
        .diag-browser-dots { display: flex; gap: 6px; }
        .diag-browser-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .diag-browser-url { flex: 1; font-size: 11px; color: ${C.textMuted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 8px; }
        .diag-preview-img { width: 100%; max-height: 200px; object-fit: cover; display: block; }
        .diag-preview-img.animate-in { animation: diagImgReveal 0.6s ease-out forwards; opacity: 0; transform: scale(0.95); }
        .diag-preview-placeholder { min-height: 140px; background: #e8e8e4; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
        .diag-preview-skeleton { height: 8px; background: linear-gradient(90deg, #ddd 25%, #e0e0dc 50%, #ddd 75%); background-size: 200% 100%; animation: diagSkeleton 1.2s ease-in-out infinite; border-radius: 4px; margin-bottom: 8px; width: 80%; }
        .diag-badge { position: absolute; top: 8px; right: 8px; background: #111; color: ${C.lime}; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 6px; }
        @keyframes diagImgReveal {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes diagSkeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .diag-score-card { background: ${C.surface}; border-radius: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); padding: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; }
        .diag-pullquote { text-align: center; font-family: var(--font-playfair), serif; font-style: italic; font-size: 20px; color: #aaa; margin: 32px 0; }
        .diag-divider { height: 1px; background: ${C.border}; margin: 24px 0; }
        .diag-section-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: ${C.textMuted}; margin-bottom: 16px; }
        .diag-pillar-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; margin-bottom: 12px; overflow: hidden; transition: max-height 0.4s ease; }
        .diag-pillar-card.visible { animation: diagFadeUp 0.5s ease forwards; }
        @keyframes diagFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .diag-score-pillar-row { opacity: 0; transform: translateY(10px); }
        .diag-score-pillar-row.visible { animation: diagTagReveal 0.4s ease forwards; }
        @keyframes diagTagReveal {
          to { opacity: 1; transform: translateY(0); }
        }
        .diag-dna-tag { opacity: 0; transform: translateY(10px); }
        .diag-dna-tag.visible { animation: diagTagReveal 0.4s ease forwards; }
        .diag-rec-card { opacity: 0; transform: translateY(20px); }
        .diag-rec-card.visible { animation: diagRecReveal 0.5s ease forwards; }
        @keyframes diagRecReveal {
          to { opacity: 1; transform: translateY(0); }
        }
        .diag-strategist-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; padding: 20px; }
        .diag-cta-dark { background: #111; color: #fff; border-radius: 20px; padding: 32px; text-align: center; }
        .diag-email-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; padding: 24px; }
        @media (max-width: 600px) {
          .diag-score-card { grid-template-columns: 1fr; }
          .diag-strategist-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {onBack && (
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={onBack}
            style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", padding: 0 }}
          >
            ← Analyzovat jiný web
          </button>
        </div>
      )}

      <div className="diag-results-container">
        {/* 1. HERO */}
        <section style={{ marginBottom: 32 }}>
          <p className="diag-hero-label">
            <span className="diag-hero-label-dot" />
            VÝSLEDKY DIAGNOSTIKY
          </p>
          <h1 className="diag-h1">{brandName}</h1>
          {webUrl && <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{webUrl}</p>}

          <div className="diag-web-preview">
            <div className="diag-browser-chrome">
              <div className="diag-browser-dots">
                <span style={{ background: "#ef4444" }} />
                <span style={{ background: "#f59e0b" }} />
                <span style={{ background: "#22c55e" }} />
              </div>
              <span className="diag-browser-url">{webUrl || "—"}</span>
            </div>
            {screenshotSrc ? (
              <>
                {!screenshotReveal ? (
                  <div className="diag-preview-placeholder">
                    <div className="diag-preview-skeleton" />
                    <div className="diag-preview-skeleton" style={{ width: "60%" }} />
                    <div className="diag-preview-skeleton" style={{ width: "70%" }} />
                  </div>
                ) : (
                  <img
                    src={screenshotSrc}
                    alt=""
                    className={`diag-preview-img ${screenshotLoaded ? "animate-in" : ""}`}
                    onLoad={() => setScreenshotLoaded(true)}
                  />
                )}
              </>
            ) : placeholderGone ? (
              <div className="diag-preview-placeholder" style={{ background: C.surface }}>
                <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Web byl analyzován</p>
                {webUrl && <p style={{ fontSize: 11, color: C.textMuted2, marginTop: 4 }}>{webUrl}</p>}
              </div>
            ) : (
              <div className="diag-preview-placeholder">
                <div className="diag-preview-skeleton" />
                <div className="diag-preview-skeleton" style={{ width: "60%" }} />
                <div className="diag-preview-skeleton" style={{ width: "70%" }} />
              </div>
            )}
            <span className="diag-badge">✓ ANALYZOVÁNO</span>
          </div>
        </section>

        {/* 2. SCORE */}
        <section ref={scoreRef} style={{ marginBottom: 40 }}>
          <div className="diag-score-card">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ScoreRingSVG value={scoreVisible ? scoreAnimated : 0} />
              <span style={{ fontFamily: "var(--font-playfair), serif", fontWeight: 700, fontSize: 42, color: C.text, marginTop: -80 }}>
                {scoreAnimated}
              </span>
              <span style={{ fontSize: 14, color: C.textMuted, marginTop: -4 }}>/100</span>
            </div>
            <div>
              {PILLAR_IDS.map((id, idx) => {
                const p = pillarAnalysis[id] as PillarAnalysisItem | undefined;
                const score = p?.score ?? 0;
                const label = PILLAR_LABELS[id];
                const rowVisible = scoreVisible;
                return (
                  <div
                    key={id}
                    className={`diag-score-pillar-row ${rowVisible ? "visible" : ""}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      animationDelay: `${idx * 80}ms`,
                    }}
                  >
                    <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{label?.title ?? id}</span>
                    <span style={{ fontFamily: "var(--font-playfair), serif", fontWeight: 700, fontSize: 18, color: getScoreColor(score) }}>
                      {score}/10
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. PULLQUOTE */}
        {summary && (
          <section style={{ marginBottom: 24 }}>
            <p className="diag-pullquote">&ldquo;{summary}&rdquo;</p>
            <div className="diag-divider" />
          </section>
        )}

        {/* 3b. BRAND DNA — tagy s fade-in + translateY, stagger 80ms */}
        {(() => {
          const d = result.brandDna as Record<string, unknown> | undefined;
          if (!d) return null;
          const tags: { label: string; value: string }[] = [];
          if (d.positioning && String(d.positioning).trim()) tags.push({ label: "Positioning", value: String(d.positioning).trim() });
          if (d.tone && String(d.tone).trim()) tags.push({ label: "Tón", value: String(d.tone).trim() });
          if (d.targetAudience && String(d.targetAudience).trim()) tags.push({ label: "Cílová skupina", value: String(d.targetAudience).trim() });
          if (d.communicationStyle && String(d.communicationStyle).trim()) tags.push({ label: "Komunikace", value: String(d.communicationStyle).trim() });
          if (d.uniqueValue && String(d.uniqueValue).trim()) tags.push({ label: "Unikátní hodnota", value: String(d.uniqueValue).trim() });
          const vs = d.visualStyle as Record<string, string> | undefined;
          if (vs?.primaryColor) tags.push({ label: "Barva", value: vs.primaryColor });
          if (vs?.typography) tags.push({ label: "Typografie", value: vs.typography });
          if (tags.length === 0) return null;
          return (
            <section ref={dnaRef} style={{ marginBottom: 32 }}>
              <p className="diag-section-label">BRAND DNA</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tags.map((tag, idx) => (
                  <div
                    key={tag.label}
                    className={`diag-dna-tag ${dnaVisible ? "visible" : ""}`}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      color: C.text,
                      animationDelay: `${idx * 80}ms`,
                    }}
                  >
                    <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textMuted, display: "block", marginBottom: 4 }}>{tag.label}</span>
                    <span style={{ lineHeight: 1.4 }}>{tag.value}</span>
                  </div>
                ))}
              </div>
              <div className="diag-divider" style={{ marginTop: 24 }} />
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

        {/* 5. STRATÉGOVÉ — scroll-triggered fade-in + translateY */}
        {suggested.length > 0 && (
          <section ref={recsRef} style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 13, color: C.textMuted2, textAlign: "center", marginBottom: 16, fontStyle: "italic" }}>
              Pokud vás zajímá konkrétní strategický směr, můžeme ho probrat na strategickém hovoru.
            </p>
            <p className="diag-section-label">AI DOPORUČUJE PRO TUTO ZNAČKU</p>
            <div className="diag-strategist-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {suggested.slice(0, 2).map((s, idx) => (
                <div
                  key={s.id}
                  className={`diag-rec-card ${recsVisible ? "visible" : ""}`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <StrategistCard strategist={s} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. CTA */}
        {!hideCta && (
          <section style={{ marginBottom: 40 }}>
            <div className="diag-cta-dark">
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontWeight: 700, fontSize: 24, margin: "0 0 8px 0" }}>
                Značka má potenciál.
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", margin: "0 0 24px 0" }}>
                Otázka je, zda ho chcete využít.
              </p>
              <a
                href="/rezervace"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 24px",
                  background: C.lime,
                  color: C.text,
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 12,
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Rezervovat strategický hovor
              </a>
            </div>
          </section>
        )}

        {/* 7. EMAIL CAPTURE */}
        {!hideCta && showEmailCapture && onSaveLead && (
          <section>
            <div className="diag-email-card">
              <h3 style={{ fontFamily: "var(--font-playfair), serif", fontWeight: 700, fontSize: 18, margin: "0 0 16px 0", color: C.text }}>
                Nechte nám e-mail
              </h3>
              {leadSubmitted && accessUrl ? (
                <p style={{ fontSize: 13, color: C.textMuted2, marginBottom: 8 }}>
                  Váš odkaz pro návrat k výsledkům (platný 7 dní):{" "}
                  <a href={accessUrl} style={{ color: C.lime, wordBreak: "break-all" }}>{accessUrl}</a>
                </p>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="vas@email.cz"
                      style={{
                        flex: 1,
                        minWidth: 180,
                        padding: "10px 14px",
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        fontSize: 14,
                        background: C.surface,
                      }}
                    />
                    <button
                      type="button"
                      disabled={leadSubmitting || !leadEmail.trim()}
                      onClick={() => onSaveLead({ email: leadEmail.trim(), name: leadName || undefined, web: leadWeb || undefined })}
                      style={{
                        padding: "10px 20px",
                        background: C.text,
                        color: C.surface,
                        border: "none",
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: leadSubmitting ? "wait" : "pointer",
                      }}
                    >
                      {leadSubmitting ? "Odesílám…" : "Uložit"}
                    </button>
                  </div>
                  {leadError && <p style={{ fontSize: 13, color: C.danger, marginTop: 8 }}>{leadError}</p>}
                  {leadSubmitted && !accessUrl && <p style={{ fontSize: 13, color: C.lime, marginTop: 8 }}>Odesláno. Brzy vám pošleme odkaz.</p>}
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ScoreRingSVG({ value }: { value: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={60} cy={60} r={r} fill="none" stroke={C.border} strokeWidth={8} />
      <circle
        cx={60}
        cy={60}
        r={r}
        fill="none"
        stroke={C.lime}
        strokeWidth={8}
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1.5s cubic-bezier(0, 0, 0.2, 1)",
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
  const [barWidth, setBarWidth] = useState(0);
  const [scoreAnimated, setScoreAnimated] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const startBar = setTimeout(() => setBarWidth(score * 10), staggerDelayMs);
    return () => clearTimeout(startBar);
  }, [isVisible, score, staggerDelayMs]);

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

  return (
    <>
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{title}</span>
            {subTitle && <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 6 }}>— {subTitle}</span>}
          </div>
          <span style={{ fontFamily: "var(--font-playfair), serif", fontWeight: 700, fontSize: 24, color }}>{scoreAnimated}/10</span>
        </div>
        <div style={{ height: 3, background: C.border, borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${barWidth}%`,
              background: color,
              borderRadius: 2,
              transition: "width 0.8s cubic-bezier(0, 0, 0.2, 1)",
              transitionDelay: `${staggerDelayMs}ms`,
            }}
          />
        </div>
        {interpretation && <p style={{ fontSize: 14, color: C.textMuted2, marginTop: 12, lineHeight: 1.5 }}>{interpretation}</p>}
        <button
          type="button"
          onClick={onToggle}
          style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", marginTop: 12, padding: 0 }}
        >
          {isExpanded ? "↑ Skrýt detail" : "↓ Zobrazit detail"}
        </button>
      </div>
      <div
        className="diag-pillar-detail"
        style={{
          borderTop: `1px solid #f0f0e8`,
          background: C.bg,
          padding: 20,
          maxHeight: isExpanded ? 800 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 8 }}>CO JSME ZAZNAMENALI</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.text, lineHeight: 1.6 }}>
              {observed.map((item, i) => (
                <li key={i} style={{ marginBottom: 4 }}><span style={{ color: C.lime, marginRight: 6 }}>✓</span>{item}</li>
              ))}
              {observed.length === 0 && <li style={{ color: C.textMuted }}>—</li>}
            </ul>
          </div>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 8 }}>CO CHYBÍ / CO ZLEPŠIT</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.text, lineHeight: 1.6, listStyle: "circle" }}>
              {notObserved.map((item, i) => (
                <li key={i} style={{ marginBottom: 4 }}><span style={{ color: C.danger, marginRight: 6 }}>○</span>{item}</li>
              ))}
              {notObserved.length === 0 && <li style={{ color: C.textMuted }}>—</li>}
            </ul>
          </div>
        </div>
        {strategicOpportunity && (
          <div style={{ borderLeft: `3px solid ${color}`, background: C.surface, padding: "12px 16px", marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>DOPORUČENÝ SMĚR</p>
            <p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: 1.5 }}>{strategicOpportunity}</p>
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
      <a
        href="/rezervace"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 16px",
          background: C.text,
          color: C.surface,
          fontWeight: 600,
          fontSize: 13,
          borderRadius: 10,
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        Spustit →
      </a>
    </div>
  );
}
