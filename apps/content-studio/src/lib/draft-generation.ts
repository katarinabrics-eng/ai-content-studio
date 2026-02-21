/**
 * Sdílená logika pro generování draftů AI.
 * Používá se v /api/admin/projects/[id]/drafts a /api/admin/projects/[id]/trigger-ai.
 */

import OpenAI from "openai";
import { getSupabaseClient } from "./supabase-server";

export type PostDraft = {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  platform: string;
};

function buildUserPrompt(brief: Record<string, unknown>, instruction?: string): string {
  const parts = [
    `Značka: ${brief.brand_name ?? "—"}`,
    `Obor: ${brief.industry ?? "—"}`,
    `Cíl komunikace: ${brief.communication_goal ?? "—"}`,
    `Tón: ${brief.tone_of_voice ?? "profesionální"}`,
    `Platforma: ${Array.isArray(brief.platforms) ? brief.platforms.join(", ") : brief.platforms ?? "instagram"}`,
    `Cílová skupina: ${brief.target_audience ?? "—"}`,
    `Nabídky/produkty: ${brief.offers ?? "—"}`,
    `Preferované CTA: ${brief.preferred_cta ?? "—"}`,
    `Zakázaná slova: ${brief.forbidden_words ?? "žádná"}`,
    `Poznámka: ${brief.note ?? "—"}`,
  ];
  if (instruction?.trim()) {
    parts.push(`\nDodatečný pokyn od admina: ${instruction.trim()}`);
  }
  return parts.join("\n") + "\n\nVytvoř 3 různé návrhy příspěvků.";
}

export async function generateDraftsWithAI(
  brief: Record<string, unknown>,
  instruction?: string
): Promise<PostDraft[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error("OPENAI_API_KEY není nastaven");
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const userPrompt = buildUserPrompt(brief, instruction);

  const SYSTEM_PROMPT = `Jsi profesionální copywriter pro sociální sítě. Vytváříš krátké, poutavé příspěvky v češtině.

Tvoje úloha:
1. Vytvořit 3 různé návrhy příspěvků pro danou značku
2. Každý návrh obsahuje: hook (úvodní věta), body (hlavní text), cta (výzva k akci), hashtags (3-5 relevantních hashtagů)
3. Respektuj tón komunikace klienta
4. Nepoužívej zakázaná slova
5. Přizpůsob délku a styl dané platformě

Odpověz POUZE validním JSON polem s 3 objekty, každý ve formátu:
{"hook": "...", "body": "...", "cta": "...", "hashtags": ["#tag1", "#tag2"], "platform": "..."}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  let parsed: PostDraft[];
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }
    parsed = JSON.parse(jsonMatch[0]) as PostDraft[];
  } catch {
    console.error("[draft-generation] Failed to parse AI response:", content);
    throw new Error("AI odpověď není validní JSON");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI vrátila prázdné pole návrhů");
  }

  const platform = Array.isArray(brief.platforms) ? brief.platforms[0] : "instagram";
  return parsed.slice(0, 3).map((d) => ({
    hook: d.hook ?? "",
    body: d.body ?? "",
    cta: d.cta ?? "",
    hashtags: Array.isArray(d.hashtags) ? d.hashtags : [],
    platform: d.platform ?? platform ?? "instagram",
  }));
}

export async function runDraftGeneration(
  projectId: string,
  options?: { instruction?: string; targetStatus?: string }
): Promise<{ ok: true; drafts: PostDraft[] } | { ok: false; error: string }> {
  const supabase = getSupabaseClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, status, project_brief(*)")
    .eq("id", projectId)
    .single();

  if (!project) {
    return { ok: false, error: "Projekt nenalezen" };
  }

  const briefData = Array.isArray(project.project_brief)
    ? project.project_brief[0]
    : project.project_brief;

  if (!briefData) {
    return { ok: false, error: "Brief nenalezen" };
  }

  const drafts = await generateDraftsWithAI(
    briefData as Record<string, unknown>,
    options?.instruction
  );

  await supabase.from("project_drafts").delete().eq("project_id", projectId);

  const insertRows = drafts.map((d, i) => ({
    project_id: projectId,
    draft_index: i + 1,
    hook: d.hook,
    body: d.body,
    cta: d.cta,
    hashtags: d.hashtags,
    platform: d.platform,
    status: "draft",
  }));

  const { error: insertError } = await supabase
    .from("project_drafts")
    .insert(insertRows)
    .select();

  if (insertError) {
    console.error("[draft-generation] Insert error:", insertError);
    return {
      ok: true,
      drafts,
    };
  }

  const targetStatus = options?.targetStatus ?? "IN_PRODUCTION";
  await supabase
    .from("projects")
    .update({ status: targetStatus, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return { ok: true, drafts };
}
