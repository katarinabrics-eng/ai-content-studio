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
  result: ScanResultForSelector
): string {
  const total = result.brandScore?.total ?? 50;
  const scores = result.pillarAnalysis ?? {};
  const light = scores.light?.score ?? 5;
  const energy = scores.energy?.score ?? 5;
  const architecture = scores.architecture?.score ?? 5;
  const identity = scores.identity?.score ?? 5;
  const trust = scores.trust?.score ?? 5;

  const reasons: Record<StrategistId, string> = {
    the_architect: light < 5
      ? `Skóre jasnosti (${light}/10) ukazuje že zákazník nevidí hodnotu hned. Architekt navrhne nabídku kterou nelze odmítnout.`
      : `Architektura nabídky (${architecture}/10) má prostor na posílení hodnotové propozice.`,

    the_illuminator: identity < 5
      ? `Identita značky (${identity}/10) je slabá — zákazník neví proč si vybrat právě tebe. Ilumina přepíše příběh.`
      : `Příběh značky může být jasnější. Skóre světla (${light}/10) naznačuje komunikační mezeru.`,

    the_pulse: energy < 5
      ? `Energie a viditelnost (${energy}/10) jsou kriticky nízké. Impuls navrhne content systém pro okamžitý dosah.`
      : `Obsah pracuje ale mohl by pracovat víc. Dosah (${energy}/10) má prostor růst.`,

    the_catalyst: trust < 5
      ? `Důvěra (${trust}/10) je nejslabší článek. Katalyzátor identifikuje emocionální triggery a posílí konverze.`
      : `Emocionální propojení se zákazníkem (${trust}/10) je klíčové pro další růst.`,

    the_signal: identity < 5
      ? `Pozicování (${identity}/10) je nejasné. Signál najde niche kde budeš první volba, ne jedna z mnoha.`
      : `Značka se ztrácí v šumu. Signál (${identity}/10) pomůže vyniknout v přeplněném trhu.`,

    the_pathfinder: architecture < 5
      ? `Architektura cesty zákazníka (${architecture}/10) je slabá — lidé odcházejí před nákupem. Pathfinder navrhne funnel.`
      : `Cesta od zájmu k nákupu má mezery (${architecture}/10). Pathfinder ji zmapuje a opraví.`,

    the_luminary: trust < 5 && identity < 5
      ? `Osobní značka (identita ${identity}/10, důvěra ${trust}/10) potřebuje pevný základ. Lumina posílí autoritu a komunitu.`
      : `Komunita a autentická autorita jsou klíčem k dalšímu růstu (důvěra ${trust}/10).`,

    the_horizon: total < 40
      ? `Celkové skóre (${total}/100) ukazuje že značka potřebuje přehodnotit směr. Horizont navrhne roadmapu pro 2026+.`
      : `Trendy 2026 a AI integrace dají značce (${total}/100) náskok před konkurencí.`,

    the_content_voice: light < 5
      ? `Texty a hlas značky (světlo ${light}/10) nefungují. Content Voice přepíše bio, web copy a claims.`
      : `Identita (${identity}/10) se nedostává do textů. Content Voice vytvoří konzistentní hlas značky.`,
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
    { id: "the_architect", score: (10 - light) + (10 - architecture) },
    { id: "the_illuminator", score: (10 - light) + (10 - identity) },
    { id: "the_pulse", score: (10 - energy) * 2 },
    { id: "the_catalyst", score: (10 - trust) * 2 },
    { id: "the_signal", score: (10 - identity) * 2 },
    { id: "the_pathfinder", score: (10 - architecture) * 2 },
    { id: "the_luminary", score: (10 - trust) + (10 - identity) },
    {
      id: "the_horizon",
      score: total < 40 ? (10 - energy) + 8 : total < 55 ? (10 - energy) + 3 : 0,
    },
    { id: "the_content_voice", score: (10 - identity) + (10 - light) },
  ];

  candidates.sort((a, b) => b.score - a.score);
  const top2 = candidates.slice(0, 2).map((c) => {
    const meta = STRATEGISTS_META.find((m) => m.id === c.id)!;
    return {
      id: c.id,
      label: meta.label,
      tagline: meta.tagline,
      reason: generateReason(c.id, scanResult),
      fit_score: Math.min(98, Math.max(60, 50 + c.score * 4)),
    };
  });

  return top2;
}
