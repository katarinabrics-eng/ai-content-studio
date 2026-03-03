"use client";

import { useState } from "react";
import { ScoreRing } from "@/components/ScoreRing";
import { ScoreCard } from "@/app/diagnostika/ScoreCard";
import { GapQuestions } from "@/app/diagnostika/GapQuestions";
import { WebAnalyzer } from "@/app/diagnostika/WebAnalyzer";
import { StrategyOutput } from "@/app/diagnostika/StrategyOutput";
import { ScanResultScrollExperience } from "./ScanResultScrollExperience";
import { ScanRitualLoading } from "./ScanRitualLoading";

/** Doplňující otázky dle systémového promptu v2.0 – vždy volby, nikdy přímé textové otázky. */
const GUIDANCE_QUESTIONS_FULL = [
  { id: "positioning", question: "Jak byste nejlépe popsali hlavní zaměření vašeho podnikání?", options: ["Prémiové služby pro náročné klienty", "Dostupné řešení pro širokou veřejnost", "Specializovaný expert v oboru", "Kreativní studio / tvůrčí práce"] },
  { id: "audience", question: "Kdo je váš typický klient?", options: ["Podnikatelé a manažeři", "Ženy budující osobní značku", "Malé a střední firmy", "Kreativci a freelanceři", "Začátečníci", "Široká veřejnost"] },
  { id: "goals", question: "Co je hlavní cíl komunikace na sociálních sítích?", options: ["Budovat důvěru a autoritu", "Generovat přímé poptávky", "Vzdělávat a inspirovat", "Ukázat zákulisí a osobnost"] },
  { id: "style", question: "Jaký tón komunikace vám sedí?", options: ["Klidný a autoritativní", "Přátelský a osobní", "Odborný a precizní", "Inspirativní a energický"] },
  { id: "differentiation", question: "Jak se hlavně odlišujete od konkurence?", options: ["Osobním přístupem a vztahem", "Výsledky a měřitelným dopadem", "Specializací na konkrétní niku", "Stylem a vizuální identitou"] },
  { id: "platform", question: "Kde je vaše primární platforma?", options: ["Instagram (foto + reels)", "LinkedIn (odbornost)", "Facebook (komunita)", "TikTok / YouTube (video)"] },
  { id: "business_phase", question: "V jaké fázi podnikání jste?", options: ["Začínám, hledám první klienty", "Mám klienty, chci růst", "Rebranding / nový směr", "Škáluju, chci systém"] },
  { id: "success_definition", question: "Co pro vás znamená úspěch za 3 měsíce?", options: ["Nové poptávky z internetu", "Silnější brand a viditelnost", "Větší engagement komunity", "Konkrétní počet nových klientů"] },
];

/** Mapování: questionId → odpověď z analýzy (pokud je dostatečně vyplněná, otázku nezobrazujeme). */
function isAnsweredByWeb(questionId: string, result: Result | null): boolean {
  if (!result?.brandDna) return false;
  const d = result.brandDna;
  const s = result.brandScore ?? {};
  const has = (v: string | undefined, minLen = 15) => (v ?? "").trim().length >= minLen;
  switch (questionId) {
    case "positioning": return has(d.positioning);
    case "audience": return s.hasTargetAudience === true || has(d.targetAudience);
    case "goals": return has(d.communicationStyle) || has(d.uniqueValue);
    case "style": return has(d.tone) || has(d.communicationStyle);
    case "differentiation": return has(d.uniqueValue);
    case "platform": return false; // žádné pole z analýzy
    case "business_phase": return false;
    case "success_definition": return false;
    default: return false;
  }
}

/** Zobraz jen otázky, na které web neposkytl odpověď. Max 5, pořadí 1–8. */
function getRelevantGuidanceQuestions(result: Result | null): typeof GUIDANCE_QUESTIONS_FULL {
  const relevant = GUIDANCE_QUESTIONS_FULL.filter((q) => !isAnsweredByWeb(q.id, result));
  return relevant.slice(0, 5);
}

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
  const [teaserView, setTeaserView] = useState<"scroll" | "workspace">("scroll");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const score = result?.brandScore?.total ?? 0;

  const analyze = async () => {
    if (mode === "web" && !url.trim()) return;
    if (diagnostika && mode === "manual" && !hasManualInput) return;
    setError("");
    setResult(null);
    setScraped(null);
    setAnswers({});
    const loadingMessages =
      mode === "web"
        ? ["Načítám web...", "Analyzuji obsah...", "Generuji skóre..."]
        : ["Analyzuji zadané podklady...", "Analyzuji obsah...", "Generuji skóre..."];
    let loadingStep = 0;
    let progressInterval: ReturnType<typeof setInterval> | undefined;
    try {
      setPhase("loading");
      setMsg(loadingMessages[0]);
      progressInterval = setInterval(() => {
        loadingStep = Math.min(loadingStep + 1, loadingMessages.length - 1);
        setMsg(loadingMessages[loadingStep]);
      }, 5000);
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
      clearInterval(progressInterval);
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
          if (saveRes.ok && saveData?.id) {
            setProjectId(saveData.id);
            setSaveError(null);
          } else {
            setSaveError(saveData?.error ?? "Výsledek se nepodařilo uložit do projektu.");
          }
        } catch {
          setSaveError("Výsledek se nepodařilo uložit do projektu. Zkuste to znovu nebo nás kontaktujte.");
        }
        setPhase(total < 60 ? "guidance" : "teaser");
      } else if (diagnostika) {
        setPhase(total < 60 ? "guidance" : "teaser");
      } else {
        setPhase(total < 60 ? "guidance" : "result");
      }
    } catch (e) {
      if (progressInterval !== undefined) clearInterval(progressInterval);
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
      const answersFiltered = Object.fromEntries(
        Object.entries(answers).filter(([, v]) => v != null && String(v).trim() !== "")
      );
      const res = await fetch("/api/analyze/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url || "zadané podklady", brandDna: result?.brandDna, answers: answersFiltered }),
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
    setTeaserView("scroll");
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
        <>
          {saveError && (
            <div role="alert" style={{ background: "rgba(220,80,80,0.12)", borderBottom: "1px solid rgba(220,80,80,0.3)", padding: "12px 22px", color: "#e8a0a0", fontSize: 13 }}>
              {saveError}
            </div>
          )}
          {teaserView === "scroll" ? (
            <ScanResultScrollExperience
              result={result}
              projectId={projectId}
              onBack={reset}
              onEnterWorkspace={() => setTeaserView("workspace")}
            />
          ) : (
            <StrategyOutput result={result} projectId={projectId} onBack={reset} />
          )}
        </>
      ) : (
      <div className="max-w-screen-xl mx-auto px-8 pt-11 pb-20">

        {phase === "input" && (
          <WebAnalyzer
            diagnostika={diagnostika}
            mode={mode}
            setMode={setMode}
            url={url}
            setUrl={setUrl}
            brandName={brandName}
            setBrandName={setBrandName}
            offerTypes={offerTypes}
            setOfferTypes={setOfferTypes}
            audience={audience}
            setAudience={setAudience}
            priceLevel={priceLevel}
            setPriceLevel={setPriceLevel}
            manualOptionalText={manualOptionalText}
            setManualOptionalText={setManualOptionalText}
            brandFile={brandFile}
            setBrandFile={setBrandFile}
            imageFile={imageFile}
            setImageFile={setImageFile}
            hasManualInput={!!hasManualInput}
            onAnalyze={analyze}
            error={error}
            onRetry={() => setError("")}
          />
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
            <ScoreCard
              score={score}
              url={url || undefined}
              subtitle="Web nemá dostatek podkladů"
              hint="Doplňte výběrem – žádné psaní."
              screenshot={scraped?.screenshot ?? undefined}
            />
            <GapQuestions
              questions={getRelevantGuidanceQuestions(result)}
              answers={answers}
              onAnswer={(questionId, value) => setAnswers((p) => ({ ...p, [questionId]: value }))}
              confirmLabel="Zobrazit Brand DNA →"
              onConfirm={confirmGuidance}
              onSkipAll={confirmGuidance}
            />
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
