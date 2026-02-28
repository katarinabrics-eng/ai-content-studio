"use client";

import { Figtree } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const figtree = Figtree({ weight: ["400", "600"], subsets: ["latin", "latin-ext"] });

type TabId = "premiova" | "brandfoceni" | "portret" | "rodinne";

const TABS: { id: TabId; label: string; subtitle: string }[] = [
  { id: "premiova", label: "Prémiová vizuální identita", subtitle: "Budujeme obraz, který obstojí dlouhodobě." },
  { id: "brandfoceni", label: "Brand focení", subtitle: "Profesionální portréty pro váš brand – včetně vizuálního boardu." },
  { id: "portret", label: "Portrétní focení", subtitle: "Obraz, který mluví za vás." },
  { id: "rodinne", label: "Rodinné focení", subtitle: "Zachycený čas bez stresu." },
];

// ─── Analysis types (for Prémiová paid flow) ───
type BrandScore = { total?: number; hasHeadline?: boolean; hasOffer?: boolean; hasTargetAudience?: boolean; hasCTA?: boolean; hasVisualIdentity?: boolean; hasSocialProof?: boolean };
type VisualStyle = { primaryColor?: string; secondaryColor?: string; mood?: string; typography?: string };
type BrandDna = {
  name?: string; positioning?: string; tone?: string; targetAudience?: string; communicationStyle?: string;
  contentPillars?: string[]; uniqueValue?: string; missingElements?: string[]; visualStyle?: VisualStyle;
};
type AnalysisResult = { brandScore?: BrandScore; brandDna?: BrandDna; summary?: string };
type Scraped = { markdown?: string; screenshot?: string | null; url?: string };

const GUIDANCE_QUESTIONS = [
  { id: "positioning", question: "Jak byste nejlépe popsali hlavní zaměření vašeho podnikání?", options: ["Prémiové služby pro náročné klienty", "Dostupné řešení pro širokou veřejnost", "Specializovaný expert v oboru", "Kreativní studio / tvůrčí práce"] },
  { id: "audience", question: "Kdo je váš typický klient?", options: ["Podnikatelé a manažeři", "Ženy budující osobní značku", "Malé a střední firmy", "Kreativci a freelanceři"] },
  { id: "goals", question: "Co je hlavní cíl komunikace na sociálních sítích?", options: ["Budovat důvěru a autoritu", "Generovat přímé poptávky", "Vzdělávat a inspirovat", "Ukázat zákulisí a osobnost"] },
  { id: "style", question: "Jaký tón komunikace vám sedí?", options: ["Klidný a autoritativní", "Přátelský a osobní", "Odborný a precizní", "Inspirativní a energický"] },
];

export function BookingGate() {
  const searchParams = useSearchParams();
  const from = (searchParams.get("from") as TabId) || "premiova";
  const [activeTab, setActiveTab] = useState<TabId>(from);

  useEffect(() => {
    const f = searchParams.get("from") as TabId | null;
    if (f && ["premiova", "brandfoceni", "portret", "rodinne"].includes(f)) setActiveTab(f);
  }, [searchParams]);

  return (
    <div
      className={figtree.className}
      style={{
        minHeight: "100vh",
        background: "#F7F7F5",
        color: "#1A1A1A",
        padding: "80px 24px",
      }}
    >
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .gate-fade{animation:up 0.35s ease}
        .gate-input:focus{outline:none;border-color:#B7E300;box-shadow:0 0 0 1px #B7E300}
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 12 }}>Lucifera Studio</p>
          <h1 style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.25, color: "#1A1A1A", marginBottom: 12 }}>
            Spolupráce začíná jasností.
          </h1>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#1A1A1A", marginBottom: 16 }}>
            Vyberte typ spolupráce.
          </h2>
          <p style={{ fontSize: 17, color: "#6F6F6F", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 24px" }}>
            Každá služba má jiný proces. Provedeme vás krok za krokem.
          </p>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 24px", background: "#FFFFFF", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #EAEAE7", textAlign: "left" }}>
            <p style={{ fontSize: 13, color: "#6F6F6F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Co se zde odehrává</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 12 }}>
              Na této stránce zvolíte typ spolupráce, vyplníte základní údaje a podle typu služby buď domluvíte konzultaci zdarma, nebo (u prémiové vizuální identity a brand focení s placeným boardem) nejdříve analyzujeme váš web a připravíme vizuální směr. Po dokončení kroku vás provedeme k výběru termínu a zahájení spolupráce.
            </p>
            <p style={{ fontSize: 13, color: "#6F6F6F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Co potřebujete k zahájení</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6 }}>
              U prémiové identity a brand focení (varianta s vizuálním boardem za 1 850 Kč) URL vašeho webu. U ostatních služeb stačí vyplnit krátký formulář a zvolit termín. Platbu řešíme až po domluvě.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: "1px solid #EAEAE7" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "14px 20px",
                background: activeTab === t.id ? "#FFFFFF" : "transparent",
                border: "1px solid #EAEAE7",
                marginBottom: activeTab === t.id ? -1 : 0,
                fontWeight: activeTab === t.id ? 600 : 400,
                color: "#1A1A1A",
                cursor: "pointer",
                fontSize: 15,
                boxShadow: activeTab === t.id ? "0 10px 30px rgba(0,0,0,0.04)" : "none",
                borderRadius: "12px 12px 0 0",
                transition: "all 0.3s ease",
                borderBottom: activeTab === t.id ? "3px solid #B7E300" : "1px solid #EAEAE7",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dynamic form container */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            padding: 40,
          }}
        >
          {activeTab === "premiova" && <PremiovaFlow />}
          {activeTab === "brandfoceni" && <BrandFoceniFlow />}
          {activeTab === "portret" && <PortretFlow />}
          {activeTab === "rodinne" && <RodinneFlow />}
        </div>
      </div>
    </div>
  );
}

function PremiovaFlow() {
  const [variant, setVariant] = useState<"free" | "paid">("free");
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "guidance" | "result">("input");
  const [msg, setMsg] = useState("");
  const [scraped, setScraped] = useState<Scraped | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba analýzy");
      setScraped(data.scraped ?? null);
      setResult(data.result ?? null);
      setPhase((data.result?.brandScore?.total ?? 0) < 60 ? "guidance" : "result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepodařilo se analyzovat.");
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
    } catch {}
    setPhase("result");
  };

  const resetAnalysis = () => {
    setPhase("input");
    setUrl("");
    setResult(null);
    setScraped(null);
    setAnswers({});
    setError("");
  };

  if (phase === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: 48, height: 48, margin: "0 auto 20px", borderRadius: "50%", border: "2px solid #EAEAE7", borderTopColor: "#B7E300", animation: "spin 0.9s linear infinite" }} />
        <p style={{ color: "#1A1A1A", fontSize: 16, fontWeight: 500 }}>{msg}</p>
        <p style={{ color: "#6F6F6F", fontSize: 14, marginTop: 8 }}>cca 15–25 sekund</p>
      </div>
    );
  }

  if (phase === "guidance" && result) {
    return (
      <div className="gate-fade">
        <button type="button" onClick={resetAnalysis} style={{ background: "none", border: "none", color: "#6F6F6F", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Zpět</button>
        {scraped?.screenshot && (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #EAEAE7" }}>
            <img src={scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`} alt="Náhled webu" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24, padding: 20, background: "#F7F7F5", borderRadius: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444" }}>{score}</div>
          <div>
            <p style={{ fontSize: 14, color: "#6F6F6F" }}>{url}</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>Web nemá dostatek podkladů</p>
            <p style={{ fontSize: 14, color: "#6F6F6F" }}>Doplňte výběrem – žádné psaní.</p>
          </div>
        </div>
        {GUIDANCE_QUESTIONS.map((q, i) => (
          <div key={q.id} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#1A1A1A", marginBottom: 10 }}>{i + 1}. {q.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((o) => (
                <button key={o} type="button" onClick={() => setAnswers((p) => ({ ...p, [q.id]: o }))} style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: answers[q.id] === o ? "2px solid #B7E300" : "1px solid #EAEAE7", background: answers[q.id] === o ? "rgba(183,227,0,0.08)" : "#FFF", color: "#1A1A1A", fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>{o}</button>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={confirmGuidance} disabled={!allAnswered} style={{ marginTop: 24, padding: "14px 28px", background: allAnswered ? "#B7E300" : "#EAEAE7", color: "#1A1A1A", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: allAnswered ? "pointer" : "not-allowed", opacity: allAnswered ? 1 : 0.7 }}>Zobrazit Brand DNA</button>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="gate-fade">
        <button type="button" onClick={resetAnalysis} style={{ background: "none", border: "none", color: "#6F6F6F", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Analyzovat jiný web</button>
        {scraped?.screenshot && (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #EAEAE7" }}>
            <img src={scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`} alt="Náhled webu" style={{ width: "100%", maxHeight: 240, objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 20, marginBottom: 24, padding: 20, background: "#F7F7F5", borderRadius: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444" }}>{score}</div>
          <div>
            <p style={{ fontSize: 12, color: "#6F6F6F", wordBreak: "break-all" }}>{scraped?.url}</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", marginTop: 4 }}>Brand DNA připravena</p>
          </div>
        </div>
        {result.brandDna && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "#6F6F6F", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Brand DNA</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 8 }}><strong>Název:</strong> {result.brandDna.name}</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6 }}><strong>Positioning:</strong> {result.brandDna.positioning}</p>
            {result.summary && <p style={{ fontSize: 14, color: "#6F6F6F", lineHeight: 1.6, marginTop: 16, fontStyle: "italic" }}>{result.summary}</p>}
          </div>
        )}
        <Link href="/start?from=premiova&step=calendar" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
          Pokračovat k výběru termínu
        </Link>
      </div>
    );
  }

  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <p style={{ fontSize: 17, color: "#6F6F6F", marginBottom: 20 }}>Vyberte variantu</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={() => setVariant("free")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: variant === "free" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: variant === "free" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", transition: "all 0.2s" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Konzultace zdarma</span>
        </button>
        <button type="button" onClick={() => setVariant("paid")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: variant === "paid" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: variant === "paid" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", transition: "all 0.2s" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Konzultace + vizuální board</span>
          <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>1 850 Kč</span>
        </button>
      </div>
      {variant === "free" ? (
        <>
          <p style={{ fontSize: 16, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 32 }}>
            Domluvte si termín konzultace bez závazků. Probereme vaše cíle a doporučíme další postup.
          </p>
          <Link href="/start?from=premiova&step=calendar" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
            Pokračovat k výběru termínu
          </Link>
        </>
      ) : (
        <>
          <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 8 }}>URL vašeho webu</label>
          <input
            type="url"
            className="gate-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="např. vasefirma.cz"
            style={{ width: "100%", padding: "14px 16px", border: "1px solid #EAEAE7", borderRadius: 12, fontSize: 16, color: "#1A1A1A", background: "#FFF", marginBottom: 12 }}
          />
          <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 20 }}>Analyzujeme váš web a připravíme první vizuální směr.</p>
          {error && <p style={{ fontSize: 14, color: "#ef4444", marginBottom: 12 }}>⚠ {error}</p>}
          <button type="button" onClick={analyze} disabled={!url.trim()} style={{ padding: "14px 28px", background: url.trim() ? "#B7E300" : "#EAEAE7", color: "#1A1A1A", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: url.trim() ? "pointer" : "not-allowed", opacity: url.trim() ? 1 : 0.7 }}>
            Analyzovat web
          </button>
        </>
      )}
    </div>
  );
}

function BrandFoceniFlow() {
  const [variant, setVariant] = useState<"free" | "paid">("free");
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "guidance" | "result">("input");
  const [msg, setMsg] = useState("");
  const [scraped, setScraped] = useState<Scraped | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba analýzy");
      setScraped(data.scraped ?? null);
      setResult(data.result ?? null);
      setPhase((data.result?.brandScore?.total ?? 0) < 60 ? "guidance" : "result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepodařilo se analyzovat.");
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
    } catch {}
    setPhase("result");
  };

  const resetAnalysis = () => {
    setPhase("input");
    setUrl("");
    setResult(null);
    setScraped(null);
    setAnswers({});
    setError("");
  };

  if (phase === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: 48, height: 48, margin: "0 auto 20px", borderRadius: "50%", border: "2px solid #EAEAE7", borderTopColor: "#B7E300", animation: "spin 0.9s linear infinite" }} />
        <p style={{ color: "#1A1A1A", fontSize: 16, fontWeight: 500 }}>{msg}</p>
        <p style={{ color: "#6F6F6F", fontSize: 14, marginTop: 8 }}>cca 15–25 sekund</p>
      </div>
    );
  }

  if (phase === "guidance" && result) {
    return (
      <div className="gate-fade">
        <button type="button" onClick={resetAnalysis} style={{ background: "none", border: "none", color: "#6F6F6F", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Zpět</button>
        {scraped?.screenshot && (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #EAEAE7" }}>
            <img src={scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`} alt="Náhled webu" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24, padding: 20, background: "#F7F7F5", borderRadius: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444" }}>{score}</div>
          <div>
            <p style={{ fontSize: 14, color: "#6F6F6F" }}>{url}</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>Web nemá dostatek podkladů</p>
            <p style={{ fontSize: 14, color: "#6F6F6F" }}>Doplňte výběrem – žádné psaní.</p>
          </div>
        </div>
        {GUIDANCE_QUESTIONS.map((q, i) => (
          <div key={q.id} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#1A1A1A", marginBottom: 10 }}>{i + 1}. {q.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((o) => (
                <button key={o} type="button" onClick={() => setAnswers((p) => ({ ...p, [q.id]: o }))} style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: answers[q.id] === o ? "2px solid #B7E300" : "1px solid #EAEAE7", background: answers[q.id] === o ? "rgba(183,227,0,0.08)" : "#FFF", color: "#1A1A1A", fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>{o}</button>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={confirmGuidance} disabled={!allAnswered} style={{ marginTop: 24, padding: "14px 28px", background: allAnswered ? "#B7E300" : "#EAEAE7", color: "#1A1A1A", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: allAnswered ? "pointer" : "not-allowed", opacity: allAnswered ? 1 : 0.7 }}>Zobrazit Brand DNA</button>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="gate-fade">
        <button type="button" onClick={resetAnalysis} style={{ background: "none", border: "none", color: "#6F6F6F", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Analyzovat jiný web</button>
        {scraped?.screenshot && (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #EAEAE7" }}>
            <img src={scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`} alt="Náhled webu" style={{ width: "100%", maxHeight: 240, objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 20, marginBottom: 24, padding: 20, background: "#F7F7F5", borderRadius: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444" }}>{score}</div>
          <div>
            <p style={{ fontSize: 12, color: "#6F6F6F", wordBreak: "break-all" }}>{scraped?.url}</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", marginTop: 4 }}>Brand DNA připravena</p>
          </div>
        </div>
        {result.brandDna && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "#6F6F6F", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Brand DNA</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 8 }}><strong>Název:</strong> {result.brandDna.name}</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6 }}><strong>Positioning:</strong> {result.brandDna.positioning}</p>
            {result.summary && <p style={{ fontSize: 14, color: "#6F6F6F", lineHeight: 1.6, marginTop: 16, fontStyle: "italic" }}>{result.summary}</p>}
          </div>
        )}
        <Link href="/start?from=brandfoceni&step=calendar" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
          Pokračovat k výběru termínu
        </Link>
      </div>
    );
  }

  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <p style={{ fontSize: 17, color: "#6F6F6F", marginBottom: 20 }}>Brand focení – vyberte variantu</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={() => setVariant("free")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: variant === "free" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: variant === "free" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", transition: "all 0.2s" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Konzultace zdarma</span>
        </button>
        <button type="button" onClick={() => setVariant("paid")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: variant === "paid" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: variant === "paid" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", transition: "all 0.2s" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Konzultace + vizuální board</span>
          <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>1 850 Kč</span>
        </button>
      </div>
      {variant === "free" ? (
        <>
          <p style={{ fontSize: 16, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 32 }}>
            Domluvte si termín konzultace bez závazků. Probereme vaše cíle, styl focení a doporučíme další postup.
          </p>
          <Link href="/start?from=brandfoceni&step=calendar" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
            Pokračovat k výběru termínu
          </Link>
        </>
      ) : (
        <>
          <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 8 }}>URL vašeho webu</label>
          <input
            type="url"
            className="gate-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="např. vasefirma.cz"
            style={{ width: "100%", padding: "14px 16px", border: "1px solid #EAEAE7", borderRadius: 12, fontSize: 16, color: "#1A1A1A", background: "#FFF", marginBottom: 12 }}
          />
          <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 20 }}>Analyzujeme váš web a připravíme první vizuální směr pro brand focení.</p>
          {error && <p style={{ fontSize: 14, color: "#ef4444", marginBottom: 12 }}>⚠ {error}</p>}
          <button type="button" onClick={analyze} disabled={!url.trim()} style={{ padding: "14px 28px", background: url.trim() ? "#B7E300" : "#EAEAE7", color: "#1A1A1A", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: url.trim() ? "pointer" : "not-allowed", opacity: url.trim() ? 1 : 0.7 }}>
            Analyzovat web
          </button>
        </>
      )}
    </div>
  );
}

function PortretFlow() {
  const [typ, setTyp] = useState<"brand" | "osobni" | "atelier">("brand");
  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <p style={{ fontSize: 17, color: "#6F6F6F", marginBottom: 20 }}>Upřesněte typ portrétu</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {(["brand", "osobni", "atelier"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTyp(t)} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: typ === t ? "2px solid #B7E300" : "1px solid #EAEAE7", background: typ === t ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer" }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>
              {t === "brand" ? "Brand portrét" : t === "osobni" ? "Osobní portrét" : "Ateliér (3 500 Kč)"}
            </span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 20 }}>Účel focení, preferovaný styl, lokalita – upřesníme v dalším kroku.</p>
      <Link href="/start?from=portret&step=form" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
        Pokračovat k výběru termínu
      </Link>
    </div>
  );
}

function RodinneFlow() {
  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <p style={{ fontSize: 17, color: "#6F6F6F", marginBottom: 20 }}>Upřesněte základní informace</p>
      <p style={{ fontSize: 16, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 24 }}>
        Počet osob, věk dětí, interiér / exteriér, město – na základě odpovědí doporučíme vhodný balíček.
      </p>
      <Link href="/start?from=rodinne&step=form" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
        Pokračovat k výběru termínu
      </Link>
    </div>
  );
}
