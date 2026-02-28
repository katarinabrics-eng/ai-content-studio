import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-4.1";

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

/** Extract plain text from v2 Responses API response (output_text or output[].content[].text). */
function getOutputTextFromResponsesApi(data: unknown): string {
  if (data == null) return "No output received";
  const d = data as Record<string, unknown>;
  if (typeof d.output_text === "string") return d.output_text.trim();
  const output = d.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const content = (item as Record<string, unknown>)?.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          const p = part as Record<string, unknown>;
          if ((p.type === "output_text" || p.type === "text") && typeof p.text === "string")
            return (p.text as string).trim();
        }
      }
      if (typeof (item as Record<string, unknown>).text === "string")
        return ((item as Record<string, unknown>).text as string).trim();
    }
  }
  return "No output received";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
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

    const input = buildAnalyzeInput(scraped);

    const requestBody = {
      model: OPENAI_MODEL,
      input,
    };

    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = (data as { error?: { message?: string } }).error?.message ?? (data as { error?: string }).error ?? `OpenAI error ${response.status}`;
      return NextResponse.json({ error: errMsg }, { status: response.status >= 500 ? 500 : 400 });
    }

    const outputText = getOutputTextFromResponsesApi(data);

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
    const message = e instanceof Error ? e.message : "Nepodařilo se analyzovat web.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
