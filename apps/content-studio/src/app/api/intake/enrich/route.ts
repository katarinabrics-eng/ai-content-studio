import { NextResponse } from "next/server";
import {
  CONTENT_GOAL,
  PLATFORMS,
  STYLE_PREFERENCE,
  enrichRequestSchema,
  enrichResultSchema,
  PDF_MIME,
  PDF_MAX_BYTES,
  type DetectedAssets,
  type EnrichPrefill,
  type EnrichSuggestions,
} from "@/lib/enrich-schema";
import { extractAssetsFromWeb } from "@/lib/extract-assets";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 90;

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";
const REQUEST_TIMEOUT_MS = 85_000;

const ENRICH_SYSTEM_PROMPT = `Jsi asistent, který z textu webu a/nebo brand manuálu (PDF) extrahuje strukturované údaje pro intake formulář.
Pravidla: Vrať POUZE validní JSON bez markdownu. Nikdy nevracej null – u každého pole uveď konkrétní hodnotu nebo rozumný draft.
Výchozí hodnoty když nevíš: contentGoal "důvěra", stylePreference "storytelling", platforms ["instagram","facebook"].
Pro KAŽDÉ pole uveď návrh (i když odhad). Přidej objekt "suggestions" s poli stringů – alternativní návrhy pro úpravu:
suggestions: { targetAudience: string[], offers: string[], toneOfVoice: string[], ctaPreference: string[], forbiddenWords: string[] }
(min. 1 návrh v každém poli, může být i více variant).
Schéma: brandName, website, industry, targetAudience, offers, toneOfVoice, forbiddenWords, ctaPreference (vše string), contentGoal (enum), platforms (pole), stylePreference (enum), brandAssets: { logo, colors, fonts, photos }, suggestions (jak výše), missingFields (pole chybějících polí), confidence (0-1).`;

/**
 * Normalizuje hodnotu na string pro textová pole: null/undefined -> undefined,
 * string -> trim, array -> join(", "), ostatní -> String(value).
 */
function normalizeText(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (Array.isArray(value)) {
    const parts = value.map((v) => (v != null ? String(v).trim() : "")).filter(Boolean);
    return parts.length ? parts.join(", ") : undefined;
  }
  return String(value).trim() || undefined;
}

/**
 * Před validací Zod normalizuje surový výstup LLM (null/array -> string).
 */
function normalizeLlmOutput(raw: Record<string, unknown>): Record<string, unknown> {
  const brandAssets = raw.brandAssets as Record<string, unknown> | null | undefined;
  const normalizedAssets =
    brandAssets && typeof brandAssets === "object" && !Array.isArray(brandAssets)
      ? {
          logo: normalizeText(brandAssets.logo),
          colors: normalizeText(brandAssets.colors),
          fonts: normalizeText(brandAssets.fonts),
          photos: normalizeText(brandAssets.photos),
        }
      : undefined;

  const contentGoal =
    raw.contentGoal != null && (CONTENT_GOAL as readonly string[]).includes(String(raw.contentGoal))
      ? raw.contentGoal
      : undefined;
  const stylePreference =
    raw.stylePreference != null &&
    (STYLE_PREFERENCE as readonly string[]).includes(String(raw.stylePreference))
      ? raw.stylePreference
      : undefined;
  const platforms = Array.isArray(raw.platforms)
    ? (raw.platforms as unknown[]).filter((p) => (PLATFORMS as readonly string[]).includes(String(p)))
    : undefined;

  return {
    ...raw,
    brandName: normalizeText(raw.brandName),
    website: normalizeText(raw.website),
    industry: normalizeText(raw.industry),
    targetAudience: normalizeText(raw.targetAudience),
    offers: normalizeText(raw.offers),
    toneOfVoice: normalizeText(raw.toneOfVoice),
    forbiddenWords: normalizeText(raw.forbiddenWords),
    ctaPreference: normalizeText(raw.ctaPreference),
    contentGoal,
    stylePreference,
    platforms,
    brandAssets: normalizedAssets,
    missingFields: Array.isArray(raw.missingFields)
      ? (raw.missingFields as unknown[]).map((x) => String(x)).filter(Boolean)
      : [],
    confidence:
      typeof raw.confidence === "number" && raw.confidence >= 0 && raw.confidence <= 1
        ? raw.confidence
        : 0.5,
  };
}

/**
 * Z surového textu odpovědi LLM vytáhne JSON objekt.
 * Odstraní ```json ... ```, vezme substring mezi prvním { a posledním }.
 */
function extractJson(raw: string): unknown {
  let text = raw.trim();
  const codeBlockMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end < start) {
    throw new Error("V odpovědi chybí JSON objekt");
  }
  const jsonStr = text.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr) as unknown;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "JSON.parse selhal";
    throw new Error(msg);
  }
}

function normalizeWebsiteUrl(url: string): string {
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

function buildPageUrls(website: string): string[] {
  const base = website.replace(/\/+$/, "");
  return [
    base,
    `${base}/about`,
    `${base}/services`,
    `${base}/contact`,
    `${base}/blog`,
  ];
}

async function scrapeWithFirecrawl(url: string, signal: AbortSignal): Promise<string> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    throw new Error("FIRECRAWL_API_KEY není nastaven");
  }
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats: ["markdown"] }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Firecrawl: ${res.status}`);
  }
  const data = (await res.json()) as { success?: boolean; data?: { markdown?: string } };
  if (!data.success || !data.data?.markdown) {
    return "";
  }
  return data.data.markdown;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default as (buf: Buffer) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result?.text ?? "";
}

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Očekává se multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const websiteRaw = formData.get("website");
    const websiteValue =
      typeof websiteRaw === "string" ? websiteRaw.trim() : "";
    const website = normalizeWebsiteUrl(websiteValue);

    const parsedReq = enrichRequestSchema.safeParse({ website });
    if (!parsedReq.success) {
      const msg = parsedReq.error.flatten().fieldErrors.website?.[0] ?? "Neplatná URL webu";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    const pdfEntry = formData.get("brandManualPdf");
    let pdfText = "";
    if (pdfEntry instanceof File && pdfEntry.size > 0) {
      if (pdfEntry.type !== PDF_MIME) {
        return NextResponse.json(
          { ok: false, error: "Brand manual musí být soubor PDF (application/pdf)." },
          { status: 400 }
        );
      }
      if (pdfEntry.size > PDF_MAX_BYTES) {
        return NextResponse.json(
          { ok: false, error: "PDF může mít maximálně 15 MB." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await pdfEntry.arrayBuffer());
      pdfText = await extractPdfText(buffer);
    }

    const urls = buildPageUrls(parsedReq.data.website);
    const [urlResults, detectedAssets] = await Promise.all([
      Promise.all(
        urls.map(async (url) => {
          try {
            return await scrapeWithFirecrawl(url, controller.signal);
          } catch {
            return "";
          }
        })
      ),
      extractAssetsFromWeb(parsedReq.data.website, controller.signal),
    ]);
    const webParts = urlResults
      .map((markdown, i) => (markdown ? `--- ${urls[i]} ---\n${markdown}` : ""))
      .filter(Boolean);
    const webText = webParts.join("\n\n");

    if (!webText && !pdfText) {
      return NextResponse.json(
        { ok: false, error: "Nepodařilo se načíst žádný obsah z webu. Zkontrolujte URL a FIRECRAWL_API_KEY." },
        { status: 422 }
      );
    }

    const combined =
      (webText ? `## Obsah webu\n${webText}\n\n` : "") +
      (pdfText ? `## Brand manual (PDF)\n${pdfText}` : "");

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY není nastaven" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ENRICH_SYSTEM_PROMPT },
        { role: "user", content: `Extrahuj údaje z následujícího textu. Website zadaný uživatelem: ${website}\n\n${combined.slice(0, 120000)}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const message = completion.choices[0]?.message;
    const rawContent = message?.content;
    const content =
      typeof rawContent === "string"
        ? rawContent.trim()
        : Array.isArray(rawContent)
          ? String(
              (rawContent as Array<{ type?: string; text?: string }>).find((p) => p.type === "text")?.text ?? ""
            ).trim()
          : "";
    if (!content) {
      return NextResponse.json(
        { ok: false, error: "LLM_PARSE_FAILED", detail: "Prázdný text odpovědi." },
        { status: 422 }
      );
    }

    let raw: unknown;
    try {
      raw = extractJson(content);
    } catch (parseErr) {
      const detail = parseErr instanceof Error ? parseErr.message : String(parseErr);
      return NextResponse.json(
        { ok: false, error: "LLM_PARSE_FAILED", detail },
        { status: 422 }
      );
    }

    const toValidate =
      raw != null && typeof raw === "object" && !Array.isArray(raw)
        ? normalizeLlmOutput(raw as Record<string, unknown>)
        : raw;

    const parsed = enrichResultSchema.safeParse(toValidate);
    if (!parsed.success) {
      const detail = parsed.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return NextResponse.json(
        { ok: false, error: "LLM_PARSE_FAILED", detail },
        { status: 422 }
      );
    }

    const d = parsed.data;
    const sug = d.suggestions;

    const prefill: EnrichPrefill = {
      brandName: d.brandName?.trim() || "Značka",
      website: d.website?.trim() || website,
      industry: d.industry?.trim() || "",
      targetAudience: d.targetAudience?.trim() || "",
      offers: d.offers?.trim() || "",
      toneOfVoice: d.toneOfVoice?.trim() || "",
      forbiddenWords: d.forbiddenWords?.trim() || "",
      contentGoal:
        d.contentGoal && (CONTENT_GOAL as readonly string[]).includes(d.contentGoal)
          ? d.contentGoal
          : "důvěra",
      platforms:
        Array.isArray(d.platforms) && d.platforms.length > 0
          ? d.platforms.filter((p) => (PLATFORMS as readonly string[]).includes(p))
          : ["instagram", "facebook"],
      stylePreference:
        d.stylePreference && (STYLE_PREFERENCE as readonly string[]).includes(d.stylePreference)
          ? d.stylePreference
          : "storytelling",
      ctaPreference: d.ctaPreference?.trim() || "",
      brandAssets: {
        logoUrl: detectedAssets.logoCandidates[0] ?? d.brandAssets?.logo?.trim() ?? "",
        colors: detectedAssets.colors.length > 0
          ? detectedAssets.colors.join(", ")
          : (d.brandAssets?.colors?.trim() ?? ""),
        fonts: detectedAssets.fonts.length > 0
          ? detectedAssets.fonts.join(", ")
          : (d.brandAssets?.fonts?.trim() ?? ""),
        photosNote: d.brandAssets?.photos?.trim() ?? "",
      },
    };

    const suggestions: EnrichSuggestions = {
      targetAudience: Array.isArray(sug?.targetAudience) ? sug.targetAudience.filter((x) => typeof x === "string") : [],
      offers: Array.isArray(sug?.offers) ? sug.offers.filter((x) => typeof x === "string") : [],
      toneOfVoice: Array.isArray(sug?.toneOfVoice) ? sug.toneOfVoice.filter((x) => typeof x === "string") : [],
      ctaPreference: Array.isArray(sug?.ctaPreference) ? sug.ctaPreference.filter((x) => typeof x === "string") : [],
      forbiddenWords: Array.isArray(sug?.forbiddenWords) ? sug.forbiddenWords.filter((x) => typeof x === "string") : [],
    };

    return NextResponse.json({
      ok: true,
      prefill,
      suggestions,
      detectedAssets,
      missingFields: parsed.data.missingFields ?? [],
      confidence: parsed.data.confidence ?? 0.5,
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === "AbortError") {
        return NextResponse.json(
          { ok: false, error: "Požadavek vypršel.", detail: "Zkuste to znovu nebo zjednodušte vstupy." },
          { status: 408 }
        );
      }
      console.error("[/api/intake/enrich]", e);
      return NextResponse.json(
        {
          ok: false,
          error: "ENRICH_INTERNAL_ERROR",
          detail: e.message || "Došlo k neočekávané chybě serveru.",
        },
        { status: 500 }
      );
    }
    console.error("[/api/intake/enrich]", e);
    return NextResponse.json(
      { ok: false, error: "ENRICH_INTERNAL_ERROR", detail: "Došlo k neočekávané chybě serveru." },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
