import { NextResponse } from "next/server";
import OpenAI from "openai";
import { visualStyleProfileSchema, type VisualStyleProfile } from "@/lib/visual-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VISION_MODEL = "gpt-4o";

export async function POST(request: Request) {
  try {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Neplatné JSON tělo požadavku" },
        { status: 400 }
      );
    }
    const refs = (body as { referenceImageUrls?: unknown }).referenceImageUrls;
    const urls = Array.isArray(refs) ? refs.filter((u): u is string => typeof u === "string").slice(0, 5) : [];
    if (urls.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Chybí referenceImageUrls (pole URL)" },
        { status: 400 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY není nastaven" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Analyzuj tyto referenční obrázky a vytvoř Brand Visual DNA profil.
Vrať POUZE validní JSON bez markdownu:
{
  "styleName": "název stylu",
  "palette": ["#hex1", "#hex2", "..."],
  "typographyTone": "popis typografie",
  "compositionRules": ["pravidlo1", "pravidlo2"],
  "doNotUse": ["co se nemá používat"],
  "referenceImageUrls": []
}
Pravidla: žádný text v obraze, žádné vodoznaky, čistá kompozice.`,
      },
      ...urls.map((url) => ({ type: "image_url" as const, image_url: { url } })),
    ];

    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [{ role: "user", content }],
      max_tokens: 800,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { ok: false, error: "LLM nevrátilo validní JSON" },
        { status: 500 }
      );
    }

    const obj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    const result = visualStyleProfileSchema.safeParse({ ...obj, referenceImageUrls: urls });
    const visualStyleProfile: VisualStyleProfile = result.success
      ? result.data
      : {
          styleName: obj.styleName as string | undefined,
          palette: obj.palette as string[] | undefined,
          typographyTone: obj.typographyTone as string | undefined,
          compositionRules: obj.compositionRules as string[] | undefined,
          doNotUse: obj.doNotUse as string[] | undefined,
          referenceImageUrls: urls,
        };

    return NextResponse.json({ ok: true, visualStyleProfile });
  } catch (e) {
    console.error("POST /api/visuals/style-profile", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
