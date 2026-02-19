import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getIntakeByIdOrLast } from "@/lib/supabase-intake";
import { getDraftById, updateDraftPayload } from "@/lib/supabase-posts";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getBrandSpecFromIntake } from "@/lib/brand-spec";
import { getStrategyById } from "@/lib/strategy-library";
import { pickStrategy } from "@/lib/strategy-picker";
import { PLATFORM_FORMATS, type CreativeBrief, type PlatformFormatKey } from "@/lib/visual-schema";
import { composeTextOverlay } from "@/lib/visual-composer";
import { criticVisualFromB64 } from "@/lib/visual-critic";
import { getWebStyleFromIntake } from "@/lib/web-style-helper";
import { resolveVisualStyle } from "@/lib/visual-style-resolver";
import { CANONICAL_STYLE_IDS, normalizeStyleId, type VisualStyleId } from "@/lib/visual-style-presets";
import { chooseProcessingMode } from "@/lib/openai-processing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

/** When true (default): 1 variant, no critic, minimal overlay. Recommended on Vercel Hobby (60s limit). */
const FAST_MODE = process.env.VISUAL_FAST_MODE !== "false";

const STAGE_IMAGE_MS = 45_000;
const STAGE_LOGO_MS = 3_000;
const STAGE_STORAGE_MS = 10_000;
const HARD_GUARD_ELAPSED_MS = 52_000;

function visualFail(
  draftId: string,
  draftPayload: Record<string, unknown>,
  detail: string,
  hint: string,
  errorCode = "VISUAL_GENERATION_FAILED"
): NextResponse {
  updateDraftPayload(draftId, {
    ...draftPayload,
    visualStatus: "error",
    visualError: detail,
    visualUpdatedAt: new Date().toISOString(),
  }).catch(() => {});
  return NextResponse.json(
    { ok: false, error: errorCode, detail, hint },
    { status: errorCode === "VISUAL_TIMEOUT" ? 408 : 500 }
  );
}

const VISUAL_BUCKET = process.env.SUPABASE_VISUALS_BUCKET ?? "generated-visuals";
const IMAGE_MODEL = "gpt-image-1";
const CANDIDATE_COUNT = 1;
const MAX_CANDIDATES = 2;
const MIN_SCORE = 8;
const MAX_REGENERATE_ROUNDS = FAST_MODE ? 0 : 1;
const STRICT_SUFFIX =
  " no text, no letters, no typography, no watermark, no logo, clean composition, negative space for overlay.";

const STYLE_PROFILES = [...CANONICAL_STYLE_IDS, "simby_product_ad", "brand_product_ad", "generic_saas", "minimal_clean"];

const PLATFORM_TO_FORMAT: Record<string, PlatformFormatKey> = {
  instagram: "instagram-feed",
  facebook: "facebook-feed",
  linkedin: "linkedin-post",
};

const OPENAI_SIZES = ["1024x1024", "1536x1024", "1024x1536"] as const;

function getOpenAISize(format: PlatformFormatKey): (typeof OPENAI_SIZES)[number] {
  const dims = PLATFORM_FORMATS[format];
  const ratio = dims.width / dims.height;
  if (ratio > 1.2) return "1536x1024";
  if (ratio < 0.85) return "1024x1536";
  return "1024x1024";
}

type ResolvedStyleForPrompt = {
  palette: string[];
  moodKeywords: string[];
  negativePrompt: string;
  visualStyleId: string;
  visualStyleLabel: string;
  visualStyleSource: string;
  brandContextApplied: boolean;
};

function buildCreativeBriefPrompt(
  draft: { payload: Record<string, unknown> },
  intake: Record<string, unknown>,
  brandSpec: import("@/lib/brand-spec").BrandSpec,
  resolvedStyle: ResolvedStyleForPrompt,
  visualStyleProfile?: Record<string, unknown> | null,
  strategy?: import("@/lib/strategy-library").StrategyPreset
): string {
  const p = draft.payload;
  const paletteNote = resolvedStyle.palette.length > 0
    ? `Palette: ${resolvedStyle.palette.join(", ")}`
    : brandSpec.colors.length
      ? `Použij barvy z palety: ${brandSpec.colors.join(", ")}`
      : "";
  const toneNote = brandSpec.toneOfVoice ? `Mood/tón: ${brandSpec.toneOfVoice}` : "";
  const moodNote = resolvedStyle.moodKeywords.length > 0
    ? `Mood keywords: ${resolvedStyle.moodKeywords.join(", ")}`
    : "";
  const styleNote = resolvedStyle.visualStyleLabel !== "Default"
    ? `Styl: ${resolvedStyle.visualStyleLabel}. ${resolvedStyle.negativePrompt}`
    : "";
  const visualDirectivesNote = strategy?.visualDirectives?.length
    ? `Art direction: ${strategy.visualDirectives.join("; ")}`
    : "";
  return `Jsi art director. Na základě draftu a intake vytvoř creative brief pro vizuál (POUZE POZADÍ – žádný text v obrázku).
Draft: platform=${p.platform}, hook=${p.hook}, caption=${p.caption}, cta=${p.cta}, visualBrief=${p.visualBrief}
Intake: toneOfVoice=${intake.toneOfVoice}, offers=${intake.offers}, targetAudience=${intake.targetAudience}
${paletteNote}
${toneNote}
${moodNote}
${styleNote}
${visualDirectivesNote}
${visualStyleProfile ? `Visual style profile: ${JSON.stringify(visualStyleProfile)}` : ""}

Vrať POUZE validní JSON bez markdownu:
{
  "concept": "hlavní koncept",
  "shotType": "typ záběru (close-up, medium, wide...)",
  "scene": "popis scény",
  "lighting": "osvětlení",
  "composition": "kompozice",
  "palette": "barvy",
  "headline": "hlavní nadpis max 6 slov",
  "subheadline": "podnadpis max 12 slov (volitelné)",
  "cta": "CTA text",
  "negativePrompt": "co NEPOUŽÍVAT: text v obraze, písmena, watermark, logo v obraze, collage chaos, rušné pozadí"
}
Pravidla: žádný text v samotném obrázku (text overlay přijde zvlášť). Čistá kompozice, negativní prostor pro overlay.`;
}

function creativeBriefToImagePrompt(
  brief: CreativeBrief,
  resolvedStyle: ResolvedStyleForPrompt,
  brandSpec: import("@/lib/brand-spec").BrandSpec
): string {
  const paletteStr = resolvedStyle.palette.length > 0
    ? resolvedStyle.palette.join(", ")
    : brandSpec.colors.length
      ? brandSpec.colors.join(", ")
      : brief.palette;
  const moodStr = resolvedStyle.moodKeywords.length > 0 ? resolvedStyle.moodKeywords.join(", ") : "";
  const parts = [
    brief.concept,
    brief.shotType,
    brief.scene,
    brief.lighting,
    brief.composition,
    `Palette: ${paletteStr}`,
  ];
  if (moodStr) parts.push(`Mood: ${moodStr}`);
  const negPrompt = brief.negativePrompt || resolvedStyle.negativePrompt;
  if (negPrompt) {
    parts.push(`AVOID: ${negPrompt}`);
  }
  parts.push(
    "Clean composition, human-centric, campaign-like background only."
  );
  return parts.join(". ") + STRICT_SUFFIX;
}

function buildPresetStyleImagePrompt(
  brief: CreativeBrief,
  preset: import("@/lib/visual-style-presets").VisualStylePreset,
  brandColors: string[],
  tone: string
): string {
  const conceptParts = [brief.concept, brief.scene, brief.lighting, brief.composition].filter(Boolean);
  const conceptLine = conceptParts.length > 0
    ? `Visual concept: ${conceptParts.join(". ")}.`
    : "";
  const prompt = [
    `Create a social ad background (${preset.defaultAspectRatio}) for a Czech brand.`,
    conceptLine,
    `Style profile: ${preset.label}.`,
    `Tone of voice: ${tone}.`,
    brandColors.length ? `Brand colors: ${brandColors.join(", ")}.` : "Use clean neutral palette with subtle brand accents.",
    ...preset.promptDirectives.map((d) => `- ${d}`),
    `Hard constraints: ${preset.negativePrompt.join(", ")}.`,
  ].filter(Boolean).join("\n");
  return prompt + " " + STRICT_SUFFIX;
}

function withTimeout<T>(promise: Promise<T>, ms: number, stage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`VISUAL_TIMEOUT|${stage}|${ms}ms`)), ms);
    promise.then((v) => {
      clearTimeout(t);
      resolve(v);
    }, (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export async function POST(request: Request) {
  const startMs = Date.now();
  const elapsed = () => Date.now() - startMs;

  try {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Neplatné JSON tělo požadavku" },
        { status: 400 }
      );
    }
    const b = body as {
      draftId?: string; format?: string; regenerate?: boolean; lockStyle?: boolean; brandLock?: boolean; styleProfile?: string;
      strategyMode?: string; strategyId?: string;
      strategyIdOverride?: string; strategyModeOverride?: "auto" | "manual";
      rush?: boolean;
    };
    const draftId = typeof b.draftId === "string" ? b.draftId : null;
    const rush = b.rush === true;
    const { mode: processingMode, reason: processingReason } = chooseProcessingMode({
      jobType: "single_visual_regen",
      rush,
    });
    const processingStartedAt = new Date().toISOString();

    if (!draftId) {
      return NextResponse.json({ ok: false, error: "VISUAL_GENERATION_FAILED", detail: "Chybí draftId", hint: "Odešlete draftId v těle požadavku." }, { status: 400 });
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ ok: false, error: "VISUAL_GENERATION_FAILED", detail: "Draft nebyl nalezen", hint: "Zkontrolujte, že draftId existuje v databázi." }, { status: 404 });
    }

    const intake = await getIntakeByIdOrLast(draft.intake_id);
    if (!intake) {
      return NextResponse.json({ ok: false, error: "VISUAL_GENERATION_FAILED", detail: "Intake nebyl nalezen", hint: "Přidružený intake byl smazán nebo neexistuje." }, { status: 404 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "VISUAL_GENERATION_FAILED",
          detail: "OPENAI_API_KEY není nastaven",
          hint: "Nastavte OPENAI_API_KEY v prostředí serveru.",
        },
        { status: 500 }
      );
    }

    const platform = String(draft.payload.platform ?? "instagram");
    const formatKey = (b.format && b.format in PLATFORM_FORMATS
      ? b.format
      : PLATFORM_TO_FORMAT[platform] ?? "instagram-feed") as PlatformFormatKey;
    const dims = PLATFORM_FORMATS[formatKey];
    const brandLock = b.brandLock !== false;
    const brandSpec = getBrandSpecFromIntake(intake as Record<string, unknown>);
    const webStyle = getWebStyleFromIntake(intake as Record<string, unknown>);
    const styleProfile = typeof b.styleProfile === "string" && STYLE_PROFILES.includes(b.styleProfile)
      ? b.styleProfile
      : undefined;
    const visualStyleProfile = (intake as Record<string, unknown>).visualStyleProfile as Record<string, unknown> | null | undefined;
    const intakePayload = (intake as { payload?: unknown }).payload ?? (intake as Record<string, unknown>);
    const intakePayloadObj = (typeof intakePayload === "object" && intakePayload !== null ? intakePayload : {}) as Record<string, unknown>;
    const rawStyleId = (b.styleProfile as VisualStyleId | undefined) ?? "auto";
    const requestedStyleId = rawStyleId === "auto" ? "auto" : (normalizeStyleId(rawStyleId) as VisualStyleId);
    const { preset, source, brandContextApplied } = resolveVisualStyle({
      requestedStyleId,
      brandName: intakePayloadObj?.brandName as string | undefined,
      website: intakePayloadObj?.website as string | undefined,
    });
    const resolvedStyle = {
      palette: brandSpec.colors,
      moodKeywords: preset.promptDirectives,
      negativePrompt: preset.negativePrompt.join(", "),
      visualStyleId: preset.id,
      visualStyleLabel: preset.label,
      visualStyleSource: source,
      brandContextApplied,
    };

    const brandAssetsColors = (intakePayloadObj?.brandAssets as { colors?: string | string[] } | undefined)?.colors;
    const brandColors = Array.isArray(brandAssetsColors)
      ? brandAssetsColors
      : typeof brandAssetsColors === "string"
        ? [brandAssetsColors]
        : [];
    const tone = (intakePayloadObj?.toneOfVoice as string) || "profesionální, důvěryhodný";

    const useOverride = (b.strategyModeOverride === "manual" || b.strategyIdOverride) && b.strategyIdOverride && getStrategyById(b.strategyIdOverride as import("@/lib/strategy-library").StrategyId);

    let strategy: import("@/lib/strategy-library").StrategyPreset | undefined;
    let visualStrategySource: "draft" | "override" = "draft";

    if (useOverride) {
      strategy = getStrategyById(b.strategyIdOverride as import("@/lib/strategy-library").StrategyId);
      visualStrategySource = "override";
    } else if (b.strategyMode === "manual" && b.strategyId && getStrategyById(b.strategyId as import("@/lib/strategy-library").StrategyId)) {
      strategy = getStrategyById(b.strategyId as import("@/lib/strategy-library").StrategyId);
    } else if (draft.payload.strategyId && getStrategyById(draft.payload.strategyId as import("@/lib/strategy-library").StrategyId)) {
      strategy = getStrategyById(draft.payload.strategyId as import("@/lib/strategy-library").StrategyId);
    } else {
      const al = (intakePayloadObj.awarenessLevel as string) ?? "problem_aware";
      const awarenessLevel: import("@/lib/strategy-library").AwarenessLevel =
        ["unaware", "problem_aware", "solution_aware", "product_aware", "most_aware"].includes(al) ? (al as import("@/lib/strategy-library").AwarenessLevel) : "problem_aware";
      const picked = pickStrategy({
        contentGoal: (intakePayloadObj.contentGoal as "prodej" | "důvěra" | "edukace") ?? "edukace",
        platforms: (intakePayloadObj.platforms as string[]) ?? [],
        targetAudience: String(intakePayloadObj.targetAudience ?? ""),
        offers: String(intakePayloadObj.offers ?? ""),
        toneOfVoice: String(intakePayloadObj.toneOfVoice ?? ""),
        awarenessLevel,
      });
      strategy = picked.strategy;
    }

    try {
      await updateDraftPayload(draftId, {
        ...draft.payload,
        visualStatus: "generating",
        visualError: undefined,
      });
    } catch (e) {
      console.error("Chyba při nastavení visualStatus=generating:", e);
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // Step A: Generate creative brief
    let brief: CreativeBrief;
    try {
      const briefPrompt = buildCreativeBriefPrompt(draft, intake as Record<string, unknown>, brandSpec, resolvedStyle, visualStyleProfile, strategy);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: briefPrompt }],
        max_tokens: 600,
      });
      const raw = completion.choices?.[0]?.message?.content?.trim() ?? "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : raw;
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
      brief = {
        concept: String(parsed.concept ?? ""),
        shotType: String(parsed.shotType ?? ""),
        scene: String(parsed.scene ?? ""),
        lighting: String(parsed.lighting ?? ""),
        composition: String(parsed.composition ?? ""),
        palette: String(parsed.palette ?? ""),
        headline: String(parsed.headline ?? draft.payload.hook ?? ""),
        subheadline: typeof parsed.subheadline === "string" ? parsed.subheadline : undefined,
        cta: String(parsed.cta ?? draft.payload.cta ?? ""),
        negativePrompt: typeof parsed.negativePrompt === "string" ? parsed.negativePrompt : undefined,
      };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Chyba při generování creative brief";
      return visualFail(draftId, draft.payload, errMsg, "Zkuste znovu; problém může být s draftem nebo AI modelem.");
    }

    const imagePrompt = buildPresetStyleImagePrompt(brief, preset, brandColors, tone);
    const size = getOpenAISize(formatKey);

    try {
      // Step B: Generate variants; in FAST_MODE: 1 variant, no critic
    const candidateCount = FAST_MODE ? 1 : Math.min(Math.max(1, CANDIDATE_COUNT), MAX_CANDIDATES);
    let bestB64: string | null = null;
    let bestCritic: import("@/lib/visual-critic").VisualCriticResult | null = null;
    let lastError: Error | null = null;
    let lastStage: "image_generation" | "critic_scoring" = "image_generation";
    let warningMessage: string | undefined;

    for (let round = 0; round <= MAX_REGENERATE_ROUNDS; round++) {
      if (elapsed() > HARD_GUARD_ELAPSED_MS && bestB64) break;

      const candidates: { b64: string; critic: import("@/lib/visual-critic").VisualCriticResult }[] = [];
      const defaultCritic: import("@/lib/visual-critic").VisualCriticResult = {
        score: 6,
        hasTextArtifacts: false,
        brandColorMatch: 5,
        brandStyleMatch: 5,
        note: FAST_MODE ? "Fast mode – critic skipped" : "",
      };

      for (let i = 0; i < candidateCount; i++) {
        let b64: string | null = null;
        try {
          const resp = await withTimeout(
            openai.images.generate({
              model: IMAGE_MODEL,
              prompt: imagePrompt,
              n: 1,
              size,
            }),
            STAGE_IMAGE_MS,
            "image_generation"
          );
          const first = resp.data?.[0];
          b64 = typeof first?.b64_json === "string" ? first.b64_json : null;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes("VISUAL_TIMEOUT")) {
            updateDraftPayload(draftId, { ...draft.payload, visualStatus: "error", visualError: "Časový limit generování obrázku.", visualUpdatedAt: new Date().toISOString() }).catch(() => {});
            return NextResponse.json(
              { ok: false, error: "VISUAL_TIMEOUT", detail: "Generování obrázku překročilo časový limit.", hint: "Zkuste znovu nebo vypněte Brand Lock." },
              { status: 408 }
            );
          }
          lastError = e instanceof Error ? e : new Error(String(e));
          lastStage = "image_generation";
          continue;
        }
        if (!b64) continue;

        if (FAST_MODE) {
          candidates.push({ b64, critic: defaultCritic });
        } else {
          try {
            const criticResult = await criticVisualFromB64(b64, openaiKey, {
              brandColors: brandSpec.colors,
              moodKeywords: webStyle.moodKeywords,
            });
            if (criticResult) {
              candidates.push({ b64, critic: criticResult });
            } else {
              candidates.push({ b64, critic: defaultCritic });
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes("VISUAL_TIMEOUT")) {
              updateDraftPayload(draftId, { ...draft.payload, visualStatus: "error", visualError: "Časový limit vyhodnocení.", visualUpdatedAt: new Date().toISOString() }).catch(() => {});
              return NextResponse.json(
                { ok: false, error: "VISUAL_TIMEOUT", detail: "Vyhodnocení vizuálu překročilo časový limit.", hint: "Zkuste znovu nebo vypněte Brand Lock." },
                { status: 408 }
              );
            }
            lastError = e instanceof Error ? e : new Error(String(e));
            lastStage = "critic_scoring";
            candidates.push({ b64, critic: defaultCritic });
          }
        }
      }

      // Pick best: prefer no text artifacts, then highest score
      const valid = candidates.filter((c) => c.critic.score >= 0);
      const noText = valid.filter((c) => !c.critic.hasTextArtifacts);
      const pool = noText.length > 0 ? noText : valid;
      const best = pool.length > 0 ? pool.reduce((a, b) => (a.critic.score >= b.critic.score ? a : b)) : null;

      if (best) {
        bestB64 = best.b64;
        bestCritic = best.critic;
      } else if (candidates.length > 0) {
        const fallback = candidates.reduce((a, b) => (a.critic.score >= b.critic.score ? a : b));
        bestB64 = fallback.b64;
        bestCritic = fallback.critic;
      }

      const shouldRegenerate =
        bestCritic &&
        (bestCritic.hasTextArtifacts || bestCritic.score < MIN_SCORE) &&
        round < MAX_REGENERATE_ROUNDS;

      if (shouldRegenerate) continue;

      if (bestCritic && (bestCritic.hasTextArtifacts || bestCritic.score < MIN_SCORE)) {
        warningMessage =
          bestCritic.hasTextArtifacts && bestCritic.score < MIN_SCORE
            ? "Vizuál může obsahovat nežádoucí text nebo nedosahuje cílové kvality."
            : bestCritic.hasTextArtifacts
              ? "Vizuál může obsahovat nežádoucí text v obraze."
              : "Kvalita vizuálu nedosahuje cílového skóre 8.";
      }
      break;
    }

    if (!bestB64) {
      const errMsg = lastError?.message ?? "OpenAI nevrátilo obrázek";
      const hint =
        lastStage === "image_generation"
          ? "Zkontrolujte OPENAI_API_KEY a dostupnost modelu gpt-image-1."
          : "Vyhodnocení kvality vizuálu selhalo; zkuste znovu.";
      throw new Error(`[${lastStage}] ${errMsg}|${hint}`);
    }

    const baseBuffer = Buffer.from(bestB64, "base64");
    const criticScore = bestCritic?.score ?? 0;
    const criticNote = bestCritic?.note ?? "";

    const skipOverlayDueToTime = elapsed() > HARD_GUARD_ELAPSED_MS;
    const ctaColor = !FAST_MODE && brandLock && brandSpec.colors.length > 0 ? brandSpec.colors[0] : undefined;
    const logoUrl = FAST_MODE ? undefined : (brandLock ? brandSpec.logoUrl : undefined);
    const logoAbort = new AbortController();
    const logoTimeoutId = setTimeout(() => logoAbort.abort(), STAGE_LOGO_MS);

    let finalBuffer: Buffer;
    let overlayError: string | undefined;
    if (skipOverlayDueToTime) {
      finalBuffer = baseBuffer;
      overlayError = "Overlay skipped due to time limit";
      clearTimeout(logoTimeoutId);
    } else {
      try {
        finalBuffer = await composeTextOverlay(baseBuffer, {
          headline: brief.headline,
          subheadline: FAST_MODE ? undefined : brief.subheadline,
          cta: brief.cta,
          targetWidth: dims.width,
          targetHeight: dims.height,
          ctaColor,
          logoUrl,
          brandColors: !FAST_MODE && brandLock ? brandSpec.colors : undefined,
          brandLock: !FAST_MODE && brandLock,
          logoFetchSignal: logoUrl ? logoAbort.signal : undefined,
        });
      } catch (e) {
        overlayError = e instanceof Error ? e.message : String(e);
        finalBuffer = baseBuffer;
        if (e instanceof Error && e.name === "AbortError") {
          overlayError = "Logo fetch timeout";
        }
      }
      clearTimeout(logoTimeoutId);
    }

    const colorsApplied = !FAST_MODE && brandLock && brandSpec.colors.length > 0;
    const logoApplied = !FAST_MODE && brandLock && !!brandSpec.logoUrl && !overlayError;
    const visualBrandApplied = {
      colors: colorsApplied,
      logo: logoApplied,
      tone: !!brandSpec.toneOfVoice,
      layout: true,
    };
    const visualBrandWarnings: string[] = [];
    if (brandLock && brandSpec.colors.length === 0) visualBrandWarnings.push("Žádné brand barvy v intake");
    if (overlayError) {
      if (overlayError === "Overlay skipped due to time limit") {
        visualBrandWarnings.push("Overlay byl vynechán z důvodu časového limitu.");
      } else {
        visualBrandWarnings.push(`Overlay: ${overlayError}`);
      }
    }
    if (warningMessage) visualBrandWarnings.push(warningMessage);

    const timestamp = Date.now();
    const supabase = getSupabaseClient();
    const basePath = `drafts/${draftId}/${timestamp}_base.png`;
    const finalPath = `drafts/${draftId}/${timestamp}_final.png`;

    try {
      const { error: baseUploadError } = await withTimeout(
        (async () => {
          const r = await supabase.storage
            .from(VISUAL_BUCKET)
            .upload(basePath, baseBuffer, { contentType: "image/png", upsert: true });
          return r;
        })(),
        STAGE_STORAGE_MS,
        "storage_upload"
      );

      if (baseUploadError) {
        throw new Error(
          `[storage_upload] Chyba při ukládání obrázku (bucket: ${VISUAL_BUCKET}): ${baseUploadError.message}|Zkontrolujte, že bucket "${VISUAL_BUCKET}" existuje a je public.`
        );
      }

      const { error: finalUploadError } = await withTimeout(
        (async () => {
          const r = await supabase.storage
            .from(VISUAL_BUCKET)
            .upload(finalPath, finalBuffer, { contentType: "image/png", upsert: true });
          return r;
        })(),
        STAGE_STORAGE_MS,
        "storage_upload"
      );

      if (finalUploadError) {
        throw new Error(
          `[storage_upload] Chyba při ukládání finálního obrázku: ${finalUploadError.message}|Zkontrolujte Supabase storage a oprávnění.`
        );
      }
    } catch (storageErr) {
      const msg = storageErr instanceof Error ? storageErr.message : String(storageErr);
      if (msg.includes("VISUAL_TIMEOUT")) {
        return visualFail(
          draftId,
          draft.payload,
          "Ukládání vizuálu překročilo časový limit.",
          "Zkuste znovu nebo vypněte Brand Lock.",
          "VISUAL_TIMEOUT"
        );
      }
      throw storageErr;
    }

    const baseUrl = supabase.storage.from(VISUAL_BUCKET).getPublicUrl(basePath).data.publicUrl;
    const finalUrl = supabase.storage.from(VISUAL_BUCKET).getPublicUrl(finalPath).data.publicUrl;

    await updateDraftPayload(draftId, {
      ...draft.payload,
      visualImageUrl: finalUrl,
      visualBaseImageUrl: baseUrl,
      visualStatus: "ready",
      visualPrompt: imagePrompt,
      visualCreativeBrief: brief,
      visualCreativeScore: criticScore > 0 ? criticScore : undefined,
      visualCriticNote: criticNote || undefined,
      visualFormat: formatKey,
      visualStyleId: resolvedStyle.visualStyleId,
      visualStyleLabel: resolvedStyle.visualStyleLabel,
      visualStyleSource: resolvedStyle.visualStyleSource,
      visualStyle: resolvedStyle.visualStyleId,
      brandContextApplied: resolvedStyle.brandContextApplied,
      processingMode,
      processingReason,
      processingStartedAt: processingStartedAt,
      processingFinishedAt: new Date().toISOString(),
      strategyId: strategy?.id ?? draft.payload.strategyId,
      visualStrategyId: strategy?.id,
      visualStrategySource,
      visualStyleLocked: b.lockStyle === true,
      visualBrandApplied,
      visualBrandWarnings: visualBrandWarnings.length ? visualBrandWarnings : undefined,
      visualError: undefined,
      visualUpdatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      visualImageUrl: finalUrl,
      visualBaseImageUrl: baseUrl,
      visualCreativeScore: criticScore > 0 ? criticScore : undefined,
      visualCriticNote: criticNote || undefined,
      visualFormat: formatKey,
      visualStyleId: resolvedStyle.visualStyleId,
      visualStyleLabel: resolvedStyle.visualStyleLabel,
      visualStyleSource: resolvedStyle.visualStyleSource,
      brandContextApplied: resolvedStyle.brandContextApplied,
      processingMode,
      processingReason,
      brandApplied: visualBrandApplied,
      brandWarnings: visualBrandWarnings,
      visualStrategyId: strategy?.id,
      visualStrategySource,
    });
    } catch (strictErr) {
      if (elapsed() > HARD_GUARD_ELAPSED_MS) {
        return visualFail(
          draftId,
          draft.payload,
          "Časový limit překročen před dokončením.",
          "Zkuste znovu nebo vypněte Brand Lock.",
          "VISUAL_TIMEOUT"
        );
      }
      const msg = strictErr instanceof Error ? strictErr.message : String(strictErr);
      const pipeIdx = msg.indexOf("|");
      const detailPart = pipeIdx >= 0 ? msg.slice(0, pipeIdx).replace(/^\[[\w_]+\]\s*/, "").trim() : msg;
      const hintPart =
        pipeIdx >= 0 ? msg.slice(pipeIdx + 1).trim() : "Zkuste znovu nebo vypněte Brand Lock.";

      try {
        const resp = await withTimeout(
          openai.images.generate({
            model: IMAGE_MODEL,
            prompt: imagePrompt,
            n: 1,
            size,
          }),
          Math.min(STAGE_IMAGE_MS, HARD_GUARD_ELAPSED_MS - elapsed()),
          "fallback_image"
        );
        const b64 = resp.data?.[0]?.b64_json;
        if (typeof b64 !== "string" || !b64) throw new Error("OpenAI nevrátilo obrázek");
        const fallbackBaseBuffer = Buffer.from(b64, "base64");
        let fallbackFinalBuffer: Buffer = fallbackBaseBuffer;
        try {
          const withOverlay = await composeTextOverlay(Buffer.from(fallbackBaseBuffer), {
            headline: brief.headline,
            subheadline: brief.subheadline,
            cta: brief.cta,
            targetWidth: dims.width,
            targetHeight: dims.height,
            logoUrl: undefined,
            brandLock: false,
          });
          fallbackFinalBuffer = Buffer.from(withOverlay);
        } catch {
          // keep base
        }
        const ts = Date.now();
        const supabaseFallback = getSupabaseClient();
        const basePathF = `drafts/${draftId}/${ts}_base.png`;
        const finalPathF = `drafts/${draftId}/${ts}_final.png`;
        const { error: be } = await supabaseFallback.storage
          .from(VISUAL_BUCKET)
          .upload(basePathF, fallbackBaseBuffer, { contentType: "image/png", upsert: true });
        if (be) throw new Error(be.message);
        const { error: fe } = await supabaseFallback.storage
          .from(VISUAL_BUCKET)
          .upload(finalPathF, fallbackFinalBuffer, { contentType: "image/png", upsert: true });
        if (fe) throw new Error(fe.message);
        const baseUrlF = supabaseFallback.storage.from(VISUAL_BUCKET).getPublicUrl(basePathF).data.publicUrl;
        const finalUrlF = supabaseFallback.storage.from(VISUAL_BUCKET).getPublicUrl(finalPathF).data.publicUrl;
        const fallbackWarn = "Použita zjednodušená generace (bez kritiky a loga).";
        await updateDraftPayload(draftId, {
          ...draft.payload,
          visualImageUrl: finalUrlF,
          visualBaseImageUrl: baseUrlF,
          visualStatus: "ready",
          visualPrompt: imagePrompt,
          visualFormat: formatKey,
          visualStyleId: resolvedStyle.visualStyleId,
          visualStyleLabel: resolvedStyle.visualStyleLabel,
          visualStyleSource: resolvedStyle.visualStyleSource,
          visualStyle: resolvedStyle.visualStyleId,
          brandContextApplied: resolvedStyle.brandContextApplied,
          visualBrandWarnings: [fallbackWarn],
          visualError: undefined,
          visualUpdatedAt: new Date().toISOString(),
        });
        return NextResponse.json({
          ok: true,
          visualImageUrl: finalUrlF,
          visualBaseImageUrl: baseUrlF,
          visualFormat: formatKey,
          fallbackUsed: true,
          warning: fallbackWarn,
          brandApplied: { colors: false, logo: false, tone: !!brandSpec.toneOfVoice, layout: true },
          brandWarnings: [fallbackWarn],
          visualStyleId: resolvedStyle.visualStyleId,
          visualStyleLabel: resolvedStyle.visualStyleLabel,
          visualStrategyId: strategy?.id,
          visualStrategySource,
        });
      } catch (fallbackErr) {
        const fd = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        const isTimeout = fd.includes("VISUAL_TIMEOUT");
        return visualFail(
          draftId,
          draft.payload,
          isTimeout ? "Časový limit překročen (i zjednodušená generace)." : `${detailPart}. Fallback: ${fd}`,
          isTimeout ? "Zkuste znovu nebo vypněte Brand Lock." : hintPart,
          isTimeout ? "VISUAL_TIMEOUT" : "VISUAL_GENERATION_FAILED"
        );
      }
    }
  } catch (e) {
    console.error("POST /api/visuals/generate", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json(
      { ok: false, error: "VISUAL_GENERATION_FAILED", detail: message, hint: "Zkuste to znovu nebo kontaktujte podporu." },
      { status: 500 }
    );
  }
}
