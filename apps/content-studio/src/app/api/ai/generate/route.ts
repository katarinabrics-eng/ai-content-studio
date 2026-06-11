import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type GeneratedPost = {
  hookType: string;
  hookLabel: string;
  headline: string;
  bodyText: string;
  cta: string;
  visualDirection: string;
  platform: "instagram" | "linkedin" | "oboje";
  adReady: boolean;
};

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

const DEFAULT_PROMPT = `Jsi expert na social media content pro české podnikatele.
Na základě Brand DNA značky vygeneruj přesně 5 různých příspěvků. Každý musí mít jiný hook typ z: [výsledek, problém, otázka, číslo, provokace].

Vrať POUZE validní JSON array (žádný markdown, žádný text před/za) s přesně 5 objekty v tomto tvaru:
[
  {
    "hookType": "výsledek",
    "hookLabel": "krátký popis typu hooku",
    "headline": "max 8 slov, silný hook",
    "bodyText": "2-3 věty, tón značky",
    "cta": "výzva k akci",
    "visualDirection": "popis vizuálu pro fotografa",
    "platform": "instagram",
    "adReady": false
  }
]
Povolené platformy: "instagram" | "linkedin" | "oboje".`;

function normalizePost(raw: unknown): GeneratedPost {
  const o = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    hookType: String(o.hookType ?? "výsledek"),
    hookLabel: String(o.hookLabel ?? ""),
    headline: String(o.headline ?? ""),
    bodyText: String(o.bodyText ?? ""),
    cta: String(o.cta ?? ""),
    visualDirection: String(o.visualDirection ?? ""),
    platform: o.platform === "linkedin" || o.platform === "oboje" ? o.platform : "instagram",
    adReady: Boolean(o.adReady),
  };
}

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    clientId?: string;
    brandDna?: Record<string, string>;
    pillars?: unknown[];
    score?: number;
    positioning?: string;
    contentTypes?: string[];
    prompt?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    // empty body ok
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY není nastaven" },
      { status: 500 }
    );
  }

  const brandContext =
    body.brandDna && typeof body.brandDna === "object"
      ? `Brand DNA: ${JSON.stringify(body.brandDna)}. `
      : "";
  const pillarsContext =
    Array.isArray(body.pillars) && body.pillars.length > 0
      ? `Pilíře: ${JSON.stringify(body.pillars.slice(0, 5))}. `
      : "";
  const scoreContext =
    typeof body.score === "number" ? `Skóre značky: ${body.score}. ` : "";
  const positioningContext =
    typeof body.positioning === "string" && body.positioning.trim()
      ? `Positioning: ${body.positioning}. `
      : "";

  const userPrompt =
    typeof body.prompt === "string" && body.prompt.trim()
      ? body.prompt.trim()
      : DEFAULT_PROMPT;

  const fullPrompt = `${brandContext}${pillarsContext}${scoreContext}${positioningContext}

${userPrompt}`;

  let output: string;
  try {
    const openai = new OpenAI({ apiKey: openaiKey });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Jsi expert na copywriting pro sociální sítě. Odpovídáš výhradně validním JSON (pole objektů), bez markdown bloků a bez doplňujícího textu.",
          },
          { role: "user", content: fullPrompt },
        ],
        max_tokens: 4096,
      },
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    output = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      return NextResponse.json(
        { error: "Vypršel časový limit. Zkuste to znovu." },
        { status: 408 }
      );
    }
    if (msg.includes("rate limit") || msg.includes("429")) {
      return NextResponse.json(
        { error: "Příliš mnoho požadavků. Počkejte chvíli." },
        { status: 429 }
      );
    }
    console.error("[api/ai/generate]", err);
    return NextResponse.json(
      { error: `Generování selhalo: ${msg.slice(0, 120)}` },
      { status: 500 }
    );
  }

  let parsed: unknown;
  const jsonMatch = output.match(/\[[\s\S]*\]/);
  const jsonStr = jsonMatch ? jsonMatch[0] : output;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return NextResponse.json(
      { error: "AI nevrátilo platný JSON. Zkuste to znovu." },
      { status: 500 }
    );
  }

  const arr = Array.isArray(parsed) ? parsed : [];
  const posts: GeneratedPost[] = arr.slice(0, 5).map(normalizePost);

  return NextResponse.json({ posts });
}
