import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4.1";
const FETCH_TIMEOUT_MS = 55_000;

function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

type Scraped = {
  markdown: string;
  screenshot: string | null;
  url: string;
  title?: string;
  description?: string;
};

async function scrapeWithFirecrawl(url: string, apiKey: string): Promise<Scraped> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetchWithTimeout(
    `${FIRECRAWL_BASE}/scrape`,
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url: normalized,
      formats: ["markdown", { type: "screenshot" }],
      onlyMainContent: true,
      waitFor: 2000,
    }),
  },
    FETCH_TIMEOUT_MS
  );

  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { error?: string; message?: string; param?: string };
    const msg = e?.message ?? e?.error ?? `Firecrawl error ${res.status}`;
    if (process.env.NODE_ENV !== "production") {
      console.error("[analyze] Firecrawl error:", { message: msg, param: e?.param });
    }
    throw new Error(msg);
  }

  const data = await res.json();
  if (!(data as { success?: boolean }).success) {
    throw new Error((data as { error?: string }).error || "Nepodařilo se načíst web");
  }

  const d = (data as {
    data?: {
      markdown?: string;
      screenshot?: string;
      metadata?: { title?: string | string[]; description?: string | string[] };
    };
  }).data;
  const meta = d?.metadata;
  const title = meta?.title == null ? undefined : Array.isArray(meta.title) ? meta.title[0] : meta.title;
  const description = meta?.description == null ? undefined : Array.isArray(meta.description) ? meta.description[0] : meta.description;
  return {
    markdown: d?.markdown ?? "",
    screenshot: d?.screenshot ?? null,
    url: normalized,
    title,
    description,
  };
}

function buildAnalyzeInput(scraped: Scraped): string {
  const textContent = scraped.markdown.slice(0, 7000);
  return `Analyzuj následující web na základě jeho skutečného obsahu.

URL: ${scraped.url}
Název: ${scraped.title ?? ""}
Meta popis: ${scraped.description ?? ""}

OBSAH WEBU (markdown):
---
${textContent}
---

Vrať čistý text (ne JSON), oddělené sekce:

1. Shrnutí positioning – jak se web/služba prezentuje, hlavní sdělení.
2. Cílovou skupinu – komu je nabídka určena (pokud je z obsahu zřejmá).
3. Silné stránky – co web dělá dobře z hlediska brandu a komunikace.
4. Slabiny – co chybí nebo co by šlo zlepšit.
5. Doporučení dalšího kroku – konkrétní návrh, kam směřovat (např. vizuální identita, obsah, CTA).`;
}

function buildDiagnostikaPrompt(scraped: Scraped): string {
  const textContent = scraped.markdown.slice(0, 7000);
  return `Analyzuj tento web a vrať POUZE jeden validní JSON objekt (žádný text před/za ním).

URL: ${scraped.url}
Název: ${scraped.title ?? ""}
Meta popis: ${scraped.description ?? ""}

OBSAH WEBU (markdown):
---
${textContent}
---

JSON musí mít přesně tento tvar (boolean u has* znamená true/false podle toho, zda to na webu je):
{
  "brandScore": {
    "total": <číslo 0-100, celkové skóre síly brandu>,
    "hasHeadline": true/false,
    "hasOffer": true/false,
    "hasTargetAudience": true/false,
    "hasCTA": true/false,
    "hasVisualIdentity": true/false,
    "hasSocialProof": true/false
  },
  "brandDna": {
    "name": "string nebo null",
    "positioning": "string nebo null",
    "tone": "string nebo null",
    "targetAudience": "string nebo null",
    "communicationStyle": "string nebo null",
    "uniqueValue": "string nebo null",
    "contentPillars": ["string"] nebo [],
    "missingElements": ["string"] nebo [],
    "visualStyle": { "primaryColor": "#hex", "secondaryColor": "#hex", "mood": "string", "typography": "string" } nebo null
  },
  "summary": "Krátké shrnutí od stratéga – 2–4 věty."
}`;
}

/** Extract plain text from Chat Completions response. */
function getTextFromChatResponse(data: unknown): string {
  if (data == null) return "No output received";
  const d = data as { choices?: Array<{ message?: { content?: string } }> };
  const text = d.choices?.[0]?.message?.content?.trim();
  return text ?? "No output received";
}

function parseDiagnostikaResult(raw: string): Record<string, unknown> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI nevrátilo platný JSON");
  return JSON.parse(match[0]) as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Neplatný JSON v těle požadavku." }, { status: 400 });
    }
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const formatDiagnostika = body?.format === "diagnostika";
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!firecrawlKey) return NextResponse.json({ error: "FIRECRAWL_API_KEY není nastaven." }, { status: 500 });
    if (!openaiKey) return NextResponse.json({ error: "OPENAI_API_KEY není nastaven." }, { status: 500 });

    const scraped = await scrapeWithFirecrawl(url, firecrawlKey);
    if (!scraped.markdown && !scraped.screenshot) {
      return NextResponse.json({ error: "Web nevrátil žádný obsah." }, { status: 422 });
    }

    const prompt = formatDiagnostika ? buildDiagnostikaPrompt(scraped) : buildAnalyzeInput(scraped);

    const response = await fetchWithTimeout(
      OPENAI_CHAT_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: formatDiagnostika ? 2500 : 2000,
        }),
      },
      FETCH_TIMEOUT_MS
    );

    const data = await response.json();

    if (!response.ok) {
      const err = (data as { error?: { message?: string; param?: string } }).error;
      const errMsg = err?.message ?? (data as { error?: string }).error ?? `OpenAI error ${response.status}`;
      if (process.env.NODE_ENV !== "production") {
        console.error("[analyze] OpenAI error:", { message: errMsg, param: err?.param });
      }
      return NextResponse.json({ error: errMsg }, { status: response.status >= 500 ? 500 : 400 });
    }

    const outputText = getTextFromChatResponse(data);

    if (formatDiagnostika) {
      try {
        const result = parseDiagnostikaResult(outputText);
        return NextResponse.json({
          result: { brandScore: result.brandScore, brandDna: result.brandDna, summary: result.summary },
          scraped: {
            markdown: scraped.markdown,
            screenshot: scraped.screenshot,
            url: scraped.url,
            title: scraped.title,
            description: scraped.description,
          },
        });
      } catch {
        return NextResponse.json({ error: "AI nevrátilo platnou Brand DNA (JSON). Zkuste to znovu." }, { status: 500 });
      }
    }

    return NextResponse.json({
      result: outputText,
      scraped: {
        markdown: scraped.markdown,
        screenshot: scraped.screenshot,
        url: scraped.url,
        title: scraped.title,
        description: scraped.description,
      },
    });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Nepodařilo se analyzovat web.";
    const message =
      raw.includes("abort") || (e instanceof Error && e.name === "AbortError")
        ? "Požadavek vypršel (timeout). Zkuste to znovu."
        : raw;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
