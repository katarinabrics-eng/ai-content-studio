import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

const PILLAR_ANALYSIS_SCHEMA = `
  "pillarAnalysis": {
    "light": { "score": 0-10, "interpretation": "3-4 věty pro veřejnou část: stručně a profesionálně, co značka v tomto pilíři dělá a co jí chybí.", "observed": ["konkrétní nález 1"], "notObserved": ["co chybí 1"], "reasoning": "Proč to ovlivnilo skóre – 2-4 věty.", "strategicOpportunity": "jedna věta" },
    "energy": { "score": 0-10, "interpretation": "", "observed": [], "notObserved": [], "reasoning": "", "strategicOpportunity": "" },
    "architecture": { "score": 0-10, "interpretation": "", "observed": [], "notObserved": [], "reasoning": "", "strategicOpportunity": "" },
    "identity": { "score": 0-10, "interpretation": "", "observed": [], "notObserved": [], "reasoning": "", "strategicOpportunity": "" },
    "trust": { "score": 0-10, "interpretation": "", "observed": [], "notObserved": [], "reasoning": "", "strategicOpportunity": "" }
  }
`;

const DIAGNOSTIKA_METHODOLOGY = `
METODIKA:
- interpretation = 3-4 věty pro veřejnou část scanu: stručné, jasné, profesionální. Bez žargonu. Co v pilíři značka dělá a co jí chybí.
- observed = co jsi na webu/textu konkrétně zaznamenal (položky pro rozbalovací sekci "Co jsme zaznamenali").
- notObserved = co jsi nezaznamenal, ale v tomto pilíři by to bylo relevantní (pro "Co jsme nezaznamenali").
- reasoning = proč to ovlivnilo skóre – pro rozbalovací sekci "Jak jsme hodnotili".
- DŮVĚRA: Sekce s ukázkami realizací bez citace klienta nebo výsledku = portfolio, ne plnohodnotný sociální důkaz. V reasoning rozliš portfolio vs. reference vs. case study.
- Piš jako strategický kurátor: vzdělávej, ne jen hodnot.
`;

function buildDiagnostikaPromptFromText(sourceContent: string): string {
  const text = sourceContent.slice(0, 12000);
  return `Analyzuj zadané podklady o značce a vrať POUZE jeden validní JSON objekt (žádný text před/za ním).

OBSAH (zadaný text nebo extrahovaný z dokumentu):
---
${text}
---
${DIAGNOSTIKA_METHODOLOGY}

JSON musí mít přesně tento tvar:
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
  "summary": "Krátké shrnutí od stratéga – 2–4 věty.",
  ${PILLAR_ANALYSIS_SCHEMA.trim()}
}`;
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
${DIAGNOSTIKA_METHODOLOGY}

JSON musí mít přesně tento tvar:
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
  "summary": "Krátké shrnutí od stratéga – 2–4 věty.",
  ${PILLAR_ANALYSIS_SCHEMA.trim()}
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
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const manualData = typeof body?.manualData === "string" ? body.manualData.trim() : "";
    const pdfBase64 = typeof body?.pdfBase64 === "string" ? body.pdfBase64 : "";
    const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : "";
    const imageMimeType = typeof body?.imageMimeType === "string" ? body.imageMimeType : "";
    const formatDiagnostika = body?.format === "diagnostika";

    const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
    if (imageBase64) {
      if (!imageMimeType || !allowedImageTypes.includes(imageMimeType)) {
        return NextResponse.json({ error: "Nepovolený formát obrázku." }, { status: 400 });
      }
      const imageBuffer = Buffer.from(imageBase64, "base64");
      if (imageBuffer.length > 1 * 1024 * 1024) {
        return NextResponse.json({ error: "Obrázek je příliš velký." }, { status: 400 });
      }
    }

    let sourceContent = "";
    let scraped: Scraped | null = null;

    if (url) {
      const firecrawlKey = process.env.FIRECRAWL_API_KEY;
      if (!firecrawlKey) return NextResponse.json({ error: "FIRECRAWL_API_KEY není nastaven." }, { status: 500 });
      scraped = await scrapeWithFirecrawl(url, firecrawlKey);
      if (!scraped.markdown && !scraped.screenshot) {
        return NextResponse.json({ error: "Web nevrátil žádný obsah." }, { status: 422 });
      }
      sourceContent = scraped.markdown ?? "";
    }

    if (manualData) {
      sourceContent = sourceContent ? `${sourceContent}\n\n--- Zadaný text ---\n\n${manualData}` : manualData;
    }

    if (pdfBase64) {
      const buffer = Buffer.from(pdfBase64, "base64");
      const maxSize = 2 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return NextResponse.json({ error: "Soubor je příliš velký. Maximální velikost je 2 MB." }, { status: 400 });
      }
      const pdfParse = (await import("pdf-parse")).default as (buf: Buffer) => Promise<{ text: string }>;
      const { text: pdfText } = await pdfParse(buffer);
      sourceContent = sourceContent ? `${sourceContent}\n\n--- PDF ---\n\n${pdfText}` : pdfText;
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return NextResponse.json({ error: "OPENAI_API_KEY není nastaven." }, { status: 500 });

    if (!sourceContent.trim()) {
      return NextResponse.json(
        { error: "Zadejte URL webu, text o značce nebo nahrajte PDF." },
        { status: 400 }
      );
    }

    if (!formatDiagnostika && !scraped) {
      return NextResponse.json({ error: "Pro analýzu bez diagnostiky je potřeba zadat URL webu." }, { status: 400 });
    }

    let prompt = formatDiagnostika
      ? (scraped ? buildDiagnostikaPrompt(scraped) : buildDiagnostikaPromptFromText(sourceContent))
      : buildAnalyzeInput(scraped!);

    if (imageBase64 && imageMimeType) {
      prompt += "\n\nUživatel přiložil ukázku grafiky nebo fotografie značky. Vyhodnoť ji v kontextu vizuální identity a emoční stopy (pilíř Identita a celkový dojem).";
    }

    const messageContent = imageBase64 && imageMimeType && allowedImageTypes.includes(imageMimeType)
      ? [
          { type: "text" as const, text: prompt },
          { type: "image_url" as const, image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
        ]
      : prompt;

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
          messages: [{ role: "user", content: messageContent }],
          max_tokens: formatDiagnostika ? 4200 : 2000,
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

    const scrapedPayload = scraped
      ? { markdown: scraped.markdown, screenshot: scraped.screenshot, url: scraped.url, title: scraped.title, description: scraped.description }
      : { markdown: sourceContent, screenshot: null, url: "", title: "", description: "" };

    if (formatDiagnostika) {
      try {
        const result = parseDiagnostikaResult(outputText);
        return NextResponse.json({
          result: {
            brandScore: result.brandScore,
            brandDna: result.brandDna,
            summary: result.summary,
            pillarAnalysis: result.pillarAnalysis ?? undefined,
          },
          scraped: scrapedPayload,
        });
      } catch {
        return NextResponse.json({ error: "AI nevrátilo platnou Brand DNA (JSON). Zkuste to znovu." }, { status: 500 });
      }
    }

    return NextResponse.json({
      result: outputText,
      scraped: scrapedPayload,
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
