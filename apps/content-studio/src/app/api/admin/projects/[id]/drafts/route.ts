import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PostDraft = {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  platform: string;
};

type DraftRow = {
  id: string;
  project_id: string;
  draft_index: number;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  platform: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const SYSTEM_PROMPT = `Jsi profesionální copywriter pro sociální sítě. Vytváříš krátké, poutavé příspěvky v češtině.

Tvoje úloha:
1. Vytvořit 3 různé návrhy příspěvků pro danou značku
2. Každý návrh obsahuje: hook (úvodní věta), body (hlavní text), cta (výzva k akci), hashtags (3-5 relevantních hashtagů)
3. Respektuj tón komunikace klienta
4. Nepoužívej zakázaná slova
5. Přizpůsob délku a styl dané platformě

Odpověz POUZE validním JSON polem s 3 objekty, každý ve formátu:
{"hook": "...", "body": "...", "cta": "...", "hashtags": ["#tag1", "#tag2"], "platform": "..."}`;

function buildUserPrompt(brief: Record<string, unknown>): string {
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
  return parts.join("\n") + "\n\nVytvoř 3 různé návrhy příspěvků.";
}

async function generateDraftsWithAI(brief: Record<string, unknown>): Promise<PostDraft[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error("OPENAI_API_KEY není nastaven");
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const userPrompt = buildUserPrompt(brief);

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
    console.error("[drafts] Failed to parse AI response:", content);
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const supabase = getSupabaseClient();

    const { data: drafts, error } = await supabase
      .from("project_drafts")
      .select("*")
      .eq("project_id", projectId)
      .order("draft_index", { ascending: true });

    if (error) {
      console.error("[drafts GET]", error);
    }

    return NextResponse.json({
      ok: true,
      drafts: (drafts ?? []) as DraftRow[],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[drafts GET]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const supabase = getSupabaseClient();

    const { data: project } = await supabase
      .from("projects")
      .select("id, status, project_brief(*)")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const briefData = Array.isArray(project.project_brief) 
      ? project.project_brief[0] 
      : project.project_brief;

    if (!briefData) {
      return NextResponse.json({ ok: false, error: "Brief nenalezen" }, { status: 404 });
    }

    const drafts = await generateDraftsWithAI(briefData as Record<string, unknown>);

    await supabase
      .from("project_drafts")
      .delete()
      .eq("project_id", projectId);

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

    const { data: inserted, error: insertError } = await supabase
      .from("project_drafts")
      .insert(insertRows)
      .select();

    if (insertError) {
      console.error("[drafts POST insert]", insertError);
      return NextResponse.json({
        ok: true,
        drafts,
        stored: false,
        warning: "Návrhy vygenerovány, ale nepodařilo se uložit do DB (tabulka project_drafts možná neexistuje)",
      });
    }

    await supabase
      .from("projects")
      .update({ status: "IN_PRODUCTION", updated_at: new Date().toISOString() })
      .eq("id", projectId);

    return NextResponse.json({
      ok: true,
      drafts: inserted ?? drafts,
      stored: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[drafts POST]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const body = await request.json().catch(() => ({}));
    const action = (body as { action?: string }).action;

    if (action === "mark_ready") {
      const supabase = getSupabaseClient();
      
      await supabase
        .from("project_drafts")
        .update({ status: "ready", updated_at: new Date().toISOString() })
        .eq("project_id", projectId);

      await supabase
        .from("projects")
        .update({ status: "DRAFT_READY", updated_at: new Date().toISOString() })
        .eq("id", projectId);

      return NextResponse.json({ ok: true, message: "Návrhy označeny jako připravené pro klienta" });
    }

    return NextResponse.json({ ok: false, error: "Neznámá akce" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[drafts PATCH]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
