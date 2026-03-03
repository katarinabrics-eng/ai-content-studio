"use client";

import { useState } from "react";
import { ScanResultScrollExperience } from "./ScanResultScrollExperience";
import { ScanRitualLoading } from "./ScanRitualLoading";

/** Doplňující otázky dle systémového promptu v2.0 – vždy volby, nikdy přímé textové otázky. */
const GUIDANCE_QUESTIONS = [
  { id: "positioning", question: "Jak byste nejlépe popsali hlavní zaměření vašeho podnikání?", options: ["Prémiové služby pro náročné klienty", "Dostupné řešení pro širokou veřejnost", "Specializovaný expert v oboru", "Kreativní studio / tvůrčí práce"] },
  { id: "audience", question: "Kdo je váš typický klient?", options: ["Podnikatelé a manažeři", "Ženy budující osobní značku", "Malé a střední firmy", "Kreativci a freelanceři"] },
  { id: "goals", question: "Co je hlavní cíl komunikace na sociálních sítích?", options: ["Budovat důvěru a autoritu", "Generovat přímé poptávky", "Vzdělávat a inspirovat", "Ukázat zákulisí a osobnost"] },
  { id: "style", question: "Jaký tón komunikace vám sedí?", options: ["Klidný a autoritativní", "Přátelský a osobní", "Odborný a precizní", "Inspirativní a energický"] },
  { id: "differentiation", question: "Jak se hlavně odlišujete od konkurence?", options: ["Osobním přístupem a vztahem", "Výsledky a měřitelným dopadem", "Specializací na konkrétní niku", "Stylem a vizuální identitou"] },
  { id: "platform", question: "Kde je vaše primární platforma?", options: ["Instagram (foto + reels)", "LinkedIn (odbornost)", "Facebook (komunita)", "TikTok / YouTube (video)"] },
  { id: "business_phase", question: "V jaké fázi podnikání jste?", options: ["Začínám, hledám první klienty", "Mám klienty, chci růst", "Rebranding / nový směr", "Škáluju, chci systém"] },
  { id: "success_definition", question: "Co pro vás znamená úspěch za 3 měsíce?", options: ["Nové poptávky z internetu", "Silnější brand a viditelnost", "Větší engagement komunity", "Konkrétní počet nových klientů"] },
];

type BrandScore = { total?: number; hasHeadline?: boolean; hasOffer?: boolean; hasTargetAudience?: boolean; hasCTA?: boolean; hasVisualIdentity?: boolean; hasSocialProof?: boolean };
type VisualStyle = { primaryColor?: string; secondaryColor?: string; mood?: string; typography?: string };
type BrandDna = {
  name?: string; positioning?: string; tone?: string; targetAudience?: string; communicationStyle?: string;
  contentPillars?: string[]; uniqueValue?: string; missingElements?: string[]; visualStyle?: VisualStyle;
};
type Result = { brandScore?: BrandScore; brandDna?: BrandDna; summary?: string };
type Scraped = { markdown?: string; screenshot?: string | null; url?: string; title?: string; description?: string };

type TeaserData = {
  index: number;
  weakness1: string;
  weakness2: string;
  strength: string;
  suggestedDirection: string;
};

const MANUAL_OFFER_TYPES = [
  "Konzultace",
  "Online kurz",
  "Produkt",
  "Kreativní služba",
  "Péče / zdraví",
  "Technologie",
  "Jiné",
] as const;

/** Pro koho – v souladu s v2.0 (typický klient). */
const MANUAL_AUDIENCE = [
  "Podnikatelé a manažeři",
  "Ženy budující osobní značku",
  "Malé a střední firmy",
  "Kreativci a freelanceři",
] as const;

const MANUAL_PRICE_LEVELS = ["Základní", "Střední", "Prémiová"] as const;

const MAX_OFFER_SELECT = 2;
const MAX_AUDIENCE_SELECT = 2;

const WEAKNESS_LABELS: { key: keyof BrandScore; label: string }[] = [
  { key: "hasHeadline", label: "Chybí jasná hlavní zpráva" },
  { key: "hasOffer", label: "Není zřetelná nabídka" },
  { key: "hasTargetAudience", label: "Není definována cílová skupina" },
  { key: "hasCTA", label: "Chybí výzva k akci" },
  { key: "hasVisualIdentity", label: "Vizuální identita není sjednocená" },
  { key: "hasSocialProof", label: "Chybí reference nebo důkazy" },
];

function deriveTeaser(result: Result): TeaserData {
  const score = result.brandScore ?? {};
  const total = result.brandScore?.total ?? 0;
  const index = Math.min(100, Math.max(0, total));

  const weaknesses: string[] = [];
  if (result.brandDna?.missingElements?.length) {
    weaknesses.push(...result.brandDna.missingElements.slice(0, 2));
  }
  while (weaknesses.length < 2) {
    const next = WEAKNESS_LABELS.find((w) => !(score[w.key] === true) && !weaknesses.some((x) => x === w.label));
    if (next) weaknesses.push(next.label);
    else break;
  }
  const weakness1 = weaknesses[0] ?? "Slabá čitelnost nabídky";
  const weakness2 = weaknesses[1] ?? "Doplnit vizuální konzistenci";

  const strength =
    result.brandDna?.uniqueValue?.trim() ||
    result.brandDna?.contentPillars?.[0]?.trim() ||
    (total >= 50 ? "Dobrá základní struktura" : "Potenciál pro posílení značky");

  const firstSentence = result.summary?.trim().split(/[.!]/)[0]?.trim();
  const suggestedDirection =
    (firstSentence ? firstSentence + (result.summary?.includes(".") ? "." : "") : null) ||
    "Doporučujeme doplnit vizuální konzistenci a jasnou nabídku.";

  return { index, weakness1, weakness2, strength, suggestedDirection };
}

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
  const [phase, setPhase] = useState<"input" | "loading" | "guidance" | "result" | "teaser">("input");
  const [msg, setMsg] = useState("");
  const [scraped, setScraped] = useState<Scraped | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"web" | "manual">("web");
  const [manualText, setManualText] = useState("");
  const [brandName, setBrandName] = useState("");
  const [offerTypes, setOfferTypes] = useState<string[]>([]);
  const [audience, setAudience] = useState<string[]>([]);
  const [priceLevel, setPriceLevel] = useState<string | null>(null);
  const [manualOptionalText, setManualOptionalText] = useState("");
  const [brandFile, setBrandFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  function buildManualData(): string {
    const parts: string[] = [];
    if (brandName.trim()) parts.push(`Název značky: ${brandName.trim()}`);
    if (offerTypes.length) parts.push(`Co nabízíte: ${offerTypes.join(", ")}`);
    if (audience.length) parts.push(`Pro koho: ${audience.join(", ")}`);
    if (priceLevel) parts.push(`Cenová úroveň: ${priceLevel}`);
    if (manualOptionalText.trim()) parts.push(`Popis: ${manualOptionalText.trim()}`);
    return parts.join("\n\n");
  }

  const hasManualInput =
    brandName.trim() &&
    (offerTypes.length > 0 ||
      audience.length > 0 ||
      priceLevel ||
      manualOptionalText.trim() ||
      brandFile ||
      imageFile);

  const allAnswered = GUIDANCE_QUESTIONS.every((q) => answers[q.id]);
  const score = result?.brandScore?.total ?? 0;

  const analyze = async () => {
    if (mode === "web" && !url.trim()) return;
    if (diagnostika && mode === "manual" && !hasManualInput) return;
    setError("");
    setResult(null);
    setScraped(null);
    setAnswers({});
    try {
      setPhase("loading");
      setMsg(mode === "web" ? "Načítám web (text + screenshot)..." : "Analyzuji zadané podklady...");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);
      const body: Record<string, unknown> = diagnostika ? { format: "diagnostika" } : {};
      if (mode === "web") {
        body.url = url.trim();
      } else if (diagnostika) {
        body.manualData = mode === "manual" ? (buildManualData() || undefined) : undefined;
        if (brandFile) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
            r.onerror = reject;
            r.readAsDataURL(brandFile);
          });
          body.pdfBase64 = base64;
        }
        if (imageFile) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
            r.onerror = reject;
            r.readAsDataURL(imageFile);
          });
          body.imageBase64 = base64;
          body.imageMimeType = imageFile.type;
        }
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      const resData = typeof resResult === "object" && resResult !== null ? (resResult as Result) : null;
      setResult(resData);
      const total = resData?.brandScore?.total ?? 0;
      if (diagnostika && resData) {
        try {
          const saveRes = await fetch("/api/diagnostika/save-scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              webUrl: mode === "web" ? url.trim() : undefined,
              manualInput: mode === "manual" ? buildManualData() || undefined : undefined,
              result: resData,
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.id) setProjectId(saveData.id);
        } catch { /* ignore */ }
        setPhase(total < 60 ? "guidance" : "teaser");
      } else if (diagnostika) {
        setPhase(total < 60 ? "guidance" : "teaser");
      } else {
        setPhase(total < 60 ? "guidance" : "result");
      }
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
        body: JSON.stringify({ url: url || "zadané podklady", brandDna: result?.brandDna, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      const updatedResult = data.result;
      if (updatedResult) setResult(updatedResult);
      if (diagnostika && updatedResult) {
        try {
          const saveRes = await fetch("/api/diagnostika/save-scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              webUrl: mode === "web" ? url.trim() : undefined,
              manualInput: mode === "manual" ? buildManualData() || undefined : undefined,
              result: updatedResult,
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.id) setProjectId(saveData.id);
        } catch { /* ignore */ }
      }
    } catch {
      // keep current result
    }
    setPhase(diagnostika ? "teaser" : "result");
  };

  const reset = () => {
    setPhase("input");
    setUrl("");
    setResult(null);
    setScraped(null);
    setAnswers({});
    setError("");
    setLeadEmail("");
    setLeadSubmitted(false);
    setLeadError(null);
    setMode("web");
    setManualText("");
    setBrandName("");
    setOfferTypes([]);
    setAudience([]);
    setPriceLevel(null);
    setManualOptionalText("");
    setBrandFile(null);
    setImageFile(null);
    setProjectId(null);
  };

  async function handleSaveLead() {
    const trimmed = leadEmail.trim();
    if (!trimmed || !result) return;
    setLeadSubmitting(true);
    setLeadError(null);
    try {
      const scrapedMeta =
        scraped != null
          ? { url: scraped.url, title: scraped.title, description: scraped.description }
          : {};
      const res = await fetch("/api/analysis-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          analyzedUrl: scraped?.url ?? url ?? "",
          result: { brandScore: result.brandScore, brandDna: result.brandDna, summary: result.summary },
          scrapedMeta,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setLeadSubmitted(true);
      } else {
        setLeadError(data.error ?? "Nepodařilo se odeslat.");
      }
    } catch {
      setLeadError("Chyba při odesílání. Zkuste to znovu.");
    } finally {
      setLeadSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c14", color: "#e7e7ef", fontFamily: "system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .analyzer-fade{animation:up 0.35s ease}
        .analyzer-inp:focus{border-color:rgba(168,224,99,0.4)!important;background:rgba(255,255,255,0.07)!important}
        .manual-pill:hover:not(:disabled){box-shadow:0 0 24px rgba(168,224,99,0.15);border-color:rgba(168,224,99,0.25)!important}
      `}</style>

      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "13px 22px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(168,224,99,0.1)", border: "1px solid rgba(168,224,99,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#a8e063" }}>L</div>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a3a4a" }}>Lucifera <span style={{ color: "#a8e063" }}>·</span> AI Content System</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#222", background: "#161622", padding: "2px 8px", borderRadius: 5 }}>Web Analyzer · screenshot + text + vision</span>
      </header>

      {phase === "loading" && diagnostika && <ScanRitualLoading />}

      {phase === "teaser" && diagnostika && result ? (
        <ScanResultScrollExperience
          result={result}
          projectId={projectId}
          onBack={reset}
        />
      ) : (
      <div className="max-w-screen-xl mx-auto px-8 pt-11 pb-20">

        {phase === "input" && (
          <div className="analyzer-fade">
            {diagnostika && (
              <section className="relative max-w-4xl mx-auto mb-20 px-6">
                {/* Glow background */}
                <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-lime-400 via-emerald-500 to-teal-400 rounded-full" />

                {/* Header */}
                <div className="text-center mb-10">
                  <p className="text-xs uppercase tracking-[0.3em] text-lime-400 mb-4">
                    Strategický vstup
                  </p>

                  <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
                    Analýza vizuální úrovně značky
                  </h2>

                  <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Diskrétní orientační rozbor toho, jak vaše značka působí navenek.
                    Ukážeme vám silné body, slabá místa a jeden možný směr dalšího rozvoje.
                  </p>
                </div>

                {/* Premium Card */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-10 backdrop-blur-xl shadow-[0_0_80px_rgba(132,204,22,0.08)]">
                  <p className="text-zinc-300 leading-relaxed mb-8">
                    Tato ukázková analýza je vstupní fází před strategickou konzultací.
                    Plná diagnostika a vizuální board jsou součástí placené spolupráce.
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-8" />

                  {/* How it works */}
                  <div>
                    <p className="text-sm uppercase tracking-widest text-zinc-500 mb-6">
                      Jak to probíhá
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 text-sm text-zinc-300">
                      <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
                        <div className="text-lime-400 text-lg mb-3">01</div>
                        Zadáte web nebo podklady o značce.
                      </div>

                      <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
                        <div className="text-lime-400 text-lg mb-3">02</div>
                        Získáte orientační analýzu a návrh jednoho směru.
                      </div>

                      <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
                        <div className="text-lime-400 text-lg mb-3">03</div>
                        Pokud dává smysl pokračovat, rezervujete termín a zahájíme spolupráci.
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(168,224,99,0.07)", border: "1px solid rgba(168,224,99,0.15)", color: "#a8e063", fontSize: 11, marginBottom: 18 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a8e063" }} />
                {diagnostika ? "Ukázková analýza" : "Modul 1 · Analýza značky"}
              </span>
              <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3, marginBottom: 10, color: "#fff" }}>
                Zadejte web.<br /><span style={{ color: "#2a2a3a" }}>Zbytek uděláme za vás.</span>
              </h1>
            </div>

            <div className={diagnostika ? "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl" : ""} style={diagnostika ? undefined : C.card}>
              {diagnostika && (
                <div className="flex justify-center mb-6">
                  <div className="inline-flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setMode("web")}
                      className={`px-6 py-2 rounded-full text-sm transition ${mode === "web" ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"}`}
                    >
                      Mám web
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("manual")}
                      className={`px-6 py-2 rounded-full text-sm transition ${mode === "manual" ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"}`}
                    >
                      Nemám web
                    </button>
                  </div>
                </div>
              )}

              {(!diagnostika || mode === "web") && (
                <>
                  <label style={C.lbl}>URL webu klienta</label>
                  <input className="analyzer-inp" style={C.inp} placeholder="Zde zadejte adresu webu" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()} />
                </>
              )}

              {diagnostika && mode === "manual" && (
                <div className="max-w-5xl mx-auto space-y-12">
                  <div className="text-center mb-2">
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">
                      Nemáte web?
                    </h2>
                    <p className="text-white/60 text-sm md:text-base">
                      Stačí pár informací. Provedeme vás.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Název značky / jméno</label>
                    <input
                      type="text"
                      style={C.inp}
                      placeholder="Např. Jana Nováková Coaching"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="analyzer-inp rounded-xl"
                    />
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Co nabízíte (max 1–2)</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {MANUAL_OFFER_TYPES.map((opt) => {
                        const on = offerTypes.includes(opt);
                        const canAdd = offerTypes.length < MAX_OFFER_SELECT || on;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (on) setOfferTypes((prev) => prev.filter((x) => x !== opt));
                              else if (canAdd) setOfferTypes((prev) => [...prev, opt]);
                            }}
                            disabled={!canAdd}
                            className="manual-pill px-4 py-2.5 rounded-full text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                              background: on ? "rgba(168,224,99,0.18)" : "rgba(255,255,255,0.06)",
                              border: "1px solid " + (on ? "rgba(168,224,99,0.35)" : "rgba(255,255,255,0.08)"),
                              color: on ? "#a8e063" : "#a1a1aa",
                              boxShadow: on ? "0 0 20px rgba(168,224,99,0.12)" : "none",
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Pro koho (max 2)</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {MANUAL_AUDIENCE.map((opt) => {
                        const on = audience.includes(opt);
                        const canAdd = audience.length < MAX_AUDIENCE_SELECT || on;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (on) setAudience((prev) => prev.filter((x) => x !== opt));
                              else if (canAdd) setAudience((prev) => [...prev, opt]);
                            }}
                            disabled={!canAdd}
                            className="manual-pill px-4 py-2.5 rounded-full text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                              background: on ? "rgba(168,224,99,0.18)" : "rgba(255,255,255,0.06)",
                              border: "1px solid " + (on ? "rgba(168,224,99,0.35)" : "rgba(255,255,255,0.08)"),
                              color: on ? "#a8e063" : "#a1a1aa",
                              boxShadow: on ? "0 0 20px rgba(168,224,99,0.12)" : "none",
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Cenová úroveň</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {MANUAL_PRICE_LEVELS.map((opt) => {
                        const on = priceLevel === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setPriceLevel(on ? null : opt)}
                            className="manual-pill px-4 py-2.5 rounded-full text-sm transition-all duration-200"
                            style={{
                              background: on ? "rgba(168,224,99,0.18)" : "rgba(255,255,255,0.06)",
                              border: "1px solid " + (on ? "rgba(168,224,99,0.35)" : "rgba(255,255,255,0.08)"),
                              color: on ? "#a8e063" : "#a1a1aa",
                              boxShadow: on ? "0 0 20px rgba(168,224,99,0.12)" : "none",
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8">
                    <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-3">Stručně popište, co děláte (volitelné)</label>
                    <textarea
                      style={{ ...C.inp, minHeight: 88 }}
                      placeholder={"Například:\nPomáhám ženám po mateřské nastavit online podnikání.\nVytvářím přírodní kosmetiku pro citlivou pleť.\nUčím firmy pracovat s vizuální identitou."}
                      value={manualOptionalText}
                      onChange={(e) => setManualOptionalText(e.target.value)}
                      className="analyzer-inp rounded-xl resize-y placeholder:text-zinc-500"
                    />
                    <p className="text-[11px] text-zinc-500 mt-2">Krátké. Konkrétní. Jasné.</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8 text-center">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.type !== "application/pdf") {
                          alert("Povolen je pouze PDF soubor.");
                          return;
                        }
                        const maxSize = 2 * 1024 * 1024;
                        if (file.size > maxSize) {
                          alert("Soubor je příliš velký. Maximální velikost je 2 MB.");
                          return;
                        }
                        setBrandFile(file);
                      }}
                      className="hidden"
                      id="pdfUpload"
                    />
                    <label htmlFor="pdfUpload" className="cursor-pointer text-white/60 hover:text-white/90 transition block text-sm">
                      {brandFile ? `Vybrán soubor: ${brandFile.name}` : "Nahrajte textový PDF dokument (max 2 MB). Dokument by měl obsahovat pouze textové informace o značce."}
                    </label>
                    <p className="text-[11px] text-zinc-500 mt-2">Dokument musí obsahovat skutečný text (ne naskenované obrázky).</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.24)] px-6 py-6 md:px-8 md:py-8 text-center">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
                        if (!allowedTypes.includes(file.type)) {
                          alert("Povolen je pouze JPG, PNG nebo WEBP obrázek.");
                          return;
                        }
                        const maxSize = 1 * 1024 * 1024;
                        if (file.size > maxSize) {
                          alert("Obrázek je příliš velký. Maximální velikost je 1 MB.");
                          return;
                        }
                        setImageFile(file);
                      }}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer text-white/60 hover:text-white/90 transition block text-sm">
                      {imageFile ? `Vybrán obrázek: ${imageFile.name}` : "Nahrajte jednu ukázku grafiky nebo fotografie (max 1 MB). Ideálně reprezentativní vizuál vaší značky."}
                    </label>
                    {imageFile && (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Náhled"
                        className="mt-3 rounded-md max-h-40 mx-auto object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(224,90,90,0.07)", border: "1px solid rgba(224,90,90,0.2)", borderRadius: 8, color: "#e05a5a", fontSize: 13 }}>⚠ {error}</div>
              )}
              <button
                type="button"
                style={{
                  ...C.btn,
                  opacity: (mode === "web" && url.trim()) || (diagnostika && mode === "manual" && hasManualInput) ? 1 : 0.3,
                }}
                onClick={analyze}
                disabled={(mode === "web" && !url.trim()) || (diagnostika && mode === "manual" && !hasManualInput)}
              >
                {diagnostika && mode === "manual" ? "✨ Spustit strategický scan" : diagnostika ? "Analyzovat" : "Analyzovat →"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
              {["Screenshot webu", "Analýza textu", "Claude Vision", "Brand DNA"].map((t) => (
                <span key={t} style={{ fontSize: 10, color: "#2a2a3a" }}>✓ {t}</span>
              ))}
            </div>
          </div>
        )}

        {phase === "loading" && !diagnostika && (
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
            <p style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>Všechny volby jsou dobrovolné. Nic nevyberete? Pokračujeme s rozumným předpokladem.</p>
            <button type="button" style={{ ...C.btn, opacity: 1 }} onClick={confirmGuidance}>Zobrazit Brand DNA →</button>
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

            {!leadSubmitted ? (
              <div style={{ ...C.card, borderColor: "rgba(168,224,99,0.2)", background: "rgba(168,224,99,0.03)" }}>
                <p style={{ color: "#ccc", fontSize: 14, marginBottom: 8 }}>Chcete se k analýze vrátit a my vás můžeme kontaktovat?</p>
                <p style={{ color: "#666", fontSize: 12, marginBottom: 12 }}>Zadejte e-mail – nebudeme vás spamovat, můžeme vám poslat ukázku a dál s vámi pracovat.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <input
                    type="email"
                    placeholder="vas@email.cz"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="analyzer-inp"
                    style={{ ...C.inp, flex: "1 1 200px", marginTop: 0 }}
                  />
                  <button
                    type="button"
                    style={{ ...C.btn, width: "auto", padding: "12px 20px", marginTop: 0 }}
                    onClick={handleSaveLead}
                    disabled={leadSubmitting || !leadEmail.trim()}
                  >
                    {leadSubmitting ? "Odesílám…" : "Odeslat"}
                  </button>
                </div>
                {leadError && <p style={{ color: "#e05a5a", fontSize: 12, marginTop: 8 }}>{leadError}</p>}
              </div>
            ) : (
              <div style={{ ...C.card, textAlign: "center", borderColor: "rgba(168,224,99,0.2)", background: "rgba(168,224,99,0.05)" }}>
                <p style={{ color: "#a8e063", fontWeight: 600 }}>Děkujeme, budeme vás kontaktovat.</p>
                <p style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Vaše analýza je u nás uložená.</p>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
