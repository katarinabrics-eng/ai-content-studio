import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";
const ANTHROPIC_BASE = "https://api.anthropic.com/v1";

type Scraped = {
  markdown: string;
  screenshot: string | null;
  url: string;
  title?: string;
  description?: string;
};

async function scrapeWithFirecrawl(url: string, apiKey: string): Promise<Scraped> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url: normalized,
      formats: ["markdown", "screenshot"],
      onlyMainContent: true,
      waitFor: 2000,
      screenshot: true,
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as { error?: string }).error || `Firecrawl error ${res.status}`);
  }

  const data = await res.json();
  if (!(data as { success?: boolean }).success) {
    throw new Error((data as { error?: string }).error || "Nepodařilo se načíst web");
  }

  const d = (data as { data?: { markdown?: string; screenshot?: string; metadata?: { title?: string; description?: string } } }).data;
  return {
    markdown: d?.markdown ?? "",
    screenshot: d?.screenshot ?? null,
    url: normalized,
    title: d?.metadata?.title,
    description: d?.metadata?.description,
  };
}

function buildAnalyzePrompt(scraped: Scraped): { type: "text"; text: string } {
  const textContent = scraped.markdown.slice(0, 7000);
  return {
    type: "text",
    text: `Jsi expertní brand stratég. Analyzuj web na základě SKUTEČNÉHO obsahu a vizuálu.

URL: ${scraped.url}
Title: ${scraped.title ?? ""}
Meta description: ${scraped.description ?? ""}

OBSAH WEBU (markdown):
---
${textContent}
---

DŮLEŽITÉ: Vycházej VÝHRADNĚ z tohoto obsahu${scraped.screenshot ? " a screenshotu výše" : ""}. Nevymýšlej nic co tam není.

${scraped.screenshot ? "Na základě screenshotu urči přesné barvy CI (HEX), typografický styl a celkový vizuální dojem." : ""}

Vrať POUZE validní JSON (bez \`\`\`):
{
  "brandScore": {
    "total": <0-100>,
    "hasHeadline": <bool>,
    "hasOffer": <bool>,
    "hasTargetAudience": <bool>,
    "hasCTA": <bool>,
    "hasVisualIdentity": <bool>,
    "hasSocialProof": <bool>
  },
  "brandDna": {
    "name": "<název z webu>",
    "positioning": "<jak se skutečně prezentují, 1-2 věty>",
    "tone": "<skutečný tón komunikace>",
    "targetAudience": "<komu skutečně cílí>",
    "communicationStyle": "<educational|sales|storytelling|motivational|mixed>",
    "contentPillars": ["<téma1>", "<téma2>", "<téma3>"],
    "uniqueValue": "<co nabízí unikátního>",
    "missingElements": ["<co chybí pro silný brand>"],
    "visualStyle": {
      "primaryColor": "<HEX hlavní barvy>",
      "secondaryColor": "<HEX sekundární barvy>",
      "mood": "<popis vizuálního dojmu webu>",
      "typography": "<popis typografie>"
    }
  },
  "summary": "<2-3 věty hodnocení jako brand stratég, konkrétní a upřímné>"
}`,
  };
}

async function analyzeWithClaude(scraped: Scraped, apiKey: string): Promise<Record<string, unknown>> {
  const userContent: Array<{ type: string; source?: { type: string; media_type: string; data: string }; text?: string }> = [];

  if (scraped.screenshot) {
    let base64 = scraped.screenshot;
    let mediaType = "image/png";
    if (base64.startsWith("data:")) {
      const parts = base64.split(",");
      base64 = parts[1] ?? base64;
      const header = parts[0] ?? "";
      mediaType = header.split(":")[1]?.split(";")[0] ?? "image/png";
    }
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data: base64 },
    });
    userContent.push({
      type: "text",
      text: "Výše vidíš screenshot webu. Analyzuj VIZUÁLNÍ styl: barvy, typografii, layout, celkový dojem.",
    });
  }

  userContent.push(buildAnalyzePrompt(scraped));

  const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1800,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `Claude error ${res.status}`);
  }

  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = data.content?.find((b) => b.type === "text")?.text ?? "{}";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI vrátila neplatnou odpověď");
  return JSON.parse(match[0]) as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!url) {
      return NextResponse.json({ error: "Chybí URL webu." }, { status: 400 });
    }

    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!firecrawlKey) return NextResponse.json({ error: "FIRECRAWL_API_KEY není nastaven." }, { status: 500 });
    if (!anthropicKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY není nastaven." }, { status: 500 });

    const scraped = await scrapeWithFirecrawl(url, firecrawlKey);
    if (!scraped.markdown && !scraped.screenshot) {
      return NextResponse.json({ error: "Web nevrátil žádný obsah." }, { status: 422 });
    }

    const result = await analyzeWithClaude(scraped, anthropicKey);

    return NextResponse.json({
      scraped: {
        markdown: scraped.markdown,
        screenshot: scraped.screenshot,
        url: scraped.url,
        title: scraped.title,
        description: scraped.description,
      },
      result,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Nepodařilo se analyzovat web.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
