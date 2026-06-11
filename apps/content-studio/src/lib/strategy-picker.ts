import {
  STRATEGY_PRESETS,
  type AwarenessLevel,
  type ContentGoal,
  type StrategyId,
  type StrategyPreset,
} from "./strategy-library";

export type PickStrategyInput = {
  contentGoal: ContentGoal;
  platforms: string[];
  targetAudience?: string;
  offers?: string;
  toneOfVoice?: string;
  awarenessLevel?: AwarenessLevel;
};

export type PickStrategyResult = {
  strategy: StrategyPreset;
  rationale: string;
};

/** unaware/problem_aware -> víc edukace a problémový framing */
const AWARENESS_EDUCATION = ["unaware", "problem_aware"] as const;
/** solution/product_aware -> víc diferenciace a proof */
const AWARENESS_DIFFERENTIATION = ["solution_aware", "product_aware"] as const;

/** Pick best strategy based on intake context. Never expose framework names to client. */
export function pickStrategy(input: PickStrategyInput): PickStrategyResult {
  const { contentGoal, awarenessLevel } = input;

  let candidates: StrategyPreset[];
  let rationaleSuffix = "";

  switch (contentGoal) {
    case "prodej":
      candidates = STRATEGY_PRESETS.filter((s) => s.bestForGoals.includes("prodej"));
      if (awarenessLevel === "most_aware") {
        rationaleSuffix = "Cílová skupina je připravena – vhodný přímý konverzní přístup.";
      } else if (AWARENESS_DIFFERENTIATION.includes(awarenessLevel as (typeof AWARENESS_DIFFERENTIATION)[number])) {
        rationaleSuffix = "Cílovka už zná řešení – strategie zdůrazňuje diferenciaci a důkazy.";
      } else {
        rationaleSuffix = "Cílem je prodej – vybrali jsme strategii zaměřenou na konverzi.";
      }
      break;
    case "důvěra":
      candidates = STRATEGY_PRESETS.filter((s) => s.bestForGoals.includes("důvěra"));
      rationaleSuffix = awarenessLevel === "most_aware"
        ? "Důvěra + připravenost – strategie podporuje rozhodnutí."
        : "Cílem je budovat důvěru – strategie podporuje autoritu a vztah.";
      break;
    case "edukace":
      candidates = STRATEGY_PRESETS.filter((s) => s.bestForGoals.includes("edukace"));
      rationaleSuffix = AWARENESS_EDUCATION.includes(awarenessLevel as (typeof AWARENESS_EDUCATION)[number])
        ? "Nižší povědomí – strategie posiluje edukaci a problémový framing."
        : "Cílem je edukace – strategie přináší hodnotu přes znalosti.";
      break;
    default:
      candidates = STRATEGY_PRESETS;
      rationaleSuffix = "Obecná strategie podle kontextu.";
  }

  if (candidates.length === 0) candidates = STRATEGY_PRESETS;

  let chosen: StrategyPreset;
  if (contentGoal === "prodej" && awarenessLevel === "most_aware") {
    chosen = candidates.find((s) => s.id === "conversion_push") ?? candidates[0];
  } else if (contentGoal === "prodej" && AWARENESS_DIFFERENTIATION.includes(awarenessLevel as (typeof AWARENESS_DIFFERENTIATION)[number])) {
    chosen = candidates.find((s) => s.id === "premium_positioning") ?? candidates.find((s) => s.id === "trust_authority") ?? candidates[0];
  } else if (contentGoal === "prodej") {
    chosen = candidates.find((s) => s.id === "premium_positioning") ?? candidates.find((s) => s.id === "conversion_push") ?? candidates[0];
  } else if (contentGoal === "důvěra") {
    chosen = candidates.find((s) => s.id === "trust_authority") ?? candidates.find((s) => s.id === "brand_story") ?? candidates[0];
  } else if (AWARENESS_EDUCATION.includes(awarenessLevel as (typeof AWARENESS_EDUCATION)[number])) {
    chosen = candidates.find((s) => s.id === "education_magnet") ?? candidates.find((s) => s.id === "community_resonance") ?? candidates[0];
  } else {
    chosen = candidates.find((s) => s.id === "education_magnet") ?? candidates.find((s) => s.id === "community_resonance") ?? candidates[0];
  }

  const rationale = `${chosen.publicDescription} ${rationaleSuffix}`.trim();
  return { strategy: chosen, rationale };
}
