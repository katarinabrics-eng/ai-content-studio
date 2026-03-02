"use client";

import { useState } from "react";

const GUIDANCE_QUESTIONS = [
  { id: "positioning", question: "Jak byste nejlépe popsali hlavní zaměření vašeho podnikání?", options: ["Prémiové služby pro náročné klienty", "Dostupné řešení pro širokou veřejnost", "Specializovaný expert v oboru", "Kreativní studio / tvůrčí práce"] },
  { id: "audience", question: "Kdo je váš typický klient?", options: ["Podnikatelé a manažeři", "Ženy budující osobní značku", "Malé a střední firmy", "Kreativci a freelanceři"] },
  { id: "goals", question: "Co je hlavní cíl komunikace na sociálních sítích?", options: ["Budovat důvěru a autoritu", "Generovat přímé poptávky", "Vzdělávat a inspirovat", "Ukázat zákulisí a osobnost"] },
  { id: "style", question: "Jaký tón komunikace vám sedí?", options: ["Klidný a autoritativní", "Přátelský a osobní", "Odborný a precizní", "Inspirativní a energický"] },
];

type BrandScore = { total?: number; hasHeadline?: boolean; hasOffer?: boolean; hasTargetAudience?: boolean; hasCTA?: boolean; hasVisualIdentity?: boolean; hasSocialProof?: boolean };
type VisualStyle = { primaryColor?: string; secondaryColor?: string; mood?: string; typography?: string };
type BrandDna = {
  name?: string; positioning?: string; tone?: string; targetAudience?: string; communicationStyle?: string;
  contentPillars?: string[]; uniqueValue?: string; missingElements?: string[]; visualStyle?: VisualStyle;
};
type Result = { brandScore?: BrandScore; brandDna?: BrandDna; summary?: string };
type Scraped = { markdown?: string; screenshot?: string | null; url?: string; title?: string; description?: string };

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#a8e063" : score >= 40 ? "#f5c842" : "#e05a5a";
  const label = score >= 70 ? "Silná značka" : score >= 40 ? "Potřebuje doplnění" : "Slabé podklady";
  const c = 2 * Math.PI * 40;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a28" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${(score / 100) * c} ${c}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 700, color }}>{score}</span>
          <span style={{ fontSize: 9, color: "#444" }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}

function Check({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 9, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
      <span style={{ color: ok ? "#a8e063" : "#333", fontSize: 13, minWidth: 16 }}>{ok ? "✓" : "✗"}</span>
      <span style={{ fontSize: 12, color: ok ? "#bbb" : "#444" }}>{label}</span>
    </div>
  );
}

function Pill({ text, color = "#666" }: { text: string; color?: string }) {
  return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: color + "18", border: `1px solid ${color}30`, color }}>{text}</span>;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function ColorDot({ hex }: { hex?: string }) {
  if (!hex) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 14, height: 14, borderRadius: "50%", background: hex, border: "1px solid rgba(255,255,255,0.1)", display: "inline-block" }} />
      <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>{hex}</span>
    </span>
  );
}

const C = {
  card: { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 12 },
  lbl: { fontSize: 9, color: "#444", textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: 5, display: "block" },
  inp: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const },
  btn: { width: "100%", padding: 13, background: "#a8e063", color: "#000", fontWeight: 700, fontSize: 14, border: "none", borderRadius: 10, cursor: "pointer" as const, marginTop: 10 },
};

export function StartAnalyzer({ diagnostika = false }: { diagnostika?: boolean }) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "guidance" | "result">("input");
  const [msg, setMsg] = useState("");
  const [scraped, setScraped] = useState<Scraped | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const allAnswered = GUIDANCE_QUESTIONS.every((q) => answers[q.id]);
  const score = result?.brandScore?.total ?? 0;

  const analyze = async () => {
    if (!url.trim()) return;
    setError("");
    setResult(null);
    setScraped(null);
    setAnswers({});
    try {
      setPhase("loading");
      setMsg("Načítám web (text + screenshot)...");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          ...(diagnostika ? { format: "diagnostika" } : {}),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      let data: { result?: Result; scraped?: Scraped; error?: string };
      try {
        data = await res.json();
      } catch {
        setError("Server vrátil neplatnou odpověď. Zkuste to znovu.");
        setPhase("input");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Chyba analýzy");
      setScraped(data.scraped ?? null);
      const resResult = data.result;
      setResult(
        typeof resResult === "object" && resResult !== null
          ? (resResult as Result)
          : null
      );
      const total = (resResult as Result)?.brandScore?.total ?? 0;
      setPhase(total < 60 ? "guidance" : "result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepodařilo se analyzovat.";
      const friendly =
        msg === "fetch failed" || msg === "Failed to fetch"
          ? "Spojení se serverem selhalo. Zkontrolujte, že server běží a že v .env.local máte OPENAI_API_KEY a FIRECRAWL_API_KEY."
          : msg.includes("abort") || (e instanceof Error && e.name === "AbortError")
            ? "Požadavek vypršel (timeout). Zkuste to znovu."
            : msg;
      setError(friendly);
      setPhase("input");
    }
  };

  const confirmGuidance = async () => {
    setPhase("loading");
    setMsg("Obohacuji Brand DNA o vaše odpovědi...");
    try {
      const res = await fetch("/api/analyze/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, brandDna: result?.brandDna, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      if (data.result) setResult(data.result);
    } catch {
      // keep current result
    }
    setPhase("result");
  };

  const reset = () => {
    setPhase("input");
    setUrl("");
    setResult(null);
    setScraped(null);
    setAnswers({});
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c14", color: "#e7e7ef", fontFamily: "system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .analyzer-fade{animation:up 0.35s ease}
        .analyzer-inp:focus{border-color:rgba(168,224,99,0.4)!important;background:rgba(255,255,255,0.07)!important}
      `}</style>

      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "13px 22px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(168,224,99,0.1)", border: "1px solid rgba(168,224,99,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#a8e063" }}>L</div>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a3a4a" }}>Lucifera <span style={{ color: "#a8e063" }}>·</span> AI Content System</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#222", background: "#161622", padding: "2px 8px", borderRadius: 5 }}>Web Analyzer · screenshot + text + vision</span>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "44px 20px 80px" }}>

        {phase === "input" && (
          <div className="analyzer-fade">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(168,224,99,0.07)", border: "1px solid rgba(168,224,99,0.15)", color: "#a8e063", fontSize: 11, marginBottom: 18 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a8e063" }} />
                Modul 1 · Analýza značky
              </span>
              <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3, marginBottom: 10, color: "#fff" }}>
                Zadejte web.<br /><span style={{ color: "#2a2a3a" }}>Zbytek uděláme za vás.</span>
              </h1>
              <p style={{ color: "#3a3a4a", fontSize: 13, lineHeight: 1.7 }}>
                Firecrawl načte <strong style={{ color: "#555" }}>screenshot + text</strong> · Claude vidí web jako člověk<br />
                Výsledek: přesná Brand DNA postavená na realitě
              </p>
            </div>
            <div style={C.card}>
              <label style={C.lbl}>URL webu klienta</label>
              <input className="analyzer-inp" style={C.inp} placeholder="simby.cz nebo studiolucifera.cz" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()} />
              {error && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(224,90,90,0.07)", border: "1px solid rgba(224,90,90,0.2)", borderRadius: 8, color: "#e05a5a", fontSize: 13 }}>⚠ {error}</div>
              )}
              <button type="button" style={{ ...C.btn, opacity: url.trim() ? 1 : 0.3 }} onClick={analyze} disabled={!url.trim()}>Analyzovat →</button>
            </div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
              {["Screenshot webu", "Analýza textu", "Claude Vision", "Brand DNA"].map((t) => (
                <span key={t} style={{ fontSize: 10, color: "#2a2a3a" }}>✓ {t}</span>
              ))}
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ position: "relative", width: 52, height: 52, margin: "0 auto 20px" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(168,224,99,0.08)" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#a8e063", animation: "spin 0.9s linear infinite" }} />
            </div>
            <p style={{ color: "#a8e063", fontSize: 14, fontWeight: 500 }}>{msg}</p>
            <p style={{ color: "#2a2a3a", fontSize: 11, marginTop: 6 }}>cca 15–25 sekund</p>
          </div>
        )}

        {phase === "guidance" && result && (
          <div className="analyzer-fade">
            <button type="button" onClick={reset} style={{ background: "none", border: "none", color: "#333", fontSize: 12, cursor: "pointer", marginBottom: 14 }}>← zpět</button>
            {scraped?.screenshot && (
              <div style={{ ...C.card, padding: 10, marginBottom: 12 }}>
                <span style={C.lbl}>Náhled webu</span>
                <img src={scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`} alt="screenshot webu" style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", maxHeight: 200, objectFit: "cover", objectPosition: "top" }} />
              </div>
            )}
            <div style={{ ...C.card, display: "flex", gap: 18, alignItems: "center" }}>
              <ScoreRing score={score} />
              <div>
                <p style={{ fontSize: 12, color: "#333", marginBottom: 4 }}>{url}</p>
                <p style={{ fontSize: 14, color: "#ccc", fontWeight: 600, marginBottom: 4 }}>Web nemá dostatek podkladů</p>
                <p style={{ fontSize: 12, color: "#444" }}>Doplňte výběrem – žádné psaní.</p>
              </div>
            </div>
            {GUIDANCE_QUESTIONS.map((q, i) => (
              <div key={q.id} style={C.card}>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(168,224,99,0.1)", color: "#a8e063", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 13, color: "#ddd", lineHeight: 1.5 }}>{q.question}</p>
                </div>
                {q.options.map((o) => (
                  <button key={o} type="button" onClick={() => setAnswers((p) => ({ ...p, [q.id]: o }))} style={{ width: "100%", textAlign: "left", padding: "9px 13px", borderRadius: 8, border: answers[q.id] === o ? "1px solid #a8e063" : "1px solid rgba(255,255,255,0.07)", background: answers[q.id] === o ? "rgba(168,224,99,0.07)" : "rgba(255,255,255,0.02)", color: answers[q.id] === o ? "#a8e063" : "#666", fontSize: 12, cursor: "pointer", marginBottom: 5 }}>{o}</button>
                ))}
              </div>
            ))}
            <button type="button" style={{ ...C.btn, opacity: allAnswered ? 1 : 0.3 }} onClick={confirmGuidance} disabled={!allAnswered}>Zobrazit Brand DNA →</button>
          </div>
        )}

        {phase === "result" && result && (
          <div className="analyzer-fade">
            <button type="button" onClick={reset} style={{ background: "none", border: "none", color: "#333", fontSize: 12, cursor: "pointer", marginBottom: 14 }}>← Analyzovat jiný web</button>
            {scraped?.screenshot && (
              <div style={{ ...C.card, padding: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={C.lbl}>Vizuální náhled webu</span>
                  <span style={{ fontSize: 10, color: "#333" }}>Firecrawl screenshot</span>
                </div>
                <img src={scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`} alt="screenshot" style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", maxHeight: 260, objectFit: "cover", objectPosition: "top" }} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div style={{ ...C.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, margin: 0 }}>
                <ScoreRing score={score} />
                <p style={{ fontSize: 10, color: "#2a2a3a", textAlign: "center", wordBreak: "break-all" }}>{scraped?.url}</p>
              </div>
              <div style={{ ...C.card, margin: 0 }}>
                <span style={C.lbl}>Co jsme našli</span>
                <Check label="Positioning / headline" ok={result.brandScore?.hasHeadline} />
                <Check label="Definovaná nabídka" ok={result.brandScore?.hasOffer} />
                <Check label="Cílová skupina" ok={result.brandScore?.hasTargetAudience} />
                <Check label="Výzva k akci" ok={result.brandScore?.hasCTA} />
                <Check label="Vizuální identita" ok={result.brandScore?.hasVisualIdentity} />
                <Check label="Reference / důkazy" ok={result.brandScore?.hasSocialProof} />
              </div>
            </div>
            <div style={C.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={C.lbl}>Brand DNA</span>
                {result.brandDna?.communicationStyle && <Pill text={result.brandDna.communicationStyle} color="#a8e063" />}
              </div>
              <Row label="Název" value={result.brandDna?.name} />
              <Row label="Positioning" value={result.brandDna?.positioning} />
              <Row label="Tón" value={result.brandDna?.tone} />
              <Row label="Cílová skupina" value={result.brandDna?.targetAudience} />
              <Row label="Unikátní hodnota" value={result.brandDna?.uniqueValue} />
              {result.brandDna?.visualStyle && (
                <div style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Vizuální styl</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
                    <ColorDot hex={result.brandDna.visualStyle.primaryColor} />
                    <ColorDot hex={result.brandDna.visualStyle.secondaryColor} />
                  </div>
                  {result.brandDna.visualStyle.mood && <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{result.brandDna.visualStyle.mood}</p>}
                  {result.brandDna.visualStyle.typography && <p style={{ fontSize: 11, color: "#444", marginTop: 3 }}>{result.brandDna.visualStyle.typography}</p>}
                </div>
              )}
              {result.brandDna?.contentPillars && result.brandDna.contentPillars.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <span style={C.lbl}>Obsahové pilíře</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {result.brandDna.contentPillars.map((p) => <Pill key={p} text={p} color="#777" />)}
                  </div>
                </div>
              )}
              {result.brandDna?.missingElements && result.brandDna.missingElements.length > 0 && (
                <div>
                  <span style={C.lbl}>Co posílí brand</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {result.brandDna.missingElements.map((m) => <Pill key={m} text={m} color="#e05a5a" />)}
                  </div>
                </div>
              )}
            </div>
            {result.summary && (
              <div style={{ ...C.card, borderColor: "rgba(168,224,99,0.1)", background: "rgba(168,224,99,0.015)" }}>
                <span style={C.lbl}>Hodnocení stratéga</span>
                <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.7 }}>{result.summary}</p>
              </div>
            )}
            <details style={{ marginBottom: 12 }}>
              <summary style={{ fontSize: 11, color: "#2a2a3a", cursor: "pointer", padding: "6px 0", userSelect: "none" }}>
                Načtený text webu ({Math.round((scraped?.markdown?.length ?? 0) / 100) / 10}k znaků)
              </summary>
              <div style={{ ...C.card, marginTop: 6, maxHeight: 160, overflow: "auto" }}>
                <pre style={{ fontSize: 10, color: "#333", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{scraped?.markdown?.slice(0, 2000)}...</pre>
              </div>
            </details>
            <div style={{ ...C.card, textAlign: "center", borderColor: "rgba(168,224,99,0.15)", background: "rgba(168,224,99,0.015)" }}>
              <p style={{ color: "#a8e063", fontWeight: 600, marginBottom: 5 }}>Brand DNA připravena ✓</p>
              {diagnostika ? (
                <p style={{ color: "#333", fontSize: 12 }}>Výsledek diagnostiky je připraven.</p>
              ) : (
                <>
                  <p style={{ color: "#333", fontSize: 12, marginBottom: 14 }}>Modul 2: generátor postů ve stylu tohoto klienta</p>
                  <button type="button" style={{ ...C.btn, maxWidth: 260, margin: "0 auto" }}>Pokračovat na tvorbu obsahu →</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
