/**
 * brand-context.ts
 * Sestaví kontext značky z client_projects záznamu.
 * Používá se při generování RTG obsahu.
 */

import { getSupabaseClient } from "@/lib/supabase-server";

export type BrandContext = {
  project_id: string;
  client_name: string;
  web_url: string | null;
  topics: string[];
  plan: string;
  tone_of_voice: string;
  color_palette: string[];
  visual_style: string;
  brand_one_liner: string;
  platform: "instagram";
};

export async function buildBrandContext(project_id: string): Promise<BrandContext | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("client_projects")
    .select("id, client_name, email, web_url, topics, plan, scan_result")
    .eq("id", project_id)
    .single();

  if (error || !data) {
    console.error("[brand-context] Projekt nenalezen:", project_id);
    return null;
  }

  const p = data as {
    id: string;
    client_name: string | null;
    email: string | null;
    web_url: string | null;
    topics: string[] | null;
    plan: string | null;
    scan_result: Record<string, unknown> | null;
  };

  // Vyber data ze scan_result pokud existuje
  const scan = p.scan_result ?? {};
  const scanColors = parseColors(scan.colors ?? scan.color_palette ?? scan.palette);
  const scanTone = parseString(scan.tone_of_voice ?? scan.toneOfVoice ?? scan.tone);
  const scanStyle = parseString(scan.visual_style ?? scan.visualStyle ?? scan.style);
  const scanOneLiner = parseString(scan.brand_one_liner ?? scan.oneLiner ?? scan.brand_core ?? scan.tagline);

  return {
    project_id: p.id,
    client_name: p.client_name ?? p.email ?? "Klient",
    web_url: p.web_url ?? null,
    topics: Array.isArray(p.topics) ? p.topics : [],
    plan: p.plan ?? "start",
    tone_of_voice: scanTone || "přátelský, autentický, inspirativní",
    color_palette: scanColors.length > 0 ? scanColors : ["#d0ec78", "#111111", "#ffffff"],
    visual_style: scanStyle || "minimalistický, čistý, moderní",
    brand_one_liner: scanOneLiner || (p.client_name ? `Značka ${p.client_name}` : "Autentická značka"),
    platform: "instagram",
  };
}

function parseColors(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseString(raw: unknown): string {
  if (typeof raw === "string") return raw.trim();
  return "";
}

// ── System prompts ────────────────────────────────────────────────────────────

export function buildTextAgentSystemPrompt(ctx: BrandContext): string {
  const topicsLine = ctx.topics.length > 0
    ? `Témata značky: ${ctx.topics.join(", ")}.`
    : "";
  return `Jsi expert na social media obsah pro Instagram.
Tvoříš obsah pro značku: ${ctx.client_name}.
${ctx.brand_one_liner ? `Jednovětový popis značky: ${ctx.brand_one_liner}` : ""}
Tón komunikace: ${ctx.tone_of_voice}.
${topicsLine}
Platforma: Instagram.
Psal/a by sis v češtině nebo slovenštině podle kontextu — výchozí jazyk je čeština.
Hooky musí být stručné, přímé a zajímavé — max 15 slov.
Body text max 3 věty. CTA krátká výzva.
Varianty A a B musí být odlišné — jiný úhel pohledu, jiný styl hookingu.`.trim();
}

export function buildImageAgentSystemPrompt(ctx: BrandContext): string {
  return `Photography and design style: ${ctx.visual_style}. Brand colors: ${ctx.color_palette.join(", ")}. Clean, minimal aesthetic suitable for Instagram feed. Professional quality.`;
}
