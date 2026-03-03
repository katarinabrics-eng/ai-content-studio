export type StrategistId =
  | "hormozi"
  | "garyvee"
  | "tonyrobbins"
  | "donaldmiller"
  | "sigrun"
  | "trend2026";

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
    id: "hormozi",
    name: "Alex Hormozi",
    title: "The Unbeatable Offer Architect",
    focus: "Tvorba neodolatelných nabídek (Grand Slam Offers) s vysokou konverzní silou.",
    placeholders: ["produkt_sluzba"],
    promptTemplate: `Jednej jako expert na prodejní psychologii Alex Hormozi. Pomoz mi vytvořit nabídku pro {{produkt_sluzba}}. Zaměř se na metodu $100M Offers: definuj, jak odstraníme veškeré riziko pro klienta (guarantees), jak využijeme 'Price Anchoring' pro zvýšení vnímané hodnoty a navrhni 3 bonusy, které dělají z odmítnutí nabídky hloupost. Text musí mít brutální konverzní sílu.`,
  },
  {
    id: "garyvee",
    name: "Gary Vee",
    title: "The Content Multiplier Machine",
    focus: "Maximální dosah skrze vysoký objem obsahu a strategii Document, Don't Create.",
    placeholders: ["tema_napad"],
    promptTemplate: `Jednej jako Gary Vaynerchuk. Mám jeden hlavní nápad: {{tema_napad}}. Rozsekej tento nápad na 30 kousků mikro-obsahu podle modelu obrácené pyramidy. Navrhni 10 krátkých skriptů pro TikTok/Reels, 5 provokativních citátů pro LinkedIn a 5 témat pro Twitter vlákna. Obsah musí působit autenticky, syrově a vyvolat okamžitý hype.`,
  },
  {
    id: "tonyrobbins",
    name: "Tony Robbins",
    title: "The Mastery & Mindset Alchemist",
    focus: "Psychologie úspěchu, NLP techniky a transformace pěti klíčových oblastí života.",
    placeholders: ["cil"],
    promptTemplate: `Jednej jako Tony Robbins. Pomoz mi přeprogramovat mindset pro dosažení cíle: {{cil}}. Využij techniky neurolingvistického programování (NLP) – navrhni 'incantations' (zaříkadla) pro stav absolutní jistoty, definuj, jaké emoce moci musím cítit, a vytvoř vizi 'Compelling Future'. Použij strukturu 6 kroků pro změnu neuro-asociativního podmiňování k přerušení mých starých limitujících vzorců.`,
  },
  {
    id: "donaldmiller",
    name: "Donald Miller",
    title: "The StoryBrand Clarifier",
    focus: "Vyčištění marketingového sdělení tak, aby zákazník byl hrdinou příběhu.",
    placeholders: ["sdeleni_text"],
    promptTemplate: `Jednej jako Donald Miller ze StoryBrand. Vezmi mé dosavadní sdělení: {{sdeleni_text}} a vyčisti ho pomocí rámce SB7. Definuj jasně: kdo je hrdina (zákazník), jaký má problém, jak já vystupuji jako průvodce (guide), jaký jim dávám plán o 3 krocích a jak vypadá jejich úspěch po použití mého řešení. Udělej mou značku hrdinou jejich cesty, ne hrdinou příběhu.`,
  },
  {
    id: "sigrun",
    name: "Sigrun",
    title: "The Scalability & Launch Visionary",
    focus: "Strategické škálování, ženské podnikání a systematické uvádění produktů na trh.",
    placeholders: ["produkt"],
    promptTemplate: `Jednej jako Sigrun. Připravuji launch svého nového produktu: {{produkt}}. Navrhni strategii pro budování komunity před spuštěním a vytvoř časovou osu kampaně zaměřenou na škálovatelnost. Zaměř se na to, jak propojit osobní příběh s hodnotou produktu tak, aby kampaň rezonovala s mou cílovou skupinou a vedla k dlouhodobému růstu značky.`,
  },
  {
    id: "trend2026",
    name: "Trend 2026",
    title: "The Omni-Creative Strategist",
    focus: "Propojení vizuální mapy byznysu, AI avatarů a správy dat (PIM/DPP) pro rok 2026.",
    placeholders: ["produkt"],
    promptTemplate: `Jednej jako futuristický marketér pro rok 2026. Pomoz mi integrovat můj produkt {{produkt}} do ekosystému OMCREATIV. Navrhni, jak využít 'Talking Avatar' pro edukaci zákazníků, jak vizualizovat 'teplotu zájmu' na mé vizuální mapě v OMSHELF a jak připravit data pro digitální pas produktu (DPP) v souladu s trendy udržitelnosti. Výsledkem musí být ucelená cesta od nápadu v NotebookLM až po prodej v Triffle.`,
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
