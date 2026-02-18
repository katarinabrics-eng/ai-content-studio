import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getIntakeByIdOrLast } from "@/lib/supabase-intake";
import { insertPostDrafts } from "@/lib/supabase-posts";
import { generateRequestSchema, postDraftSchema, type PostDraft, type StoredPostDraft } from "@/lib/posts-schema";

export const runtime = "nodejs";

const DRAFT_COUNT = 3;

const SYSTEM_PROMPT = `Jsi copywriter. Na základě intake (značka, cílová skupina, nabídky, tón, cíle) vygeneruj přesně 3 návrhy sociálních postů.
Vrať POUZE validní JSON bez markdownu:
{
  "drafts": [
    {
      "platform": "instagram" | "facebook" | "linkedin",
      "angle": "úhel / hlavní myšlenka postu",
      "hook": "úvodní věta která chytí pozornost",
      "caption": "hlavní text postu",
      "cta": "výzva k akci",
      "hashtags": ["#tag1", "#tag2"],
      "visualBrief": "krátký popis vizuálu / obrázku",
      "status": "draft"
    }
  ]
}
Každý draft musí mít platform, angle, hook, caption, cta, hashtags (pole), visualBrief, status "draft".`;

function normalizeDraft(raw: Record<string, unknown>): PostDraft {
  const parsed = postDraftSchema.safeParse({
    platform: raw.platform ?? "instagram",
    angle: raw.angle ?? "",
    hook: raw.hook ?? "",
    caption: raw.caption ?? "",
    cta: raw.cta ?? "",
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.map(String) : [],
    visualBrief: raw.visualBrief ?? "",
    status: "draft",
  });
  if (parsed.success) return parsed.data;
  return {
    platform: (raw.platform as PostDraft["platform"]) ?? "instagram",
    angle: String(raw.angle ?? ""),
    hook: String(raw.hook ?? ""),
    caption: String(raw.caption ?? ""),
    cta: String(raw.cta ?? ""),
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.map(String) : [],
    visualBrief: String(raw.visualBrief ?? ""),
    status: "draft",
  };
}

function toStoredDraft(row: { id: string; intake_id: string; created_at: string; payload: Record<string, unknown> }): StoredPostDraft {
  const p = row.payload;
  return {
    id: row.id,
    intakeId: row.intake_id,
    createdAt: row.created_at ?? new Date().toISOString(),
    platform: (p.platform as StoredPostDraft["platform"]) ?? "instagram",
    angle: String(p.angle ?? ""),
    hook: String(p.hook ?? ""),
    caption: String(p.caption ?? ""),
    cta: String(p.cta ?? ""),
    hashtags: Array.isArray(p.hashtags) ? p.hashtags.map(String) : [],
    visualBrief: String(p.visualBrief ?? ""),
    status: "draft",
    visualImageUrl: typeof p.visualImageUrl === "string" ? p.visualImageUrl : undefined,
    visualStatus: p.visualStatus as StoredPostDraft["visualStatus"] | undefined,
    visualPrompt: typeof p.visualPrompt === "string" ? p.visualPrompt : undefined,
    visualError: typeof p.visualError === "string" ? p.visualError : undefined,
    visualUpdatedAt: typeof p.visualUpdatedAt === "string" ? p.visualUpdatedAt : undefined,
  };
}

export async function POST(request: Request) {
  try {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // empty body ok
    }
    const parsed = generateRequestSchema.safeParse(body);
    const intakeId = parsed.success ? parsed.data.intakeId : undefined;
    const count = parsed.success ? Math.min(3, Math.max(1, parsed.data.count)) : DRAFT_COUNT;

    const intake = await getIntakeByIdOrLast(intakeId);
    if (!intake) {
      return NextResponse.json(
        { ok: false, error: "Žádný intake k dispozici. Nejdřív odešlete intake formulář." },
        { status: 404 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY není nastaven" },
        { status: 500 }
      );
    }

    const context = `
Značka: ${(intake as Record<string, unknown>).brandName ?? ""}
Odvětví: ${(intake as Record<string, unknown>).industry ?? ""}
Cílová skupina: ${(intake as Record<string, unknown>).targetAudience ?? ""}
Nabídky: ${(intake as Record<string, unknown>).offers ?? ""}
Tón: ${(intake as Record<string, unknown>).toneOfVoice ?? ""}
Cíl obsahu: ${(intake as Record<string, unknown>).contentGoal ?? ""}
Platformy: ${JSON.stringify((intake as Record<string, unknown>).platforms ?? [])}
Styl: ${(intake as Record<string, unknown>).stylePreference ?? ""}
CTA preference: ${(intake as Record<string, unknown>).ctaPreference ?? ""}
Zakázaná slova: ${(intake as Record<string, unknown>).forbiddenWords ?? ""}
`.trim();

    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Vygeneruj přesně ${count} návrhů postů.\n\nKontext intake:\n${context}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { ok: false, error: "AI nevrátilo odpověď" },
        { status: 500 }
      );
    }

    let parsedContent: { drafts?: unknown[] };
    try {
      parsedContent = JSON.parse(content) as { drafts?: unknown[] };
    } catch {
      return NextResponse.json(
        { ok: false, error: "Neplatná JSON odpověď od AI" },
        { status: 500 }
      );
    }

    const draftsRaw = Array.isArray(parsedContent.drafts) ? parsedContent.drafts.slice(0, DRAFT_COUNT) : [];
    const payloads: { payload: Record<string, unknown> }[] = [];

    for (const item of draftsRaw) {
      const obj = typeof item === "object" && item != null ? (item as Record<string, unknown>) : {};
      const normalized = normalizeDraft(obj);
      payloads.push({
        payload: {
          platform: normalized.platform,
          angle: normalized.angle,
          hook: normalized.hook,
          caption: normalized.caption,
          cta: normalized.cta,
          hashtags: normalized.hashtags,
          visualBrief: normalized.visualBrief,
          status: "draft",
        },
      });
    }

    while (payloads.length < DRAFT_COUNT) {
      payloads.push({
        payload: {
          platform: "instagram",
          angle: "",
          hook: "",
          caption: "",
          cta: "",
          hashtags: [],
          visualBrief: "",
          status: "draft",
        },
      });
    }

    const rows = await insertPostDrafts(intake.id, payloads);
    const stored = rows.map(toStoredDraft);

    return NextResponse.json({
      ok: true,
      intakeId: intake.id,
      drafts: stored.slice(0, DRAFT_COUNT),
    });
  } catch (e) {
    console.error("POST /api/posts/generate", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
