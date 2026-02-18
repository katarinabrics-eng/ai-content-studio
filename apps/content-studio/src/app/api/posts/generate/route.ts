import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getIntakeByIdOrLast, readPostDrafts, writePostDrafts } from "@/lib/posts-data";
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

    const intake = getIntakeByIdOrLast(intakeId);
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

    let raw: { drafts?: unknown[] };
    try {
      raw = JSON.parse(content) as { drafts?: unknown[] };
    } catch {
      return NextResponse.json(
        { ok: false, error: "Neplatná JSON odpověď od AI" },
        { status: 500 }
      );
    }

    const draftsRaw = Array.isArray(raw.drafts) ? raw.drafts.slice(0, DRAFT_COUNT) : [];
    const now = new Date().toISOString();
    const stored: StoredPostDraft[] = draftsRaw.map((item) => {
      const obj = typeof item === "object" && item != null ? (item as Record<string, unknown>) : {};
      const normalized = normalizeDraft(obj);
      return {
        ...normalized,
        id: crypto.randomUUID(),
        intakeId: intake.id,
        createdAt: now,
      } as StoredPostDraft;
    });

    while (stored.length < DRAFT_COUNT) {
      stored.push({
        platform: "instagram",
        angle: "",
        hook: "",
        caption: "",
        cta: "",
        hashtags: [],
        visualBrief: "",
        status: "draft",
        id: crypto.randomUUID(),
        intakeId: intake.id,
        createdAt: now,
      });
    }

    const allDrafts = readPostDrafts();
    const toSave = [...allDrafts, ...stored];
    writePostDrafts(toSave);

    return NextResponse.json({
      ok: true,
      intakeId: intake.id,
      drafts: stored.slice(0, DRAFT_COUNT),
    });
  } catch (e) {
    console.error("POST /api/posts/generate", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Došlo k chybě serveru" },
      { status: 500 }
    );
  }
}
