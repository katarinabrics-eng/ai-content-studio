import { NextResponse } from "next/server";
import {
  CONTENT_GOAL,
  PLATFORMS,
  STYLE_PREFERENCE,
  enrichRequestSchema,
  enrichResultSchema,
  normalizeSuggestionsInput,
  PDF_MIME,
  PDF_MAX_BYTES,
  type DetectedAssets,
  type EnrichPrefill,
  type EnrichSuggestions,
} from "@/lib/enrich-schema";
import { extractAssetsFromWeb, extractHeroFallback } from "@/lib/extract-assets";
import { chooseProcessingMode } from "@/lib/openai-processing";
import { getLatestIntakeByHostname } from "@/lib/supabase-intake";
import OpenAI from "openai";

const CONFIDENCE_PARTIAL_PREFILL = 0.35;

function hostnameFromWebsite(website: string): string {
  try {
    const u = new URL(website.startsWith("http") ? website : `https://${website}`);
    return u.hostname.toLowerCase().replace(/^www\./, "") || "unknown";
  } catch {
    return "unknown";
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 90;

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";
const REQUEST_TIMEOUT_MS = 85_000;

const ENRICH_SYSTEM_PROMPT = `Jsi asistent, který z textu webu a/nebo brand manuálu (PDF) extrahuje strukturované údaje pro intake formulář.

PRAVIDLA PRO PŘESNOST – NEPŘIDÁVEJ HALUCINACE:
- offers, industry, targetAudience: Vyplň JEN pokud máš EVIDENCI z webu (konkrétní URL + snippet). Pokud důkaz chybí, nech prázdné ("").
- evidence: Pro KAŽDÝ klíčový claim (offers, industry, targetAudience), který vyplňuješ, UVEĎ: { "field": "offers"|"industry"|"targetAudience", "sourceUrl": "https://...", "snippet": "citace z webu max 200 znaků" }.
- brandCoreOneLiner: Jedna věta shrnující HLAVNÍ nabídku firmy (co prodávají/poskytují) – pouze z evidence.
- allowedTopics: Pole témat, o kterých firma MLUVÍ (z webu). Např. ["web development","email automace","konzultace"] – jen z evidence.
- disallowedTopics: Témata, která na webu NEJSOU – např. generická ["data","komunita"] pokud web o nich nemluví.

Fallback: Můžeš použít hero/h1/h2/features z homepage – uveď jako sourceUrl homepage URL.

Vrať POUZE validní JSON bez markdownu.
Schéma: brandName, website, industry, targetAudience, offers, toneOfVoice, forbiddenWords, ctaPreference (string), contentGoal (enum), platforms (pole), stylePreference (enum), brandAssets: { logo, colors, fonts, photos }, missingFields (pole), confidence (0-1).
Return suggestions as OBJECT with keys (each value = array of strings): targetAudience, offers, toneOfVoice, ctaPreference, forbiddenWords.
Plus: brandCoreOneLiner (string), allowedTopics (string[]), disallowedTopics (string[]), evidence: [{ field, sourceUrl, snippet }].`;

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
 * Suggestions se normalizují na objekt; vrací též flag, zda byl tvar neplatný (pro warning).
 */
function normalizeLlmOutput(raw: Record<string, unknown>): { normalized: Record<string, unknown>; suggestionsNormalized: boolean } {
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

  const rawSuggestions = raw.suggestions;
  const suggestionsNormalized =
    rawSuggestions !== undefined &&
    (Array.isArray(rawSuggestions) ||
      typeof rawSuggestions !== "object" ||
      rawSuggestions === null);
  const suggestions = normalizeSuggestionsInput(rawSuggestions);

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

  const evidenceRaw = raw.evidence;
  const evidence = Array.isArray(evidenceRaw)
    ? (evidenceRaw as unknown[])
        .filter((e): e is Record<string, unknown> => e != null && typeof e === "object")
        .map((e) => ({
          field: String(e.field ?? ""),
          sourceUrl: String(e.sourceUrl ?? ""),
          snippet: String(e.snippet ?? ""),
        }))
        .filter((e) => e.field && e.sourceUrl && e.snippet)
    : [];

  const allowedTopics = Array.isArray(raw.allowedTopics)
    ? (raw.allowedTopics as unknown[]).filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean)
    : [];
  const disallowedTopics = Array.isArray(raw.disallowedTopics)
    ? (raw.disallowedTopics as unknown[]).filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    normalized: {
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
      suggestions,
      missingFields: Array.isArray(raw.missingFields)
        ? (raw.missingFields as unknown[]).map((x) => String(x)).filter(Boolean)
        : [],
      confidence:
        typeof raw.confidence === "number" && raw.confidence >= 0 && raw.confidence <= 1
          ? raw.confidence
          : 0.5,
      brandCoreOneLiner: normalizeText(raw.brandCoreOneLiner),
      allowedTopics,
      disallowedTopics,
      evidence,
    },
    suggestionsNormalized,
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
    const rush = formData.get("rush") === "true";
    const { mode: processingMode, reason: processingReason } = chooseProcessingMode({
      jobType: "enrich",
      rush,
    });
    const processingStartedAt = new Date().toISOString();

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

    const firstPageMarkdown = urlResults[0] && typeof urlResults[0] === "string" ? urlResults[0] : "";
    const heroFallback = firstPageMarkdown ? extractHeroFallback(firstPageMarkdown, urls[0] ?? website) : null;
    const fallbackNote = heroFallback
      ? `\n\n## Fallback z homepage (${urls[0]}):\nh1: ${heroFallback.h1}\nh2: ${heroFallback.h2s.slice(0, 8).join("; ")}\nfeatures: ${heroFallback.features.slice(0, 5).join("; ")}\npricing: ${heroFallback.pricing.slice(0, 3).join("; ")}`
      : "";

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
        { role: "user", content: `Extrahuj údaje z následujícího textu. Website: ${website}\n\n${combined.slice(0, 115000)}${fallbackNote}` },
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

    let toValidate: unknown = raw;
    let suggestionsNormalized = false;
    if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
      const { normalized, suggestionsNormalized: sn } = normalizeLlmOutput(raw as Record<string, unknown>);
      toValidate = normalized;
      suggestionsNormalized = sn;
    }

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
    const sug = d.suggestions ?? normalizeSuggestionsInput(null);
    const confidence = d.confidence ?? 0.5;
    const evidenceList = Array.isArray(d.evidence) ? d.evidence : [];
    const evidenceCount = evidenceList.length;
    const hasEvidence = (field: string) => evidenceList.some((e) => e.field === field);
    const blockOnly = confidence === 0 && evidenceCount === 0;
    const lowConfidence = confidence < 0.75;

    const scrapeStatus = webText ? "ok" : pdfText ? "pdf_only" : "ok";

    const heroBrand = heroFallback?.h1?.trim() || "";
    const heroOffers = heroFallback?.features?.length
      ? heroFallback.features.slice(0, 5).join("; ")
      : heroFallback?.h2s?.slice(0, 3).join("; ") || "";
    const heroAudience = heroFallback?.h2s?.find((h) => /cílová|audience|pro koho|target/i.test(h)) || "";

    const industryVal =
      blockOnly && !hasEvidence("industry") ? "" : (d.industry?.trim() ?? "");
    const targetAudienceVal =
      blockOnly && !hasEvidence("targetAudience") ? "" : (d.targetAudience?.trim() ?? "");
    const offersVal =
      blockOnly && !hasEvidence("offers") ? "" : (d.offers?.trim() ?? "");

    let prefill: EnrichPrefill = {
      brandName: (d.brandName?.trim() || heroBrand).trim() || "Značka",
      website: d.website?.trim() || website,
      industry: industryVal.trim() || (lowConfidence ? (heroFallback?.h2s?.[0] ?? "") : ""),
      targetAudience: targetAudienceVal.trim() || (lowConfidence ? heroAudience : ""),
      offers: offersVal.trim() || (lowConfidence ? heroOffers : ""),
      toneOfVoice: d.toneOfVoice?.trim() ?? "",
      forbiddenWords: d.forbiddenWords?.trim() ?? "",
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
      strategyMode: "auto",
      strategyId: undefined,
      awarenessLevel: "problem_aware",
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

    let source: "llm" | "fallback_cached" = "llm";
    if (lowConfidence && confidence < CONFIDENCE_PARTIAL_PREFILL) {
      const hostname = hostnameFromWebsite(website);
      const cached = await getLatestIntakeByHostname(hostname);
      if (cached && typeof cached === "object") {
        const c = cached as Record<string, unknown>;
        prefill = {
          ...prefill,
          brandName: (prefill.brandName && prefill.brandName !== "Značka" ? prefill.brandName : String(c.brandName ?? "").trim()) || prefill.brandName,
          website: prefill.website,
          industry: prefill.industry || String(c.industry ?? "").trim(),
          targetAudience: prefill.targetAudience || String(c.targetAudience ?? "").trim(),
          offers: prefill.offers || String(c.offers ?? "").trim(),
          toneOfVoice: prefill.toneOfVoice || String(c.toneOfVoice ?? "").trim(),
          forbiddenWords: prefill.forbiddenWords || String(c.forbiddenWords ?? "").trim(),
          contentGoal: prefill.contentGoal,
          platforms: prefill.platforms,
          stylePreference: prefill.stylePreference,
          ctaPreference: prefill.ctaPreference || String(c.ctaPreference ?? "").trim(),
          strategyMode: prefill.strategyMode,
          strategyId: prefill.strategyId,
          awarenessLevel: prefill.awarenessLevel,
          brandAssets: {
            logoUrl: prefill.brandAssets.logoUrl || String((c.brandAssets as { logo?: string })?.logo ?? "").trim(),
            colors: prefill.brandAssets.colors || String((c.brandAssets as { colors?: string })?.colors ?? "").trim(),
            fonts: prefill.brandAssets.fonts || String((c.brandAssets as { fonts?: string })?.fonts ?? "").trim(),
            photosNote: prefill.brandAssets.photosNote || "",
          },
        };
        source = "fallback_cached";
      }
    }

    const suggestions: EnrichSuggestions = {
      targetAudience: Array.isArray(sug.targetAudience) ? sug.targetAudience.filter((x) => typeof x === "string") : [],
      offers: Array.isArray(sug.offers) ? sug.offers.filter((x) => typeof x === "string") : [],
      toneOfVoice: Array.isArray(sug.toneOfVoice) ? sug.toneOfVoice.filter((x) => typeof x === "string") : [],
      ctaPreference: Array.isArray(sug.ctaPreference) ? sug.ctaPreference.filter((x) => typeof x === "string") : [],
      forbiddenWords: Array.isArray(sug.forbiddenWords) ? sug.forbiddenWords.filter((x) => typeof x === "string") : [],
    };

    const warnings: string[] = [];
    if (suggestionsNormalized) {
      warnings.push("Suggestions normalized due to invalid shape");
    }
    if (lowConfidence) {
      warnings.push("Nízká confidence – hodnoty z heuristik a best-effort; zkontrolujte před odesláním.");
    }

    const brandCoreOneLiner =
      typeof d.brandCoreOneLiner === "string" && d.brandCoreOneLiner.trim()
        ? d.brandCoreOneLiner.trim()
        : (d.offers?.trim() ? `Nabídka: ${d.offers.trim()}` : "");
    const allowedTopicsList = Array.isArray(d.allowedTopics) ? d.allowedTopics.filter((x): x is string => typeof x === "string") : [];
    const disallowedTopicsList = Array.isArray(d.disallowedTopics) ? d.disallowedTopics.filter((x): x is string => typeof x === "string") : [];

    const processingFinishedAt = new Date().toISOString();

    const diagnostics = {
      confidence,
      source,
      warnings,
      evidenceCount,
      scrapeStatus,
    };

    return NextResponse.json({
      ok: true,
      prefill,
      suggestions,
      detectedAssets,
      missingFields: parsed.data.missingFields ?? [],
      confidence,
      brandCoreOneLiner: brandCoreOneLiner || "Hlavní nabídka firmy z webu",
      allowedTopics: allowedTopicsList.length > 0 ? allowedTopicsList : (d.offers?.trim() ? d.offers.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : []),
      disallowedTopics: disallowedTopicsList,
      evidence: evidenceList,
      ...(warnings.length > 0 ? { warnings } : {}),
      diagnostics,
      processingMode,
      processingReason,
      startedAt: processingStartedAt,
      finishedAt: processingFinishedAt,
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
