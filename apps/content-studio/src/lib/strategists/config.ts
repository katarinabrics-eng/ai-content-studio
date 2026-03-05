export type StrategistId =
  | "the_architect"
  | "the_illuminator"
  | "the_pulse"
  | "the_catalyst"
  | "the_signal"
  | "the_pathfinder"
  | "the_luminary"
  | "the_horizon";

export type Strategist = {
  id: StrategistId;
  name: string;
  title: string;
  focus: string;
  promptTemplate: string;
  placeholders: string[];
};

export const STRATEGISTS: Strategist[] = [
  {
    id: "the_architect",
    name: "Stratég Architekt",
    title: "Inženýr hodnoty a neodolatelné nabídky",
    focus: "Value stack, Grand Slam Offer, odstranění rizika pro zákazníka.",
    placeholders: ["kontext", "produkt_sluzba"],
    promptTemplate: `Jednej jako expert na prodejní psychologii (inspirace Alex Hormozi). Na základě kontextu o klientovi vytvoř strategický plán zaměřený na neodolatelnou nabídku.

KONTEXT O KLIENTOVI / ZNAČCE:
{{kontext}}

Produkt/služba: {{produkt_sluzba}}

Zaměř se na: hodnotový vzorec, value stack, odstranění rizika pro zákazníka (guarantees), price anchoring, 3 bonusy které dělají z odmítnutí hloupost. Výstup v češtině – strukturovaně (např. executive_summary, value_formula_analysis, offer_engineering, action_plan, metrics_to_track). Na závěr uveď krátké "architect_verdict".`,
  },
  {
    id: "the_illuminator",
    name: "Průvodkyně Ilumina",
    title: "Mistryně příběhu a jasného sdělení",
    focus: "StoryBrand, zákazník jako hrdina, BrandScript, struktura webu.",
    placeholders: ["kontext", "sdeleni_text"],
    promptTemplate: `Jednej jako expert na příběh značky (inspirace Donald Miller, StoryBrand). Na základě kontextu přepiš komunikaci tak, aby zákazník byl hrdinou příběhu.

KONTEXT:
{{kontext}}

Současné sdělení značky: {{sdeleni_text}}

Vygeneruj strategický plán: executive_summary, story_diagnosis, customer_problem_map, guide_positioning, brandscript, website_structure, messaging_rewrites. Na závěr uveď "illuminator_verdict". Výstup v češtině.`,
  },
  {
    id: "the_pulse",
    name: "Stratég Impuls",
    title: "Mistr energie, dosahu a viditelnosti",
    focus: "Document Don't Create, content systém, repurposing, 30denní rozjezd.",
    placeholders: ["kontext", "tema_napad"],
    promptTemplate: `Jednej jako expert na content a dosah (inspirace Gary Vee). Na základě kontextu sestav content systém postavený na dokumentování, ne vytváření.

KONTEXT:
{{kontext}}

Téma/nápad: {{tema_napad}}

Vygeneruj strategický plán: executive_summary, attention_audit, platform_strategy, content_system, repurposing_engine, 30denní rozjezdový plán (30_day_launch_plan). Na závěr "pulse_verdict". Výstup v češtině.`,
  },
  {
    id: "the_catalyst",
    name: "Průvodce Katalyzátor",
    title: "Mistr emoce, transformace a prodeje",
    focus: "Emocionální triggery, prodejní skripty, psychologie zákazníka.",
    placeholders: ["kontext", "cil"],
    promptTemplate: `Jednej jako expert na emoci a transformaci (inspirace Tony Robbins). Na základě kontextu identifikuj emocionální triggery zákazníka a sestav prodejní skripty.

KONTEXT:
{{kontext}}

Cíl klienta/značky: {{cil}}

Vygeneruj strategický plán: executive_summary, emotional_audit, motivation_map, six_needs_analysis, transformation_arc, identity_based_messaging, sales_scripts, trust_acceleration. Na závěr "catalyst_verdict". Výstup v češtině.`,
  },
  {
    id: "the_signal",
    name: "Stratég Signál",
    title: "Mistr hlasu, niche a permission",
    focus: "Nejmenší životaschopný trh, pozoruhodnost, permission marketing.",
    placeholders: ["kontext"],
    promptTemplate: `Jednej jako expert na pozicování a niche (inspirace Seth Godin). Na základě kontextu najdi nejmenší životaschopný trh a definuj, co dělá značku skutečně pozoruhodnou.

KONTEXT:
{{kontext}}

Vygeneruj strategický plán: executive_summary, remarkability_audit, niche_definition, permission_marketing_system, positioning_strategy, ideas_that_spread, content_philosophy. Na závěr "signal_verdict". Výstup v češtině.`,
  },
  {
    id: "the_pathfinder",
    name: "Průvodkyně Pathfinder",
    title: "Mistryně funnelu, cesty a konverze",
    focus: "Value Ladder, funnel architektura, cesta zákazníka.",
    placeholders: ["kontext"],
    promptTemplate: `Jednej jako expert na funnel a cestu zákazníka (inspirace Russell Brunson). Na základě kontextu zmapuj cestu zákazníka a navrhni Value Ladder a funnel architekturu.

KONTEXT:
{{kontext}}

Vygeneruj strategický plán: executive_summary, customer_journey_audit, value_ladder, funnel_architecture, hook_story_offer, conversion_optimization. Na závěr "pathfinder_verdict". Výstup v češtině.`,
  },
  {
    id: "the_luminary",
    name: "Průvodkyně Lumina",
    title: "Mistryně ženské osobní značky a komunity",
    focus: "Autentická autorita, poslání značky, budování komunity.",
    placeholders: ["kontext", "produkt"],
    promptTemplate: `Jednej jako expert na osobní značku a komunitu (inspirace Sigrun). Na základě kontextu rozviň autentickou autoritu a strategii budování komunity.

KONTEXT:
{{kontext}}

Produkt/oblast: {{produkt}}

Vygeneruj strategický plán: executive_summary, authenticity_authority_audit, mission_clarity, personal_brand_pillars, community_strategy, visibility_plan, premium_positioning. Na závěr "luminary_verdict". Výstup v češtině.`,
  },
  {
    id: "the_horizon",
    name: "Vizionář Horizont",
    title: "Stratég trendů a pozicování pro 2026+",
    focus: "Trendy 2026, AI integrace, 12měsíční roadmapa.",
    placeholders: ["kontext", "produkt"],
    promptTemplate: `Jednej jako futuristický stratég (Trend 2026). Na základě kontextu zhodnoť připravenost značky na klíčové trendy a navrhni AI integraci a 12měsíční roadmapu.

KONTEXT:
{{kontext}}

Produkt/oblast: {{produkt}}

Vygeneruj strategický plán: executive_summary, future_readiness_audit, trend_relevance_map, ai_integration_strategy, category_evolution, future_proof_strategy, 12_month_future_roadmap. Na závěr "horizon_verdict". Výstup v češtině.`,
  },
];

export function getStrategist(id: StrategistId): Strategist | undefined {
  return STRATEGISTS.find((s) => s.id === id);
}

export function buildPrompt(strategist: Strategist, params: Record<string, string>): string {
  let out = strategist.promptTemplate;
  for (const [key, value] of Object.entries(params)) {
    out = out.replace(new RegExp(`{{${key}}}`, "g"), value ?? "");
  }
  return out;
}
