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

const STEP_LABELS: Record<TabId, string> = {
  premiova: "Prémiová vizuální identita",
  brandfoceni: "Brand focení",
  portret: "Portrétní focení",
  rodinne: "Rodinné focení",
};

export function BookingGate() {
  const searchParams = useSearchParams();
  const from = (searchParams.get("from") as TabId) || "premiova";
  const step = searchParams.get("step");
  const [activeTab, setActiveTab] = useState<TabId>(from);

  useEffect(() => {
    const f = searchParams.get("from") as TabId | null;
    if (f && ["premiova", "brandfoceni", "portret", "rodinne"].includes(f)) setActiveTab(f);
  }, [searchParams]);

  const showCalendar = step === "calendar";

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
          <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 16 }}>
            Před rezervací si prosím přečtěte naše{" "}
            <Link href="/obchodni-podminky" className="text-[#1A1A1A] underline underline-offset-2 hover:no-underline font-medium">obchodní podmínky</Link>.
          </p>
          {!showCalendar && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 24px", background: "#FFFFFF", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #EAEAE7", textAlign: "left" }}>
            <p style={{ fontSize: 13, color: "#6F6F6F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Co se zde odehrává</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 12 }}>
              Na této stránce zvolíte typ spolupráce, vyplníte základní údaje a podle typu služby buď domluvíte konzultaci (zdarma s vratnou zálohou 500 Kč za termín), nebo (u prémiové identity a brand focení s vizuálním boardem za 1 850 Kč) nejdříve analyzujeme váš web. Po dokončení kroku vás provedeme k výběru termínu a úhradě.
            </p>
            <p style={{ fontSize: 13, color: "#6F6F6F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Co potřebujete k zahájení</p>
            <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6 }}>
              U prémiové identity a brand focení: varianta s vizuálním boardem 1 850 Kč, nebo jen konzultace se zálohou 500 Kč za rezervaci termínu (záloha se vrací při dostavení nebo odečte z další služby). U ostatních služeb vyplňte formulář a zvolte termín.
            </p>
          </div>
          )}
        </div>

        {showCalendar ? (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              padding: 40,
            }}
          >
            <CalendarStep from={from} variant={searchParams.get("variant") === "paid" ? "paid" : searchParams.get("variant") === "free" ? "free" : null} />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

// ─── Ilustrační kalendář (krok 2) + modal potvrzení ───
const TIME_SLOTS = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
const MONTHS = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];

function CalendarStep({ from, variant }: { from: TabId; variant: "free" | "paid" | null }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay() === 0 ? 7 : firstDay.getDay();

  const backHref = `/start?from=${from}`;

  const handleConfirmSlot = () => {
    if (selectedDate && selectedTime) setModalOpen(true);
  };

  return (
    <div className="gate-fade">
      <Link href={backHref} style={{ fontSize: 14, color: "#6F6F6F", textDecoration: "none", marginBottom: 16, display: "inline-block" }}>← Zpět na výběr služby</Link>
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 8 }}>Krok 2 / 3</p>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1A1A1A", marginBottom: 8 }}>Výběr termínu</h2>
      <p style={{ fontSize: 15, color: "#6F6F6F", marginBottom: 8 }}>{STEP_LABELS[from]} · {(from === "portret" || from === "rodinne") ? "Výběr termínu focení" : "30minut vstupní konzultace"}</p>
      {variant === "free" && (from === "premiova" || from === "brandfoceni") && (
        <p style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 1.5, marginBottom: 24, padding: "12px 14px", background: "rgba(183,227,0,0.12)", borderRadius: 10 }}>
          Rezervace termínu je závazná po uhrazení vratné zálohy 500 Kč. Záloha se vrací při dostavení nebo odečte z další služby. <Link href="/obchodni-podminky" className="underline font-medium">Obchodní podmínky</Link>.
        </p>
      )}
      {(!variant || variant !== "free") && (from === "premiova" || from === "brandfoceni") && (
        <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 24 }}>Po potvrzení termínu vás vyzveme k úhradě.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 32, marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>{MONTHS[month]} {year}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 16 }}>
            {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#6F6F6F", fontWeight: 600 }}>{d}</div>
            ))}
            {Array.from({ length: startWeekday - 1 }, (_, i) => <div key={`pad-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const date = new Date(year, month, d);
              const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isSelected = selectedDate && selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={isPast}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    padding: "10px",
                    border: isSelected ? "2px solid #B7E300" : "1px solid #EAEAE7",
                    borderRadius: 10,
                    background: isSelected ? "rgba(183,227,0,0.15)" : "#FFF",
                    color: isPast ? "#AAA" : "#1A1A1A",
                    cursor: isPast ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Čas</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
            {TIME_SLOTS.map((t) => {
              const isSelected = selectedTime === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTime(t)}
                  style={{
                    padding: "10px 14px",
                    border: isSelected ? "2px solid #B7E300" : "1px solid #EAEAE7",
                    borderRadius: 10,
                    background: isSelected ? "rgba(183,227,0,0.15)" : "#FFF",
                    color: "#1A1A1A",
                    cursor: "pointer",
                    fontSize: 14,
                    textAlign: "left",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && selectedTime && (
        <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 16 }}>
          Vybraný termín: {selectedDate.getDate()}. {selectedDate.getMonth() + 1}. {selectedDate.getFullYear()} v {selectedTime}
        </p>
      )}
      <button
        type="button"
        onClick={handleConfirmSlot}
        disabled={!selectedDate || !selectedTime}
        style={{
          padding: "14px 28px",
          background: selectedDate && selectedTime ? "#B7E300" : "#EAEAE7",
          color: "#1A1A1A",
          fontWeight: 600,
          fontSize: 16,
          border: "none",
          borderRadius: 12,
          cursor: selectedDate && selectedTime ? "pointer" : "not-allowed",
          opacity: selectedDate && selectedTime ? 1 : 0.7,
        }}
      >
        Potvrdit termín a pokračovat
      </button>

      {modalOpen && (
        <ConfirmModal
          from={from}
          variant={variant}
          date={selectedDate!}
          time={selectedTime!}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function ConfirmModal({ from, variant, date, time, onClose }: { from: TabId; variant: "free" | "paid" | null; date: Date; time: string; onClose: () => void }) {
  const dateStr = `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()} v ${time}`;
  const isConsultationWithDeposit = (from === "premiova" || from === "brandfoceni") && variant === "free";
  const isPaidBoard = (from === "premiova" || from === "brandfoceni") && variant === "paid";
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          padding: 32,
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          border: "1px solid #EAEAE7",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 8 }}>Krok 3 / 3</p>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1A1A1A", marginBottom: 12 }}>Závazně potvrdit termín schůzky</h3>
        <p style={{ fontSize: 15, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 8 }}>
          {(from === "portret" || from === "rodinne") ? "Termín focení" : "30minut vstupní konzultace"} · {STEP_LABELS[from]}
        </p>
        {isConsultationWithDeposit && (
          <p style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 1.5, marginBottom: 12, padding: "12px 14px", background: "rgba(183,227,0,0.12)", borderRadius: 10 }}>
            Konzultace je zdarma s vratnou zálohou za termín. Záloha 500 Kč vám bude vrácena při dostavení se nebo odečtena z další služby.
          </p>
        )}
        {isPaidBoard && (
          <p style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 1.5, marginBottom: 12 }}>
            Úhrada za konzultaci + vizuální board: 1 850 Kč.
          </p>
        )}
        <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 24 }}>Termín: {dateStr}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isConsultationWithDeposit && (
            <button
              type="button"
              style={{
                padding: "14px 20px",
                background: "#B7E300",
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Uhradit zálohu 500 Kč
            </button>
          )}
          {isPaidBoard && (
            <button
              type="button"
              style={{
                padding: "14px 20px",
                background: "#B7E300",
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Uhradit službu 1 850 Kč
            </button>
          )}
          {!(isConsultationWithDeposit || isPaidBoard) && (
            <button
              type="button"
              style={{
                padding: "14px 20px",
                background: "#B7E300",
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Uhradit službu
            </button>
          )}
          <button
            type="button"
            style={{
              padding: "14px 20px",
              background: "#FFFFFF",
              color: "#1A1A1A",
              fontWeight: 600,
              fontSize: 16,
              border: "2px solid #B7E300",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Závazně potvrdit termín schůzky
          </button>
          <button type="button" onClick={onClose} style={{ padding: 8, background: "none", border: "none", color: "#6F6F6F", fontSize: 14, cursor: "pointer", marginTop: 8 }}>
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}

function PremiovaFlow() {
  const [variant, setVariant] = useState<"free" | "paid">("free");
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "result">("input");
  const [msg, setMsg] = useState("");
  const [scraped, setScraped] = useState<Scraped | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeline, setTimeline] = useState<"3m" | "6m" | "flex">("flex");
  const [goal, setGoal] = useState<"autorita" | "poptavky" | "inspirace" | "osobnost">("autorita");

  const analyze = async () => {
    if (!url.trim() || isLoading) return;
    setError("");
    setAnalysisText(null);
    setScraped(null);
    setIsLoading(true);
    setPhase("loading");
    setMsg("Načítám web…");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      let data: { result?: string; scraped?: Scraped; error?: string };
      try {
        data = await res.json();
      } catch {
        setError("Server vrátil neplatnou odpověď. Zkuste to znovu.");
        setPhase("input");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Chyba analýzy");
      setScraped(data.scraped ?? null);
      setAnalysisText(typeof data.result === "string" ? data.result : data.result ?? "Žádný výstup.");
      setPhase("result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepodařilo se analyzovat.";
      const friendly =
        msg === "fetch failed" || msg === "Failed to fetch"
          ? "Spojení se serverem selhalo. Zkontrolujte, že server běží a že v .env.local máte OPENAI_API_KEY a FIRECRAWL_API_KEY."
          : msg.includes("abort") || (e instanceof Error && e.name === "AbortError")
            ? "Požadavek vypršel (timeout). Analýza trvá cca 15–25 s, zkuste to znovu."
            : msg;
      setError(friendly);
      setPhase("input");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setPhase("input");
    setUrl("");
    setAnalysisText(null);
    setScraped(null);
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

  if (phase === "result" && analysisText !== null) {
    return (
      <div className="gate-fade">
        <button type="button" onClick={resetAnalysis} style={{ background: "none", border: "none", color: "#6F6F6F", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Analyzovat jiný web</button>
        {scraped?.screenshot && (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #EAEAE7" }}>
            <img src={scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`} alt="Náhled webu" style={{ width: "100%", maxHeight: 240, objectFit: "cover" }} />
          </div>
        )}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid #EAEAE7",
            borderTop: "3px solid #B7E300",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <h3 style={{ margin: 0, padding: "16px 20px", fontSize: 18, fontWeight: 600, color: "#1A1A1A", borderBottom: "1px solid #EAEAE7" }}>
            Výsledek analýzy
          </h3>
          <div style={{ padding: "20px", fontSize: 15, color: "#1A1A1A", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {analysisText}
          </div>
        </div>
        <Link href="/start?from=premiova&step=calendar&variant=paid" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
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
          <span style={{ fontSize: 14, color: "#6F6F6F", display: "block", marginTop: 4 }}>vratná záloha 500 Kč za termín</span>
        </button>
        <button type="button" onClick={() => setVariant("paid")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: variant === "paid" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: variant === "paid" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", transition: "all 0.2s" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Konzultace + vizuální board</span>
          <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>1 850 Kč</span>
        </button>
      </div>
      <p style={{ fontSize: 15, color: "#6F6F6F", marginBottom: 10 }}>Jaká je vaše časová představa pro spolupráci?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {(["3m", "6m", "flex"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTimeline(t)} style={{ textAlign: "left", padding: 12, borderRadius: 10, border: timeline === t ? "2px solid #B7E300" : "1px solid #EAEAE7", background: timeline === t ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 15, color: "#1A1A1A" }}>
            {t === "3m" ? "Do 3 měsíců" : t === "6m" ? "Do 6 měsíců" : "Flexibilní / zatím jen zjišťuji"}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 15, color: "#6F6F6F", marginBottom: 10 }}>Jaký je hlavní cíl prémiové vizuální identity?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {(["autorita", "poptavky", "inspirace", "osobnost"] as const).map((g) => (
          <button key={g} type="button" onClick={() => setGoal(g)} style={{ textAlign: "left", padding: 12, borderRadius: 10, border: goal === g ? "2px solid #B7E300" : "1px solid #EAEAE7", background: goal === g ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 15, color: "#1A1A1A" }}>
            {g === "autorita" ? "Budovat důvěru a autoritu" : g === "poptavky" ? "Generovat přímé poptávky" : g === "inspirace" ? "Vzdělávat a inspirovat" : "Ukázat zákulisí a osobnost"}
          </button>
        ))}
      </div>
      {variant === "free" ? (
        <>
          <p style={{ fontSize: 16, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 16 }}>
            Konzultace je zdarma s vratnou zálohou 500 Kč za termín. Záloha vám bude vrácena při dostavení se nebo odečtena z další služby. Probereme vaše cíle a doporučíme další postup.
          </p>
          <Link href="/start?from=premiova&step=calendar&variant=free" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
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
          {error && <p style={{ fontSize: 14, color: "#b91c1c", marginBottom: 12 }}>⚠ {error}</p>}
          <button type="button" onClick={analyze} disabled={!url.trim() || isLoading} style={{ padding: "14px 28px", background: url.trim() && !isLoading ? "#B7E300" : "#EAEAE7", color: "#1A1A1A", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: url.trim() && !isLoading ? "pointer" : "not-allowed", opacity: url.trim() && !isLoading ? 1 : 0.7 }}>
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
  const [phase, setPhase] = useState<"input" | "loading" | "result">("input");
  const [msg, setMsg] = useState("");
  const [scraped, setScraped] = useState<Scraped | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vyuziti, setVyuziti] = useState<"web" | "social" | "tisk" | "vse">("social");
  const [prostredi, setProstredi] = useState<"atelier" | "exterier" | "oba">("atelier");

  const analyze = async () => {
    if (!url.trim() || isLoading) return;
    setError("");
    setAnalysisText(null);
    setScraped(null);
    setIsLoading(true);
    setPhase("loading");
    setMsg("Načítám web…");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      let data: { result?: string; scraped?: Scraped; error?: string };
      try {
        data = await res.json();
      } catch {
        setError("Server vrátil neplatnou odpověď. Zkuste to znovu.");
        setPhase("input");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Chyba analýzy");
      setScraped(data.scraped ?? null);
      setAnalysisText(typeof data.result === "string" ? data.result : data.result ?? "Žádný výstup.");
      setPhase("result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepodařilo se analyzovat.";
      const friendly =
        msg === "fetch failed" || msg === "Failed to fetch"
          ? "Spojení se serverem selhalo. Zkontrolujte, že server běží a že v .env.local máte OPENAI_API_KEY a FIRECRAWL_API_KEY."
          : msg.includes("abort") || (e instanceof Error && e.name === "AbortError")
            ? "Požadavek vypršel (timeout). Analýza trvá cca 15–25 s, zkuste to znovu."
            : msg;
      setError(friendly);
      setPhase("input");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setPhase("input");
    setUrl("");
    setAnalysisText(null);
    setScraped(null);
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

  if (phase === "result" && analysisText !== null) {
    return (
      <div className="gate-fade">
        <button type="button" onClick={resetAnalysis} style={{ background: "none", border: "none", color: "#6F6F6F", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Analyzovat jiný web</button>
        {scraped?.screenshot && (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #EAEAE7" }}>
            <img src={scraped.screenshot.startsWith("data:") ? scraped.screenshot : `data:image/png;base64,${scraped.screenshot}`} alt="Náhled webu" style={{ width: "100%", maxHeight: 240, objectFit: "cover" }} />
          </div>
        )}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid #EAEAE7",
            borderTop: "3px solid #B7E300",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <h3 style={{ margin: 0, padding: "16px 20px", fontSize: 18, fontWeight: 600, color: "#1A1A1A", borderBottom: "1px solid #EAEAE7" }}>
            Výsledek analýzy
          </h3>
          <div style={{ padding: "20px", fontSize: 15, color: "#1A1A1A", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {analysisText}
          </div>
        </div>
        <Link href="/start?from=brandfoceni&step=calendar&variant=paid" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
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
          <span style={{ fontSize: 14, color: "#6F6F6F", display: "block", marginTop: 4 }}>vratná záloha 500 Kč za termín</span>
        </button>
        <button type="button" onClick={() => setVariant("paid")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: variant === "paid" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: variant === "paid" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", transition: "all 0.2s" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Konzultace + vizuální board</span>
          <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>1 850 Kč</span>
        </button>
      </div>
      <p style={{ fontSize: 15, color: "#6F6F6F", marginBottom: 10 }}>Pro jaké účely budete fotky nejvíce používat?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {(["web", "social", "tisk", "vse"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setVyuziti(v)} style={{ textAlign: "left", padding: 12, borderRadius: 10, border: vyuziti === v ? "2px solid #B7E300" : "1px solid #EAEAE7", background: vyuziti === v ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 15, color: "#1A1A1A" }}>
            {v === "web" ? "Web a prezentace" : v === "social" ? "Sociální sítě" : v === "tisk" ? "Tiskové materiály" : "Všechny výše"}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 15, color: "#6F6F6F", marginBottom: 10 }}>Preferujete spíše ateliér nebo exteriér?</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {(["atelier", "exterier", "oba"] as const).map((p) => (
          <button key={p} type="button" onClick={() => setProstredi(p)} style={{ padding: "10px 16px", borderRadius: 10, border: prostredi === p ? "2px solid #B7E300" : "1px solid #EAEAE7", background: prostredi === p ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 14, color: "#1A1A1A" }}>
            {p === "atelier" ? "Ateliér" : p === "exterier" ? "Exteriér" : "Obojí"}
          </button>
        ))}
      </div>
      {variant === "free" ? (
        <>
          <p style={{ fontSize: 16, color: "#1A1A1A", lineHeight: 1.6, marginBottom: 16 }}>
            Konzultace je zdarma s vratnou zálohou 500 Kč za termín. Záloha vám bude vrácena při dostavení se nebo odečtena z další služby. Probereme vaše cíle, styl focení a doporučíme další postup.
          </p>
          <Link href="/start?from=brandfoceni&step=calendar&variant=free" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
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
          {error && <p style={{ fontSize: 14, color: "#b91c1c", marginBottom: 12 }}>⚠ {error}</p>}
          <button type="button" onClick={analyze} disabled={!url.trim() || isLoading} style={{ padding: "14px 28px", background: url.trim() && !isLoading ? "#B7E300" : "#EAEAE7", color: "#1A1A1A", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: url.trim() && !isLoading ? "pointer" : "not-allowed", opacity: url.trim() && !isLoading ? 1 : 0.7 }}>
            Analyzovat web
          </button>
        </>
      )}
    </div>
  );
}

function PortretFlow() {
  const [variant, setVariant] = useState<"autorsky" | "brand">("autorsky");
  const [typ, setTyp] = useState<"profesni" | "autorsky_vytvarny" | "rodinny">("profesni");
  const [vizazistka, setVizazistka] = useState(false);
  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <p style={{ fontSize: 17, color: "#6F6F6F", marginBottom: 20 }}>Vyberte variantu</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={() => setVariant("autorsky")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: variant === "autorsky" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: variant === "autorsky" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Autorský portrét</span>
          <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>4 500 Kč</span>
        </button>
        <button type="button" onClick={() => setVariant("brand")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: variant === "brand" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: variant === "brand" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Brand portrét v ateliéru Kampa</span>
          <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>4 500 Kč</span>
        </button>
      </div>
      <p style={{ fontSize: 15, color: "#6F6F6F", marginBottom: 16 }}>Typ portrétu</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {(["profesni", "autorsky_vytvarny", "rodinny"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTyp(t)} style={{ textAlign: "left", padding: 12, borderRadius: 10, border: typ === t ? "2px solid #B7E300" : "1px solid #EAEAE7", background: typ === t ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 15, color: "#1A1A1A" }}>
            {t === "profesni" ? "Profesní portrét" : t === "autorsky_vytvarny" ? "Autorský portrét / výtvarný" : "Rodinný portrét"}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 15, color: "#1A1A1A" }}>
          <input type="checkbox" checked={vizazistka} onChange={(e) => setVizazistka(e.target.checked)} style={{ width: 18, height: 18 }} />
          Přejete si vizážistku? <span style={{ color: "#6F6F6F" }}>+ 3 500 Kč</span>
        </label>
      </div>
      <p style={{ fontSize: 14, color: "#6F6F6F", marginBottom: 20 }}>Konzultace zde není – stačí vyplnit dotazník. Termín focení zvolíte v dalším kroku.</p>
      <Link href="/start?from=portret&step=calendar" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
        Pokračovat k výběru termínu
      </Link>
    </div>
  );
}

function RodinneFlow() {
  const [typ, setTyp] = useState<"reportaz" | "atelier">("reportaz");
  const [kde, setKde] = useState("");
  const [kolik, setKolik] = useState("");
  const [analogDigital, setAnalogDigital] = useState<"analog" | "digital" | "">("");
  const [obleceni, setObleceni] = useState(false);
  return (
    <div className="gate-fade">
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 24 }}>Krok 1 / 3</p>
      <p style={{ fontSize: 17, color: "#6F6F6F", marginBottom: 20 }}>Vyberte typ focení</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={() => setTyp("reportaz")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: typ === "reportaz" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: typ === "reportaz" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Reportážní dokumentární focení</span>
          <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>5 800 Kč</span>
        </button>
        <button type="button" onClick={() => setTyp("atelier")} style={{ textAlign: "left", padding: 16, borderRadius: 12, border: typ === "atelier" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: typ === "atelier" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>Ateliérové focení stylizace</span>
          <span style={{ fontSize: 15, color: "#6F6F6F", marginLeft: 8 }}>8 500 Kč</span>
        </button>
      </div>
      <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>Kde si přejete fotit?</label>
      <input type="text" value={kde} onChange={(e) => setKde(e.target.value)} placeholder="např. park, byt, ateliér" className="gate-input" style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 12, fontSize: 15, marginBottom: 16 }} />
      <label style={{ display: "block", fontSize: 13, color: "#6F6F6F", marginBottom: 6 }}>Kolik vás bude?</label>
      <input type="text" value={kolik} onChange={(e) => setKolik(e.target.value)} placeholder="např. 4 osoby, 2 dospělí + 2 děti" className="gate-input" style={{ width: "100%", padding: "12px 14px", border: "1px solid #EAEAE7", borderRadius: 12, fontSize: 15, marginBottom: 16 }} />
      <p style={{ fontSize: 13, color: "#6F6F6F", marginBottom: 8 }}>Preferujete fotky na analog nebo digitál?</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button type="button" onClick={() => setAnalogDigital("analog")} style={{ padding: "10px 16px", borderRadius: 10, border: analogDigital === "analog" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: analogDigital === "analog" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 14 }}>Analog</button>
        <button type="button" onClick={() => setAnalogDigital("digital")} style={{ padding: "10px 16px", borderRadius: 10, border: analogDigital === "digital" ? "2px solid #B7E300" : "1px solid #EAEAE7", background: analogDigital === "digital" ? "rgba(183,227,0,0.08)" : "#FFF", cursor: "pointer", fontSize: 14 }}>Digitál</button>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 15, color: "#1A1A1A", marginBottom: 24 }}>
        <input type="checkbox" checked={obleceni} onChange={(e) => setObleceni(e.target.checked)} style={{ width: 18, height: 18 }} />
        Chcete pomoct s výběrem oblečení?
      </label>
      <Link href="/start?from=rodinne&step=calendar" style={{ display: "inline-block", padding: "14px 28px", background: "#B7E300", color: "#1A1A1A", fontWeight: 600, fontSize: 16, borderRadius: 12, textDecoration: "none" }} className="hover:opacity-90">
        Pokračovat k výběru termínu
      </Link>
    </div>
  );
}
