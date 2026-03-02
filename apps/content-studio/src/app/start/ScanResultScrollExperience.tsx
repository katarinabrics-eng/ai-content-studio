"use client";

import Link from "next/link";

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
export type ScanResult = { brandScore?: BrandScore; brandDna?: BrandDna; summary?: string };

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
  const pillarList = PILLARS.map((p) => ({ ...p, score: scores[p.id] ?? 5 }));
  const riskCommoditization = scores.energy <= 4;

  return (
    <div className="bg-[#0c0c14] text-[#e7e7ef]" style={{ fontFamily: "system-ui, sans-serif" }}>
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
      <Section>
        <div className="max-w-xl mx-auto text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">SVĚTLO</h2>
          <p className="text-sm text-zinc-500 mb-6">Clarity of Value</p>
          <p className="text-3xl font-bold text-lime-400 mb-8">Skóre: {scores.light} / 10</p>
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
        </div>
      </Section>

      {/* 5. Přechod */}
      <Section compact>
        <p className="text-xl text-zinc-500 max-w-lg mx-auto">
          Značka může být jasná.<br />Ale proč právě ona?
        </p>
      </Section>

      {/* 6. PILÍŘ II – ENERGIE */}
      <Section>
        <div className="max-w-xl mx-auto text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">ENERGIE</h2>
          <p className="text-3xl font-bold text-lime-400 mb-4">Skóre: {scores.energy} / 10</p>
          {riskCommoditization && (
            <p className="text-amber-400/90 text-sm font-medium mb-6">Riziko zaměnitelnosti: vysoké</p>
          )}
          <p className="text-zinc-400 text-sm mb-4">
            Osa: Cena ↔ Prémiovost · Obecné ↔ Specializované
          </p>
          {d.uniqueValue ? (
            <p className="text-zinc-300">Unikátní hodnota: {d.uniqueValue}</p>
          ) : null}
          <p className="text-zinc-400 text-sm mt-6">
            „Vaše značka dnes soutěží v přeplněné kategorii.“
          </p>
        </div>
      </Section>

      {/* 7. PILÍŘ III – ARCHITEKTURA */}
      <Section>
        <div className="max-w-xl mx-auto text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">ARCHITEKTURA</h2>
          <p className="text-3xl font-bold text-lime-400 mb-6">Skóre: {scores.architecture} / 10</p>
          <p className="text-zinc-400 text-sm">
            {result.brandScore?.hasCTA
              ? "Výzva k akci je přítomna – uživatel ví, co má udělat."
              : "Uživatel musí projít více kroků, než pochopí, co má udělat. Body tření. Konverzní mezera."}
          </p>
        </div>
      </Section>

      {/* 8. PILÍŘ IV – IDENTITA */}
      <Section>
        <div className="max-w-xl mx-auto text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">IDENTITA</h2>
          <p className="text-3xl font-bold text-lime-400 mb-6">Skóre: {scores.identity} / 10</p>
          <p className="text-zinc-400 text-sm mb-4">Vaše značka působí spíše:</p>
          <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 mb-6">
            {d.tone && <li>{d.tone}</li>}
            {d.communicationStyle && <li>{d.communicationStyle}</li>}
            {result.brandScore?.hasVisualIdentity ? <li>Vizuálně sjednoceně</li> : <li>Bez výrazného emočního tónu</li>}
          </ul>
          <p className="text-zinc-500 text-sm">Silnější směr by mohl být: Autoritativní + Lidský</p>
        </div>
      </Section>

      {/* 9. PILÍŘ V – DŮVĚRA */}
      <Section>
        <div className="max-w-xl mx-auto text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">DŮVĚRA</h2>
          <p className="text-3xl font-bold text-lime-400 mb-6">Skóre: {scores.trust} / 10</p>
          {!result.brandScore?.hasSocialProof && (
            <ul className="list-disc list-inside text-zinc-400 text-sm space-y-1 mb-6">
              <li>Chybí reference</li>
              <li>Chybí konkrétní výsledky</li>
              <li>Chybí expertní ukotvení</li>
            </ul>
          )}
          <p className="text-zinc-400 text-sm">„Bez důvěry značka nezíská prémiovou pozici.“</p>
        </div>
      </Section>

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

      {/* 12. CTA blok */}
      <Section className="pb-16">
        <div className="max-w-lg mx-auto rounded-2xl border border-white/10 bg-white/5 p-8 text-left">
          <p className="text-zinc-400 text-sm mb-4">
            Výběr termínu zavazuje k úhradě strategického Visual Boardu
          </p>
          <p className="text-3xl font-bold text-white mb-2">7 800 Kč</p>
          <p className="text-zinc-500 text-sm mb-8">Částka bude odečtena z celkové spolupráce.</p>
          <p className="text-zinc-300 text-sm mb-4">Získáte:</p>
          <ul className="space-y-2 text-sm text-zinc-300 mb-8">
            <li className="flex items-center gap-2"><span className="text-lime-400">✔</span> Kompletní strategii značky</li>
            <li className="flex items-center gap-2"><span className="text-lime-400">✔</span> Vizuální směr</li>
            <li className="flex items-center gap-2"><span className="text-lime-400">✔</span> Obsahový rámec</li>
            <li className="flex items-center gap-2"><span className="text-lime-400">✔</span> Směr kampaně</li>
          </ul>
          <Link
            href={projectId ? `/rezervace?project_id=${projectId}&service=strategicka-konzultace` : "/rezervace?service=strategicka-konzultace"}
            className="block w-full py-4 px-6 rounded-xl bg-lime-400 text-black font-bold text-center hover:bg-lime-300 transition"
          >
            Rezervovat termín
          </Link>
        </div>
      </Section>
    </div>
  );
}
