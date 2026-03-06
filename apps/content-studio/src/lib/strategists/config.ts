export type StrategistId =
  | "the_architect"
  | "the_illuminator"
  | "the_pulse"
  | "the_catalyst"
  | "the_signal"
  | "the_pathfinder"
  | "the_luminary"
  | "the_horizon"
  | "the_content_voice";

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
    placeholders: ["kontext", "brand_dna_structured", "produkt_sluzba"],
    promptTemplate: `Jednej jako expert na prodejní psychologii (inspirace Alex Hormozi). Na základě kontextu o klientovi vytvoř strategický plán zaměřený na neodolatelnou nabídku.

KONTEXT O KLIENTOVI / ZNAČCE:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Produkt/služba: {{produkt_sluzba}}

Zaměř se na: hodnotový vzorec, value stack, odstranění rizika pro zákazníka (guarantees), price anchoring, 3 bonusy které dělají z odmítnutí hloupost. Výstup v češtině – strukturovaně (např. executive_summary, value_formula_analysis, offer_engineering, action_plan, metrics_to_track). Na závěr uveď krátké "architect_verdict".`,
  },
  {
    id: "the_illuminator",
    name: "Průvodkyně Ilumina",
    title: "Mistryně příběhu a jasného sdělení",
    focus: "StoryBrand, zákazník jako hrdina, BrandScript, struktura webu.",
    placeholders: ["kontext", "brand_dna_structured", "sdeleni_text"],
    promptTemplate: `Jednej jako expert na příběh značky (inspirace Donald Miller, StoryBrand). Na základě kontextu přepiš komunikaci tak, aby zákazník byl hrdinou příběhu.

KONTEXT:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Současné sdělení značky: {{sdeleni_text}}

Vygeneruj strategický plán: executive_summary, story_diagnosis, customer_problem_map, guide_positioning, brandscript, website_structure, messaging_rewrites. Na závěr uveď "illuminator_verdict". Výstup v češtině.`,
  },
  {
    id: "the_pulse",
    name: "Stratég Impuls",
    title: "Mistr energie, dosahu a viditelnosti",
    focus: "Document Don't Create, content systém, repurposing, 30denní rozjezd.",
    placeholders: ["kontext", "brand_dna_structured", "tema_napad"],
    promptTemplate: `Jednej jako expert na content a dosah (inspirace Gary Vee). Na základě kontextu sestav content systém postavený na dokumentování, ne vytváření.

KONTEXT:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Téma/nápad: {{tema_napad}}

Vygeneruj strategický plán: executive_summary, attention_audit, platform_strategy, content_system, repurposing_engine, 30denní rozjezdový plán (30_day_launch_plan). Na závěr "pulse_verdict". Výstup v češtině.`,
  },
  {
    id: "the_catalyst",
    name: "Průvodce Katalyzátor",
    title: "Mistr emoce, transformace a prodeje",
    focus: "Emocionální triggery, prodejní skripty, psychologie zákazníka.",
    placeholders: ["kontext", "brand_dna_structured", "cil"],
    promptTemplate: `Jednej jako expert na emoci a transformaci (inspirace Tony Robbins). Na základě kontextu identifikuj emocionální triggery zákazníka a sestav prodejní skripty.

KONTEXT:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Cíl klienta/značky: {{cil}}

Vygeneruj strategický plán: executive_summary, emotional_audit, motivation_map, six_needs_analysis, transformation_arc, identity_based_messaging, sales_scripts, trust_acceleration. Na závěr "catalyst_verdict". Výstup v češtině.`,
  },
  {
    id: "the_signal",
    name: "Stratég Signál",
    title: "Mistr hlasu, niche a permission",
    focus: "Nejmenší životaschopný trh, pozoruhodnost, permission marketing.",
    placeholders: ["kontext", "brand_dna_structured"],
    promptTemplate: `Jednej jako expert na pozicování a niche (inspirace Seth Godin). Na základě kontextu najdi nejmenší životaschopný trh a definuj, co dělá značku skutečně pozoruhodnou.

KONTEXT:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Vygeneruj strategický plán: executive_summary, remarkability_audit, niche_definition, permission_marketing_system, positioning_strategy, ideas_that_spread, content_philosophy. Na závěr "signal_verdict". Výstup v češtině.`,
  },
  {
    id: "the_pathfinder",
    name: "Průvodkyně Pathfinder",
    title: "Mistryně funnelu, cesty a konverze",
    focus: "Value Ladder, funnel architektura, cesta zákazníka.",
    placeholders: ["kontext", "brand_dna_structured"],
    promptTemplate: `Jednej jako expert na funnel a cestu zákazníka (inspirace Russell Brunson). Na základě kontextu zmapuj cestu zákazníka a navrhni Value Ladder a funnel architekturu.

KONTEXT:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Vygeneruj strategický plán: executive_summary, customer_journey_audit, value_ladder, funnel_architecture, hook_story_offer, conversion_optimization. Na závěr "pathfinder_verdict". Výstup v češtině.`,
  },
  {
    id: "the_luminary",
    name: "Průvodkyně Lumina",
    title: "Mistryně ženské osobní značky a komunity",
    focus: "Autentická autorita, poslání značky, budování komunity.",
    placeholders: ["kontext", "brand_dna_structured", "produkt"],
    promptTemplate: `Jednej jako expert na osobní značku a komunitu (inspirace Sigrun). Na základě kontextu rozviň autentickou autoritu a strategii budování komunity.

KONTEXT:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Produkt/oblast: {{produkt}}

Vygeneruj strategický plán: executive_summary, authenticity_authority_audit, mission_clarity, personal_brand_pillars, community_strategy, visibility_plan, premium_positioning. Na závěr "luminary_verdict". Výstup v češtině.`,
  },
  {
    id: "the_horizon",
    name: "Vizionář Horizont",
    title: "Stratég trendů a pozicování pro 2026+",
    focus: "Trendy 2026, AI integrace, 12měsíční roadmapa.",
    placeholders: ["kontext", "brand_dna_structured", "produkt"],
    promptTemplate: `Jednej jako futuristický stratég (Trend 2026). Na základě kontextu zhodnoť připravenost značky na klíčové trendy a navrhni AI integraci a 12měsíční roadmapu.

KONTEXT:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Produkt/oblast: {{produkt}}

Vygeneruj strategický plán: executive_summary, future_readiness_audit, trend_relevance_map, ai_integration_strategy, category_evolution, future_proof_strategy, 12_month_future_roadmap. Na závěr "horizon_verdict". Výstup v češtině.`,
  },
  {
    id: "the_content_voice",
    name: "Obsahový stratég — Hlas a příběh značky",
    title: "Generuje texty pro web, bio, video brief, claims a srdce značky z Brand DNA.",
    focus: "Cesta zákazníka, srdce značky, benefity, video brief, bio varianty, claims a tagliny.",
    placeholders: ["kontext", "brand_dna_structured", "produkt"],
    promptTemplate: `Jednej jako expert na obsah a hlas značky. Na základě Brand DNA klienta vygeneruj konkrétní texty. Použij kontext níže.

KONTEXT / BRAND DNA:
{{kontext}}
BRAND DNA (strukturovaná data z diagnostiky):
{{brand_dna_structured}}

Produkt/oblast: {{produkt}}

Vygeneruj přesně těchto 6 výstupů. Piš v jazyce klienta — pokud je Brand DNA česky, piš česky. Vyhni se obecnostem a klišé. Každý text musí být konkrétní pro tuto značku.

Formát výstupu (přesně tyto nadpisy a pořadí):

1. CESTA ZÁKAZNÍKA
Popis cesty klienta jeho jazykem — problém který řeší, moment kdy našel řešení, transformace kterou zažil.
Formát: 3 odstavce, osobní tón, konkrétní.

2. SRDCE ZNAČKY
Proč značka existuje. Co hájí. Čemu věří.
Formát: 3-5 vět, silné, bez obecností.

3. KLÍČOVÉ BENEFITY
5 konkrétních benefitů pro cílovou skupinu. Ne funkce — pocity a výsledky.
Formát: každý benefit = nadpis + jedna věta.

4. VIDEO BRIEF / SCRIPT
Krátký script pro prezentační video značky.
Struktura: Problém → Řešení → Důkaz → Výzva k akci.
Délka: 60-90 sekund mluveného slova.

5. BIO VARIANTY
- Krátké bio (Twitter/Instagram): max 160 znaků
- Střední bio (LinkedIn About): 3-4 věty
- Dlouhé bio (web stránka O mně): 2-3 odstavce

6. CLAIMS A TAGLINY
5 variant claimu značky — různé tóny:
- Silný a přímý
- Emocionální
- Provokativní
- Minimalistický
- Příběhový`,
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
