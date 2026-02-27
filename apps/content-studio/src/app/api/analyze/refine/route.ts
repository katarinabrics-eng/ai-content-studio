import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ANTHROPIC_BASE = "https://api.anthropic.com/v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url : "";
    const brandDna = body?.brandDna ?? {};
    const answers = body?.answers ?? {};
    if (!url) {
      return NextResponse.json({ error: "Chybí URL." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY není nastaven." }, { status: 500 });

    const answersStr = Object.entries(answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: `Zpřesni Brand DNA. Web: ${url}\nPůvodní brandDna:\n${JSON.stringify(brandDna)}\nOdpovědi klienta:\n${answersStr}\n\nVrať POUZE validní JSON ve stejném formátu jako vstup: { "brandScore": { "total": <zvýšené o 15-25>, ... }, "brandDna": { ... }, "summary": "..." }. Zvyš total o 15-25 bodů.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message || `Claude error ${res.status}`);
    }

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.find((b) => b.type === "text")?.text ?? "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Neplatná odpověď AI." }, { status: 500 });
    const result = JSON.parse(match[0]) as Record<string, unknown>;
    return NextResponse.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Nepodařilo se doplnit DNA.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
