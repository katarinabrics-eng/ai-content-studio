/** Strategy Engine – marketing techniques behind the scenes. Public labels only in UI. */

export type StrategyId =
  | "conversion_push"
  | "trust_authority"
  | "brand_story"
  | "education_magnet"
  | "community_resonance"
  | "premium_positioning";

export type AwarenessLevel =
  | "unaware"
  | "problem_aware"
  | "solution_aware"
  | "product_aware"
  | "most_aware";

export type ContentGoal = "prodej" | "důvěra" | "edukace";

export type StrategyPreset = {
  id: StrategyId;
  publicLabel: string;
  publicDescription: string;
  copyFrameworks: string[];
  visualDirectives: string[];
  ctaStyle: string;
  bestForGoals: ContentGoal[];
};

export const STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: "conversion_push",
    publicLabel: "Konverzní tah",
    publicDescription: "Přímý, akční přístup zaměřený na okamžitou odpověď.",
    copyFrameworks: ["PAS", "direct response", "urgency"],
    visualDirectives: ["strong CTA focal point", "clear conversion path", "action-oriented composition"],
    ctaStyle: "direct, urgent, action verb",
    bestForGoals: ["prodej"],
  },
  {
    id: "trust_authority",
    publicLabel: "Důvěra a autorita",
    publicDescription: "Budování důvěryhodnosti a expertní pozice.",
    copyFrameworks: ["social proof", "authority", "credibility"],
    visualDirectives: ["professional, polished", "trustworthy aesthetics", "authoritative tone in visuals"],
    ctaStyle: "soft, invite, learn more",
    bestForGoals: ["důvěra"],
  },
  {
    id: "brand_story",
    publicLabel: "Příběh značky",
    publicDescription: "Storytelling a emocionální spojení se značkou.",
    copyFrameworks: ["StoryBrand", "hero journey", "emotional narrative"],
    visualDirectives: ["narrative composition", "emotional resonance", "story-driven imagery"],
    ctaStyle: "engagement, follow the journey",
    bestForGoals: ["důvěra"],
  },
  {
    id: "education_magnet",
    publicLabel: "Edukační magnet",
    publicDescription: "Hodnota přes edukaci, přitahování přes znalosti.",
    copyFrameworks: ["value ladder", "lead magnet", "teach then sell"],
    visualDirectives: ["clean, informative", "knowledge-forward", "clarity and simplicity"],
    ctaStyle: "download, learn, discover",
    bestForGoals: ["edukace"],
  },
  {
    id: "community_resonance",
    publicLabel: "Komunitní rezonance",
    publicDescription: "Propojení s komunitou a sdílené hodnoty.",
    copyFrameworks: ["community building", "belonging", "shared identity"],
    visualDirectives: ["inclusive, communal", "relatable imagery", "community feel"],
    ctaStyle: "join, share, connect",
    bestForGoals: ["důvěra", "edukace"],
  },
  {
    id: "premium_positioning",
    publicLabel: "Prémiový positioning",
    publicDescription: "Exkluzivita, kvalita a vyšší hodnota.",
    copyFrameworks: ["premium positioning", "exclusivity", "value anchoring"],
    visualDirectives: ["luxury aesthetics", "high-end feel", "refined, minimal"],
    ctaStyle: "elevated, exclusive access",
    bestForGoals: ["prodej"],
  },
];

export function getStrategyById(id: StrategyId): StrategyPreset | undefined {
  return STRATEGY_PRESETS.find((s) => s.id === id);
}

export function getStrategyByPublicLabel(label: string): StrategyPreset | undefined {
  return STRATEGY_PRESETS.find((s) => s.publicLabel === label);
}
