import type { StrategistId } from "@/lib/strategists/config";
import { STRATEGISTS } from "@/lib/strategists/config";

export type SuggestedStrategist = {
  id: StrategistId;
  label: string;
  tagline: string;
  reason: string;
  fit_score: number;
};

export const STRATEGISTS_META = STRATEGISTS.map((s) => ({
  id: s.id,
  label: s.name,
  tagline: s.title,
}));

type ScanResultForSelector = {
  brandScore?: { total?: number };
  brandDna?: { contentPillars?: string[]; uniqueValue?: string };
  pillarAnalysis?: Record<
    string,
    { score?: number; strategicOpportunity?: string }
  >;
};

function generateReason(
  id: StrategistId,
  _result: ScanResultForSelector
): string {
  const reasons: Record<StrategistId, string> = {
    the_architect: "Značka má prostor posílit nabídku a hodnotovou propozici.",
    the_illuminator: "Příběh značky může být srozumitelnější pro zákazníka.",
    the_pulse: "Obsah a viditelnost mohou výrazně zvýšit dosah.",
    the_catalyst: "Emocionální propojení s cílovou skupinou je klíčové.",
    the_signal: "Jasné pozicování a niche pomohou vyniknout.",
    the_pathfinder: "Cesta zákazníka od zájmu k nákupu si zaslouží mapu.",
    the_luminary: "Osobní značka a komunita posílí důvěru.",
    the_horizon: "Trendy a dlouhodobá strategie dají značce směr.",
    the_content_voice: "Generuje texty pro web, bio, video brief, claims a srdce značky z Brand DNA.",
  };
  return reasons[id] ?? "Doporučeno na základě profilu značky.";
}

/** Vybere 2 stratégy na základě výsledku diagnostiky (pilíře, skóre). */
export function selectStrategists(
  scanResult: ScanResultForSelector
): SuggestedStrategist[] {
  const scores = scanResult.pillarAnalysis ?? {};
  const light = scores.light?.score ?? 5;
  const energy = scores.energy?.score ?? 5;
  const architecture = scores.architecture?.score ?? 5;
  const identity = scores.identity?.score ?? 5;
  const trust = scores.trust?.score ?? 5;
  const total = scanResult.brandScore?.total ?? 50;

  type Candidate = { id: StrategistId; score: number };
  const candidates: Candidate[] = [
    { id: "the_architect", score: 20 - light - architecture },
    { id: "the_illuminator", score: 20 - light - identity },
    { id: "the_pulse", score: 20 - energy },
    { id: "the_catalyst", score: 20 - trust },
    { id: "the_signal", score: 20 - identity },
    { id: "the_pathfinder", score: 20 - architecture },
    { id: "the_luminary", score: 20 - trust - identity },
    { id: "the_horizon", score: total < 50 ? 12 : 5 },
    { id: "the_content_voice", score: 20 - identity - light },
  ];

  candidates.sort((a, b) => b.score - a.score);
  const top2 = candidates.slice(0, 2).map((c) => {
    const meta = STRATEGISTS_META.find((m) => m.id === c.id)!;
    return {
      id: c.id,
      label: meta.label,
      tagline: meta.tagline,
      reason: generateReason(c.id, scanResult),
      fit_score: Math.min(100, 50 + c.score * 5),
    };
  });

  return top2;
}
