import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const REFINE_MODEL = "gpt-4o-mini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url : "";
    const brandDna = body?.brandDna ?? {};
    const answers = body?.answers ?? {};
    if (!url) {
      return NextResponse.json({ error: "Chybí URL." }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ error: "OPENAI_API_KEY není nastaven." }, { status: 500 });

    const answersStr = Object.entries(answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
      model: REFINE_MODEL,
      messages: [
        {
          role: "user",
          content: `Zpřesni Brand DNA. Web: ${url}\nPůvodní brandDna:\n${JSON.stringify(brandDna)}\nOdpovědi klienta:\n${answersStr}\n\nVrať POUZE validní JSON ve stejném formátu jako vstup: { "brandScore": { "total": <zvýšené o 15-25>, "hasHeadline", "hasOffer", "hasTargetAudience", "hasCTA", "hasVisualIdentity", "hasSocialProof" }, "brandDna": { ... stejná pole ... }, "summary": "..." }. Zvyš total o 15-25 bodů.`,
        },
      ],
      max_tokens: 1200,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() ?? "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Neplatná odpověď AI." }, { status: 500 });
    const result = JSON.parse(match[0]) as Record<string, unknown>;
    return NextResponse.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Nepodařilo se doplnit DNA.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
