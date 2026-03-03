"use client";

import { useState } from "react";
import BookingCalendar from "@/components/booking/BookingCalendar";

export type BrandScore = {
  total?: number;
  hasHeadline?: boolean;
  hasOffer?: boolean;
  hasTargetAudience?: boolean;
  hasCTA?: boolean;
  hasVisualIdentity?: boolean;
  hasSocialProof?: boolean;
};
export type VisualStyle = { primaryColor?: string; secondaryColor?: string; mood?: string; typography?: string };
export type BrandDna = {
  name?: string;
  positioning?: string;
  tone?: string;
  targetAudience?: string;
  communicationStyle?: string;
  contentPillars?: string[];
  uniqueValue?: string;
  missingElements?: string[];
  visualStyle?: VisualStyle;
};
export type PillarAnalysisItem = {
  score?: number;
  interpretation?: string;
  observed?: string[];
  notObserved?: string[];
  reasoning?: string;
  strategicOpportunity?: string;
};
export type ScanResult = {
  brandScore?: BrandScore;
  brandDna?: BrandDna;
  summary?: string;
  pillarAnalysis?: Record<string, PillarAnalysisItem>;
};

const PILLARS = [
  { id: "light", title: "SVĚTLO", subtitle: "Clarity of Value" },
  { id: "energy", title: "ENERGIE", subtitle: "" },
  { id: "architecture", title: "ARCHITEKTURA", subtitle: "" },
  { id: "identity", title: "IDENTITA", subtitle: "" },
  { id: "trust", title: "DŮVĚRA", subtitle: "" },
] as const;

function derivePillarScores(result: ScanResult): Record<string, number> {
  const s = result.brandScore ?? {};
  const d = result.brandDna ?? {};
  const light = Math.round(
    ((s.hasHeadline ? 1 : 0) + (s.hasOffer ? 1 : 0) + (s.hasTargetAudience ? 1 : 0)) / 3 * 10
  );
  const energy = Math.min(
    10,
    (d.uniqueValue?.trim() ? 3 : 0) + Math.min(4, (d.contentPillars?.length ?? 0) * 2) + 3
  );
  const architecture = s.hasCTA ? 7 : 3;
  const identity = Math.min(
    10,
    (s.hasVisualIdentity ? 4 : 0) + (d.tone ? 3 : 0) + (d.communicationStyle ? 3 : 0)
  );
  const trust = s.hasSocialProof ? 7 : 3;
  return { light, energy, architecture, identity, trust };
}

function Section({
  children,
  className = "",
  compact,
}: {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`flex flex-col items-center justify-center px-6 text-center ${compact ? "py-8" : "py-12 md:py-14"} ${className}`}
      style={{ background: "#0c0c14", color: "#e7e7ef" }}
    >
      {children}
    </section>
  );
}

function HeroSubline({ total }: { total: number }) {
  if (total >= 65) return "Vaše značka má solidní základ. Největší prostor je v důvěře a diferenciaci.";
  if (total >= 45) return "Vaše značka má potenciál růstu. Největší prostor je v oblasti důvěry a diferenciace.";
  return "Vaše značka má potenciál. Největší prostor je v jasnosti nabídky a důvěře.";
}

export function ScanResultScrollExperience({
  result,
  projectId,
  onBack,
}: {
  result: ScanResult;
  projectId: string | null;
  onBack?: () => void;
}) {
  const total = Math.min(100, Math.max(0, result.brandScore?.total ?? 0));
  const summary = result.summary?.trim() ?? "";
  const d = result.brandDna ?? {};
  const scores = derivePillarScores(result);
  const pillarAnalysis = result.pillarAnalysis ?? {};
  const pillarList = PILLARS.map((p) => ({
    ...p,
    score: pillarAnalysis[p.id]?.score ?? scores[p.id] ?? 5,
  }));
  const riskCommoditization = scores.energy <= 4;
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  async function handleSaveLead() {
    const trimmed = leadEmail.trim();
    if (!trimmed) return;
    setLeadSubmitting(true);
    setLeadError(null);
    try {
      const res = await fetch("/api/analysis-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          analyzedUrl: "",
          result: {
            brandScore: result.brandScore,
            brandDna: result.brandDna,
            summary: result.summary,
          },
          scrapedMeta: {},
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

  function Collapsible({
    children,
    isOpen,
    onToggle,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
  }) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={onToggle}
          className="text-sm text-zinc-400 hover:text-white transition bg-transparent border-0 cursor-pointer p-0"
        >
          {isOpen ? "− Skrýt metodiku" : "→ Jak jsme hodnotili"}
        </button>
        {isOpen && (
          <div className="mt-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
            {children}
          </div>
        )}
      </div>
    );
  }

  function PillarBlock({
    id,
    title,
    subtitle,
    children,
    showTrustMethodology,
  }: {
    id: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    showTrustMethodology?: boolean;
  }) {
    const analysis = pillarAnalysis[id];
    const score = analysis?.score ?? scores[id as keyof typeof scores] ?? 5;
    const hasInterpretation = analysis?.interpretation?.trim();
    const hasExpandableContent =
      analysis &&
      (analysis.observed?.length ||
        analysis.notObserved?.length ||
        analysis.reasoning ||
        (showTrustMethodology && id === "trust"));
    const isOpen = openPillar === id;

    const publicInterpretation = hasInterpretation
      ? analysis!.interpretation!
      : analysis?.reasoning
        ? analysis.reasoning.split(/(?<=[.!])\s+/).slice(0, 2).join(" ").trim() || null
        : null;

    return (
      <Section>
        <div className="max-w-xl mx-auto text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{title}</h2>
          {subtitle && <p className="text-sm text-zinc-500 mb-4">{subtitle}</p>}
          <p className="text-2xl font-bold text-lime-400 mb-4">{title}: {score}/10</p>

          <div className="space-y-3">
            {publicInterpretation ? (
              <p className="text-base text-zinc-200 leading-relaxed">{publicInterpretation}</p>
            ) : (
              <div>{children}</div>
            )}

            {hasExpandableContent && (
              <Collapsible
                isOpen={isOpen}
                onToggle={() => setOpenPillar(isOpen ? null : id)}
              >
                <div className="space-y-4">
                  {analysis?.observed && analysis.observed.length > 0 && (
                    <div>
                      <p className="text-zinc-500 uppercase tracking-wider text-xs mb-2">Co jsme zaznamenali</p>
                      <ul className="list-disc list-inside text-zinc-300 space-y-1">
                        {analysis.observed.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis?.notObserved && analysis.notObserved.length > 0 && (
                    <div>
                      <p className="text-zinc-500 uppercase tracking-wider text-xs mb-2">Co jsme nezaznamenali</p>
                      <ul className="list-disc list-inside text-zinc-400 space-y-1">
                        {analysis.notObserved.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {showTrustMethodology && id === "trust" && (
                    <div>
                      <p className="text-zinc-500 uppercase tracking-wider text-xs mb-2">Metodika rozlišuje mezi</p>
                      <div className="text-zinc-400 space-y-1.5 text-xs">
                        <p><strong className="text-zinc-300">Portfolio</strong> = ukázka práce</p>
                        <p><strong className="text-zinc-300">Reference</strong> = hlas klienta</p>
                        <p><strong className="text-zinc-300">Case study</strong> = důkaz výsledku</p>
                      </div>
                    </div>
                  )}
                  {analysis?.reasoning && (
                    <div>
                      <p className="text-zinc-500 uppercase tracking-wider text-xs mb-2">Proč to ovlivnilo skóre</p>
                      <p className="text-zinc-300 leading-relaxed">{analysis.reasoning}</p>
                    </div>
                  )}
                </div>
              </Collapsible>
            )}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <div className="bg-[#0c0c14] text-[#e7e7ef] animate-fade-in" style={{ fontFamily: "system-ui, sans-serif" }}>
      {onBack && (
        <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-3 border-b border-white/5 bg-[#0c0c14]/90 backdrop-blur">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            ← Analyzovat jiný web
          </button>
          <span className="text-[10px] uppercase tracking-widest text-zinc-600">Lucifera Strategic Brand Scan™</span>
        </div>
      )}

      {/* 1. HERO – Zrcadlo */}
      <Section>
        <div className="animate-fade-in">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-4">
            Index vizuální úrovně značky
          </p>
          <p className="text-6xl md:text-8xl font-bold text-white mb-2">
            {total}
            <span className="text-zinc-500 font-normal text-4xl md:text-5xl"> / 100</span>
          </p>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mt-6 leading-relaxed">
            „{HeroSubline({ total })}“
          </p>
        </div>
      </Section>

      {/* 2. Radar – 5 pilířů */}
      <Section>
        <div className="w-full max-w-lg mx-auto space-y-6">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-8">Pět pilířů značky</p>
          <div className="flex flex-wrap justify-center gap-8">
            {pillarList.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <span className="text-lg font-semibold text-white">{p.title}</span>
                <span className="text-2xl font-bold text-lime-400">{p.score}/10</span>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 text-sm mt-10 max-w-md mx-auto">
            „Vaše značka není slabá. Ale není ještě strategicky sladěná.“
          </p>
        </div>
      </Section>

      {/* 3. Přechod */}
      <Section compact>
        <p className="text-xl md:text-2xl text-zinc-500 max-w-lg mx-auto">
          Značka není jen vizuál.<br />Je to systém.
        </p>
      </Section>

      {/* 4. PILÍŘ I – SVĚTLO */}
      <PillarBlock id="light" title="SVĚTLO" subtitle="Clarity of Value">
        <div className="space-y-4 text-sm text-zinc-300">
          <div>
            <p className="text-zinc-500 uppercase tracking-wider text-xs mb-2">Co funguje</p>
            <ul className="list-disc list-inside space-y-1">
              {d.positioning && <li>Je jasné, že nabízíte konkrétní hodnotu</li>}
              {d.targetAudience && <li>Komunikace je srozumitelná</li>}
              {!d.positioning && !d.targetAudience && <li>Základní struktura je rozpoznatelná</li>}
            </ul>
          </div>
          <div>
            <p className="text-zinc-500 uppercase tracking-wider text-xs mb-2">Co brzdí růst</p>
            <ul className="list-disc list-inside space-y-1">
              {!result.brandScore?.hasHeadline && <li>Hlavní claim je generický nebo chybí</li>}
              {!result.brandScore?.hasTargetAudience && <li>Cílová skupina není jednoznačně identifikovaná</li>}
              {(result.brandScore?.hasHeadline && result.brandScore?.hasTargetAudience) && <li>Možnost ještě více vyostřit hlavní zprávu</li>}
            </ul>
          </div>
        </div>
        {d.positioning && (
          <div className="mt-8 p-4 rounded-xl bg-lime-500/10 border border-lime-500/20">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Pokud by měl být claim přesnější, mohl by znít například:</p>
            <p className="text-white font-medium">„{d.positioning}“</p>
          </div>
        )}
      </PillarBlock>

      {/* 5. Přechod */}
      <Section compact>
        <p className="text-xl text-zinc-500 max-w-lg mx-auto">
          Značka může být jasná.<br />Ale proč právě ona?
        </p>
      </Section>

      {/* 6. PILÍŘ II – ENERGIE */}
      <PillarBlock id="energy" title="ENERGIE">
        {riskCommoditization && (
          <p className="text-amber-400/90 text-sm font-medium mb-6">Riziko zaměnitelnosti: vysoké</p>
        )}
        <p className="text-zinc-400 text-sm mb-4">Osa: Cena ↔ Prémiovost · Obecné ↔ Specializované</p>
        {d.uniqueValue ? <p className="text-zinc-300">Unikátní hodnota: {d.uniqueValue}</p> : null}
        <p className="text-zinc-400 text-sm mt-6">„Vaše značka dnes soutěží v přeplněné kategorii.“</p>
      </PillarBlock>

      {/* 7. PILÍŘ III – ARCHITEKTURA */}
      <PillarBlock id="architecture" title="ARCHITEKTURA">
        <p className="text-zinc-400 text-sm">
          {result.brandScore?.hasCTA
            ? "Výzva k akci je přítomna – uživatel ví, co má udělat."
            : "Uživatel musí projít více kroků, než pochopí, co má udělat. Body tření. Konverzní mezera."}
        </p>
      </PillarBlock>

      {/* 8. PILÍŘ IV – IDENTITA */}
      <PillarBlock id="identity" title="IDENTITA">
        <p className="text-zinc-400 text-sm mb-4">Vaše značka působí spíše:</p>
        <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 mb-6">
          {d.tone && <li>{d.tone}</li>}
          {d.communicationStyle && <li>{d.communicationStyle}</li>}
          {result.brandScore?.hasVisualIdentity ? <li>Vizuálně sjednoceně</li> : <li>Bez výrazného emočního tónu</li>}
        </ul>
        <p className="text-zinc-500 text-sm">Silnější směr by mohl být: Autoritativní + Lidský</p>
      </PillarBlock>

      {/* 9. PILÍŘ V – DŮVĚRA */}
      <PillarBlock id="trust" title="DŮVĚRA" showTrustMethodology>
        {!result.brandScore?.hasSocialProof && (
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-1 mb-6">
            <li>Chybí reference</li>
            <li>Chybí konkrétní výsledky</li>
            <li>Chybí expertní ukotvení</li>
          </ul>
        )}
        <p className="text-zinc-400 text-sm">„Bez důvěry značka nezíská prémiovou pozici.“</p>
      </PillarBlock>

      {/* 10. Shrnutí */}
      <Section>
        <div className="max-w-xl mx-auto text-left">
          <h2 className="text-2xl font-bold text-white mb-8">Strategický profil vaší značky</h2>
          <div className="grid grid-cols-2 gap-3 text-sm mb-8">
            {pillarList.map((p) => (
              <div key={p.id} className="flex justify-between py-2 border-b border-white/10">
                <span className="text-zinc-400">{p.title}</span>
                <span className="font-semibold text-white">{p.score}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4 text-sm text-zinc-300">
            {d.missingElements && d.missingElements.length > 0 && (
              <div>
                <p className="text-zinc-500 uppercase tracking-wider text-xs mb-2">3 klíčová rizika / okamžité akce</p>
                <ul className="list-disc list-inside space-y-1">
                  {d.missingElements.slice(0, 3).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary && (
              <div>
                <p className="text-zinc-500 uppercase tracking-wider text-xs mb-2">Doporučený strategický posun</p>
                <p className="text-zinc-300">{summary}</p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* 11. Finální dramatický blok */}
      <Section compact>
        <p className="text-2xl md:text-3xl font-semibold text-white max-w-lg mx-auto leading-relaxed">
          Značka má potenciál.<br />Otázka je, zda ho chcete využít.
        </p>
      </Section>

      {/* 11b. E-mail pro novinky a uložení dat – nad cenou */}
      <Section className="pb-8">
        <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-8 max-w-xl mx-auto shadow-2xl text-left">
          <h3 className="text-lg font-semibold text-white mb-2">Nechte nám e-mail</h3>
          <p className="text-zinc-400 text-sm mb-4">
            Chcete dostávat novinky a nabídky služeb na míru? Zadejte e-mail – nebudeme vás spamovat.
          </p>
          <p className="text-zinc-500 text-sm mb-6">
            Vaše zadaná data u nás zůstanou. Když se k nám jednou vrátíte, nic se vám neztratí.
          </p>
          {!leadSubmitted ? (
            <>
              <div className="flex flex-wrap gap-3 items-end">
                <input
                  type="email"
                  placeholder="vas@email.cz"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-lime-400/50 focus:outline-none focus:ring-1 focus:ring-lime-400/30"
                />
                <button
                  type="button"
                  onClick={handleSaveLead}
                  disabled={leadSubmitting || !leadEmail.trim()}
                  className="rounded-xl bg-lime-400 text-black font-semibold px-6 py-3 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {leadSubmitting ? "Odesílám…" : "Odeslat"}
                </button>
              </div>
              {leadError && (
                <p className="mt-3 text-sm text-red-400">{leadError}</p>
              )}
            </>
          ) : (
            <p className="text-lime-400 font-medium">Děkujeme. Budeme vás kontaktovat.</p>
          )}
        </div>
      </Section>

      {/* 12. CTA blok */}
      <Section className="pb-16">
        <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-10 max-w-xl mx-auto shadow-2xl text-left">
          <h3 className="text-4xl font-bold text-white mb-4">7 800 Kč</h3>
          <p className="text-zinc-400 text-sm mb-2">Výběr termínu zavazuje k úhradě strategického Visual Boardu</p>
          <p className="text-zinc-500 text-sm mb-4">Částka bude odečtena z celkové spolupráce.</p>
          <p className="text-zinc-300 text-sm mb-2">Získáte:</p>
          <ul className="space-y-2 text-sm text-zinc-300 mb-6">
            <li className="flex items-center gap-2"><span className="text-lime-400">✔</span> Kompletní strategii značky</li>
            <li className="flex items-center gap-2"><span className="text-lime-400">✔</span> Vizuální směr</li>
            <li className="flex items-center gap-2"><span className="text-lime-400">✔</span> Obsahový rámec</li>
            <li className="flex items-center gap-2"><span className="text-lime-400">✔</span> Směr kampaně</li>
          </ul>
          <button
            type="button"
            onClick={() => setOpenCalendar(true)}
            className="mt-6 w-full bg-lime-400 text-black font-semibold py-4 rounded-xl hover:scale-[1.02] transition-all duration-300"
          >
            Rezervovat termín
          </button>
        </div>

        {/* DARK MODAL – kalendář */}
        {openCalendar && !openConfirmation && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6"
            onClick={() => setOpenCalendar(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <BookingCalendar
                service="board"
                theme="dark"
                showBackLink={false}
                onDirectCheckout={(date) => {
                  setSelectedDate(date);
                  setOpenConfirmation(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Prémiový potvrzovací mezikrok */}
        {openConfirmation && selectedDate && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <div className="bg-[#0e0f14] border border-white/10 rounded-3xl p-12 max-w-lg w-full text-white">
              <h3 className="text-3xl font-semibold mb-6">
                Potvrzení vstupu do spolupráce
              </h3>
              <p className="text-white/70 mb-6">
                Rezervujete termín strategického Visual Boardu.
                Tento krok je závazný a zahajuje přípravu spolupráce.
              </p>
              <div className="mb-8">
                <div className="text-white/50 text-sm">Vybraný termín</div>
                <div className="text-2xl font-semibold mt-1">{selectedDate}</div>
                <div className="text-2xl font-semibold mt-4">7 800 Kč</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/api/checkout?type=board&date=${encodeURIComponent(selectedDate)}`;
                }}
                className="w-full py-4 rounded-xl bg-lime-400 text-black font-semibold hover:scale-[1.02] transition-all"
              >
                Uhradit a vstoupit do spolupráce
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenConfirmation(false);
                  setOpenCalendar(false);
                }}
                className="w-full mt-4 text-white/40 hover:text-white transition"
              >
                Zrušit
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section compact>
        <p className="text-xs text-zinc-600 max-w-md mx-auto text-center leading-relaxed">
          Metodika Lucifera Strategic Brand Scan™ je součástí placené spolupráce. Veřejná verze je orientační náhled.
        </p>
      </Section>
    </div>
  );
}
