import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { VisualScoreResult } from "@/lib/visual-score";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VISION_MODEL = "gpt-4o";
const MIN_ACCEPTABLE_SCORE = 8;

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
    const imageUrl = (body as { imageUrl?: unknown }).imageUrl;
    const imageB64 = (body as { imageB64?: unknown }).imageB64;
    if (typeof imageUrl !== "string" && typeof imageB64 !== "string") {
      return NextResponse.json(
        { ok: false, error: "Chybí imageUrl nebo imageB64" },
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
    const imageUrlForContent: string =
      typeof imageB64 === "string" ? `data:image/png;base64,${imageB64}` : (imageUrl as string);
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Ohodnoť tento reklamní vizuál (1-10) pro: brandFit, readability, composition, conversionClarity. Vrať JSON: {"brandFit":N,"readability":N,"composition":N,"conversionClarity":N}`,
      },
      { type: "image_url", image_url: { url: imageUrlForContent } },
    ];

    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [{ role: "user", content }],
      max_tokens: 200,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    let parsed: Record<string, number>;
    try {
      parsed = JSON.parse(jsonStr) as Record<string, number>;
    } catch {
      return NextResponse.json(
        { ok: false, error: "LLM nevrátilo validní JSON" },
        { status: 500 }
      );
    }

    const brandFit = Math.min(10, Math.max(0, Number(parsed.brandFit) || 5));
    const readability = Math.min(10, Math.max(0, Number(parsed.readability) || 5));
    const composition = Math.min(10, Math.max(0, Number(parsed.composition) || 5));
    const conversionClarity = Math.min(10, Math.max(0, Number(parsed.conversionClarity) || 5));
    const overall = Math.round((brandFit + readability + composition + conversionClarity) / 4);

    const result: VisualScoreResult = {
      brandFit,
      readability,
      composition,
      conversionClarity,
      overall,
      passed: overall >= MIN_ACCEPTABLE_SCORE,
    };

    return NextResponse.json({ ok: true, score: result });
  } catch (e) {
    console.error("POST /api/visuals/score", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
