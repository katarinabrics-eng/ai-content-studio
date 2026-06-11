/**
 * Generování návrhů příspěvků dle strategie: formát (FB/IG/LinkedIn/leták/carousel),
 * text (hook, body, cta, hashtags) + popis vizuálu. Min. 5 návrhů.
 */

import OpenAI from "openai";
import { getSupabaseClient } from "./supabase-server";
import { BUCKET_CLIENT_PROJECTS, fullPath, PATH } from "./project-paths";

export type ProposalFormat = "facebook" | "instagram" | "linkedin" | "letak" | "carousel";

export type ProposalItem = {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  visual_brief: string;
};

const FORMAT_LABELS: Record<ProposalFormat, string> = {
  facebook: "Facebook příspěvek",
  instagram: "Instagram příspěvek",
  linkedin: "LinkedIn příspěvek",
  letak: "Leták / tiskovina",
  carousel: "Carousel (více snímků)",
};

/** Načte výstup stratega ze složky projektu (ai/strategist/out.json). */
export async function loadStrategistOutput(storagePrefix: string | null): Promise<string | null> {
  if (!storagePrefix || typeof storagePrefix !== "string") return null;
  const supabase = getSupabaseClient();
  const path = fullPath(storagePrefix, PATH.strategistOut);
  const { data, error } = await supabase.storage.from(BUCKET_CLIENT_PROJECTS).download(path);
  if (error || !data) return null;
  try {
    const text = await data.text();
    const json = JSON.parse(text) as { output?: string };
    return typeof json.output === "string" ? json.output : null;
  } catch {
    return null;
  }
}

function buildProposalPrompt(
  brief: Record<string, unknown>,
  strategistOutput: string | null,
  format: ProposalFormat
): string {
  const parts = [
    "## Brief a kontext",
    `Značka: ${brief.brand_name ?? "—"}`,
    `Obor: ${brief.industry ?? "—"}`,
    `Cíl komunikace: ${brief.communication_goal ?? "—"}`,
    `Tón: ${brief.tone_of_voice ?? "profesionální"}`,
    `Cílová skupina: ${brief.target_audience ?? "—"}`,
    `Nabídky/produkty: ${brief.offers ?? "—"}`,
    `Preferované CTA: ${brief.preferred_cta ?? "—"}`,
    `Zakázaná slova: ${brief.forbidden_words ?? "žádná"}`,
    `Poznámka: ${brief.note ?? "—"}`,
  ];
  if (strategistOutput?.trim()) {
    parts.push("\n## Výstup strategie (dle toho tvoř návrhy)");
    parts.push(strategistOutput.trim());
  }
  parts.push(`\n## Formát: ${FORMAT_LABELS[format]}`);
  parts.push(
    "\nVytvoř alespoň 5 různých návrhů příspěvků. Každý návrh obsahuje: hook (úvodní věta), body (hlavní text), cta (výzva k akci), hashtags (3–5 hashtagů), visual_brief (stručný popis, jak by mohl vizuál vypadat – barvy, kompozice, prvky na obrázku, nálada). Odpověz POUZE validním JSON polem objektů."
  );
  return parts.join("\n");
}

const SYSTEM_PROMPT = `Jsi profesionální copywriter a kreativec pro sociální sítě a marketing. Vytváříš návrhy příspěvků v češtině v souladu s nasazenou strategií a briefem.

Pro každý návrh uveď:
- hook: poutavá úvodní věta
- body: hlavní text příspěvku
- cta: výzva k akci
- hashtags: pole 3–5 relevantních hashtagů (včetně #)
- visual_brief: 2–4 věty popisující, jak by mohl vizuál vypadat (kompozice, barvy, prvky, nálada, styl)

Odpověz POUZE validním JSON polem s minimálně 5 objekty ve formátu:
{"hook": "...", "body": "...", "cta": "...", "hashtags": ["#a", "#b"], "visual_brief": "..."}`;

export async function generateProposalsWithAI(
  brief: Record<string, unknown>,
  strategistOutput: string | null,
  format: ProposalFormat
): Promise<ProposalItem[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error("OPENAI_API_KEY není nastaven");

  const openai = new OpenAI({ apiKey: openaiKey });
  const userPrompt = buildProposalPrompt(brief, strategistOutput, format);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  let parsed: ProposalItem[];
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in response");
    parsed = JSON.parse(jsonMatch[0]) as ProposalItem[];
  } catch {
    console.error("[proposal-generation] Parse error:", content);
    throw new Error("AI odpověď není validní JSON");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI vrátila prázdné pole návrhů");
  }

  const min = 5;
  return parsed.slice(0, 10).map((p) => ({
    hook: typeof p.hook === "string" ? p.hook : "",
    body: typeof p.body === "string" ? p.body : "",
    cta: typeof p.cta === "string" ? p.cta : "",
    hashtags: Array.isArray(p.hashtags) ? p.hashtags.filter((t) => typeof t === "string") : [],
    visual_brief: typeof p.visual_brief === "string" ? p.visual_brief : "",
  }));
}
