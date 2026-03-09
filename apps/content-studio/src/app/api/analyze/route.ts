import { NextResponse } from "next/server";
import { selectStrategists } from "@/lib/strategist-selector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o";
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
      formats: [
        { type: "markdown" },
        { type: "screenshot", viewport: { width: 1280, height: 800 } },
      ],
      onlyMainContent: true,
      waitFor: 2000,
    }),
  },
    FETCH_TIMEOUT_MS
  );

  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { error?: string; message?: string; param?: string };
    const raw = e?.message ?? e?.error ?? `Firecrawl error ${res.status}`;
    const msg = raw.toLowerCase().includes("bad request") || res.status === 400
      ? "URL není platná nebo web se nepodařilo načíst. Zkuste zkontrolovat adresu a zkusit znovu."
      : raw;
    if (process.env.NODE_ENV !== "production") {
      console.error("[analyze] Firecrawl error:", { raw, message: msg, param: e?.param });
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
  return `Analyzuj následující web na základě jeho skutečného obsahu. Veškerou odpověď piš výhradně v češtině.

URL: ${scraped.url}
Název: ${scraped.title ?? ""}
Meta popis: ${scraped.description ?? ""}

OBSAH WEBU (markdown):
---
${textContent}
---

Vrať čistý text (ne JSON), oddělené sekce, vše v češtině:

1. Shrnutí positioning – jak se web/služba prezentuje, hlavní sdělení.
2. Cílovou skupinu – komu je nabídka určena (pokud je z obsahu zřejmá).
3. Silné stránky – co web dělá dobře z hlediska brandu a komunikace.
4. Slabiny – co chybí nebo co by šlo zlepšit.
5. Doporučení dalšího kroku – konkrétní návrh, kam směřovat (např. vizuální identita, obsah, CTA).`;
}

const PILLAR_ANALYSIS_SCHEMA = `
  "pillarAnalysis": {
    "light": { "score": 1-10 celé číslo, "interpretation": "3-4 věty česky", "observed": ["nález 1"], "notObserved": ["co chybí 1"], "reasoning": "2-4 věty proč", "strategicOpportunity": "jedna věta" },
    "energy": { "score": 1-10 celé číslo, "interpretation": "...", "observed": ["..."], "notObserved": ["..."], "reasoning": "...", "strategicOpportunity": "..." },
    "architecture": { "score": 1-10 celé číslo, "interpretation": "...", "observed": ["..."], "notObserved": ["..."], "reasoning": "...", "strategicOpportunity": "..." },
    "identity": { "score": 1-10 celé číslo, "interpretation": "...", "observed": ["..."], "notObserved": ["..."], "reasoning": "...", "strategicOpportunity": "..." },
    "trust": { "score": 1-10 celé číslo, "interpretation": "...", "observed": ["..."], "notObserved": ["..."], "reasoning": "...", "strategicOpportunity": "..." }
  }
`;

const DIAGNOSTIKA_METHODOLOGY = `
JAZYK: Veškerý výstup piš výhradně v češtině – interpretation, observed, notObserved, reasoning, strategicOpportunity, summary i všechny položky v polích. Žádná angličtina.

Hodnoť VÝHRADNĚ podle těchto kritérií. Každý pilíř ohodnoť na stupnici 1–10, kde:
1–3 = chybí úplně
4–5 = základní úroveň
6–7 = průměrná úroveň
8–9 = nadprůměrná úroveň
10 = výjimečná úroveň
Buď konzistentní — stejný web musí dostat stejné skóre.

You are a senior brand strategist. Generate output using this strict structure for EACH pillar.

POVINNÉ u KAŽDÉHO pilíře (light, energy, architecture, identity, trust):
- score: 1–10 celé číslo (odpovídá škále výše a tomu, co jste v observed/notObserved/reasoning popsali).
- interpretation: 3–4 věty pro veřejnou část – stručně, profesionálně, co značka v pilíři dělá a co jí chybí.
- observed: pole s min. 1 konkrétním nálezem (co jste na webu/v podkladech zaznamenali). Nikdy ne prázdné.
- notObserved: pole s min. 1 položkou (co chybí nebo co by mohlo být lepší). Nikdy ne prázdné.
- reasoning: 2–4 věty – proč jste dali toto skóre, z čeho jste vycházeli. Povinné. Bez reasoning není hodnocení kompletní.
- strategicOpportunity: jedna věta – doporučený směr.

Rules:
- Be analytical, not judgmental. Explain logic clearly. Avoid generic phrases; use concrete findings.
- Skóre musí být zdůvodněno: observed + notObserved + reasoning musí odpovídat číslu. Nelze dát např. 10/10 bez vyplněného reasoning a konkrétních observed/notObserved.
- DŮVĚRA (trust): Rozlišuj portfolio = ukázka práce, reference = hlas klienta, case study = důkaz výsledku. V reasoning to případně vysvětli.
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
  const d = data as { model?: string; choices?: Array<{ message?: { content?: unknown } }> };
  const content = d.choices?.[0]?.message?.content;
  if (content == null) return "No output received";
  const text = typeof content === "string" ? content.trim() : "";
  return text || "No output received";
}

const PILLAR_KEYS = ["light", "energy", "architecture", "identity", "trust"] as const;

function parseDiagnostikaResult(raw: string): Record<string, unknown> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI nevrátilo platný JSON");
  return JSON.parse(match[0]) as Record<string, unknown>;
}

/** Validuje, že každý pilíř má score v rozsahu 1–10 (číslo). Vyhodí chybu při neplatném výstupu. */
function validatePillarScores(result: Record<string, unknown>): void {
  const pillarAnalysis = result.pillarAnalysis as Record<string, { score?: unknown }> | undefined;
  if (!pillarAnalysis || typeof pillarAnalysis !== "object") {
    throw new Error("Chybí pillarAnalysis");
  }
  for (const key of PILLAR_KEYS) {
    const pillar = pillarAnalysis[key];
    if (!pillar || typeof pillar !== "object") {
      throw new Error(`Pilíř "${key}" chybí nebo není objekt`);
    }
    const score = pillar.score;
    const num = typeof score === "string" ? parseInt(score, 10) : typeof score === "number" ? score : NaN;
    if (Number.isNaN(num) || num < 1 || num > 10 || Math.floor(num) !== num) {
      throw new Error(`Pilíř "${key}" má neplatné score (očekáváno celé číslo 1–10): ${String(score)}`);
    }
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Neplatný požadavek (chybí nebo poškozené JSON tělo)." },
        { status: 400 }
      );
    }
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
          ...(formatDiagnostika ? { temperature: 0.1, seed: 42 } : {}),
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
        validatePillarScores(result);
        const total = (result.brandScore as { total?: number } | undefined)?.total;
        const analyzedUrl = scraped?.url ?? "";
        console.log("[diagnostika]", {
          url: analyzedUrl,
          totalScore: total,
          at: new Date().toISOString(),
        });
        const suggested = selectStrategists(result);
        return NextResponse.json({
          result: {
            brandScore: result.brandScore,
            brandDna: result.brandDna,
            summary: result.summary,
            pillarAnalysis: result.pillarAnalysis ?? undefined,
            suggested_strategists: suggested,
          },
          scraped: scrapedPayload,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI nevrátilo platnou Brand DNA (JSON). Zkuste to znovu.";
        const status = message.includes("score") || message.includes("pillar") || message.includes("Pilíř") ? 400 : 500;
        return NextResponse.json({ error: message }, { status });
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
