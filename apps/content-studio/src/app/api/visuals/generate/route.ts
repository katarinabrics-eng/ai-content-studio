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
import { scoreVisualFromB64 } from "@/lib/visual-score";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VISUAL_BUCKET = process.env.SUPABASE_VISUALS_BUCKET ?? "generated-visuals";
const IMAGE_MODEL = "gpt-image-1";
const CANDIDATE_COUNT = 3;
const MIN_SCORE = 8;

const STYLE_PROFILES = ["katarina_signature", "minimal_clean", "bold_growth"] as const;

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

function buildCreativeBriefPrompt(
  draft: { payload: Record<string, unknown> },
  intake: Record<string, unknown>,
  brandSpec: import("@/lib/brand-spec").BrandSpec,
  styleProfile?: string,
  visualStyleProfile?: Record<string, unknown> | null,
  strategy?: import("@/lib/strategy-library").StrategyPreset
): string {
  const p = draft.payload;
  const paletteNote = brandSpec.colors.length ? `Použij barvy z palety: ${brandSpec.colors.join(", ")}` : "";
  const toneNote = brandSpec.toneOfVoice ? `Mood/tón: ${brandSpec.toneOfVoice}` : "";
  const styleNote = styleProfile ? `Styl: ${styleProfile}` : "";
  const visualDirectivesNote = strategy?.visualDirectives?.length
    ? `Art direction: ${strategy.visualDirectives.join("; ")}`
    : "";
  return `Jsi art director. Na základě draftu a intake vytvoř creative brief pro vizuál.
Draft: platform=${p.platform}, hook=${p.hook}, caption=${p.caption}, cta=${p.cta}, visualBrief=${p.visualBrief}
Intake: toneOfVoice=${intake.toneOfVoice}, offers=${intake.offers}, targetAudience=${intake.targetAudience}
${paletteNote}
${toneNote}
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
  "headline": "hlavní nadpis (max 8 slov)",
  "subheadline": "podnadpis (volitelné)",
  "cta": "CTA text",
  "negativePrompt": "co NEPOUŽÍVAT: text v obraze, watermark, logo overlay, collage chaos, rušné pozadí"
}
Pravidla: žádný text v samotném obrázku (text overlay přijde zvlášť). Čistá, kampaně podobná kompozice.`;
}

function creativeBriefToImagePrompt(brief: CreativeBrief, brandSpec: import("@/lib/brand-spec").BrandSpec): string {
  const paletteStr = brandSpec.colors.length ? brandSpec.colors.join(", ") : brief.palette;
  const parts = [
    brief.concept,
    brief.shotType,
    brief.scene,
    brief.lighting,
    brief.composition,
    `Palette: ${paletteStr}`,
  ];
  if (brief.negativePrompt) {
    parts.push(`AVOID: ${brief.negativePrompt}`);
  }
  parts.push("Clean composition, no text, no watermark, no logo overlay, human-centric, campaign-like.");
  return parts.join(". ");
}

export async function POST(request: Request) {
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
    };
    const draftId = typeof b.draftId === "string" ? b.draftId : null;
    if (!draftId) {
      return NextResponse.json({ ok: false, error: "Chybí draftId" }, { status: 400 });
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ ok: false, error: "Draft nebyl nalezen" }, { status: 404 });
    }

    const intake = await getIntakeByIdOrLast(draft.intake_id);
    if (!intake) {
      return NextResponse.json({ ok: false, error: "Intake nebyl nalezen" }, { status: 404 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY není nastaven" },
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
    const styleProfile = typeof b.styleProfile === "string" && STYLE_PROFILES.includes(b.styleProfile as (typeof STYLE_PROFILES)[number])
      ? b.styleProfile
      : undefined;
    const visualStyleProfile = (intake as Record<string, unknown>).visualStyleProfile as Record<string, unknown> | null | undefined;

    const intakePayload = intake as Record<string, unknown>;
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
      const al = (intakePayload.awarenessLevel as string) ?? "problem_aware";
      const awarenessLevel: import("@/lib/strategy-library").AwarenessLevel =
        ["unaware", "problem_aware", "solution_aware", "product_aware", "most_aware"].includes(al) ? (al as import("@/lib/strategy-library").AwarenessLevel) : "problem_aware";
      const picked = pickStrategy({
        contentGoal: (intakePayload.contentGoal as "prodej" | "důvěra" | "edukace") ?? "edukace",
        platforms: (intakePayload.platforms as string[]) ?? [],
        targetAudience: String(intakePayload.targetAudience ?? ""),
        offers: String(intakePayload.offers ?? ""),
        toneOfVoice: String(intakePayload.toneOfVoice ?? ""),
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
      const briefPrompt = buildCreativeBriefPrompt(draft, intake as Record<string, unknown>, brandSpec, styleProfile, visualStyleProfile, strategy);
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
      try {
        await updateDraftPayload(draftId, {
          ...draft.payload,
          visualStatus: "error",
          visualError: errMsg,
          visualUpdatedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
      return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
    }

    const imagePrompt = creativeBriefToImagePrompt(brief, brandSpec);
    const size = getOpenAISize(formatKey);

    // Step B: Generate base image(s) - try up to CANDIDATE_COUNT, score, pick best
    let bestB64: string | null = null;
    let bestScore = 0;
    let lastError: Error | null = null;

    for (let i = 0; i < CANDIDATE_COUNT; i++) {
      try {
        const resp = await openai.images.generate({
          model: IMAGE_MODEL,
          prompt: imagePrompt,
          n: 1,
          size,
        });
        const first = resp.data?.[0];
        const b64 = first?.b64_json;
        if (typeof b64 !== "string" || !b64) continue;

        const scoreResult = await scoreVisualFromB64(b64, openaiKey);
        if (scoreResult) {
          const s = scoreResult.overall;
          if (s > bestScore) {
            bestScore = s;
            bestB64 = b64;
          }
          if (s >= MIN_SCORE) break;
        }
        if (!bestB64) bestB64 = b64;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }

    if (!bestB64) {
      const errMsg = lastError?.message ?? "OpenAI nevrátilo obrázek";
      try {
        await updateDraftPayload(draftId, {
          ...draft.payload,
          visualStatus: "error",
          visualError: errMsg,
          visualUpdatedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
      return NextResponse.json(
        { ok: false, error: errMsg, detail: "OpenAI nevrátilo obrázek", hint: "Zkontrolujte OPENAI_API_KEY a model gpt-image-1" },
        { status: 500 }
      );
    }

    const baseBuffer = Buffer.from(bestB64, "base64");

    const ctaColor = brandLock && brandSpec.colors.length > 0 ? brandSpec.colors[0] : undefined;
    const logoUrl = brandLock ? brandSpec.logoUrl : undefined;

    let finalBuffer: Buffer;
    try {
      finalBuffer = await composeTextOverlay(baseBuffer, {
        headline: brief.headline,
        subheadline: brief.subheadline,
        cta: brief.cta,
        targetWidth: dims.width,
        targetHeight: dims.height,
        ctaColor,
        logoUrl,
      });
    } catch (e) {
      finalBuffer = baseBuffer;
    }

    const visualBrandApplied = {
      colors: brandLock && brandSpec.colors.length > 0,
      logo: brandLock && !!brandSpec.logoUrl,
      tone: !!brandSpec.toneOfVoice,
      layout: true,
    };
    const visualBrandWarnings: string[] = [];
    if (brandLock && brandSpec.colors.length === 0) visualBrandWarnings.push("Žádné brand barvy v intake");

    const timestamp = Date.now();
    const supabase = getSupabaseClient();
    const basePath = `drafts/${draftId}/${timestamp}_base.png`;
    const finalPath = `drafts/${draftId}/${timestamp}_final.png`;

    const { error: baseUploadError } = await supabase.storage
      .from(VISUAL_BUCKET)
      .upload(basePath, baseBuffer, { contentType: "image/png", upsert: true });

    if (baseUploadError) {
      const errMsg = `Chyba při ukládání obrázku (bucket: ${VISUAL_BUCKET}): ${baseUploadError.message}`;
      try {
        await updateDraftPayload(draftId, {
          ...draft.payload,
          visualStatus: "error",
          visualError: errMsg,
          visualUpdatedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
      return NextResponse.json(
        { ok: false, error: errMsg, detail: `bucket: ${VISUAL_BUCKET}, ${baseUploadError.message}`, hint: "Zkontrolujte, že bucket existuje a je public" },
        { status: 500 }
      );
    }

    const { error: finalUploadError } = await supabase.storage
      .from(VISUAL_BUCKET)
      .upload(finalPath, finalBuffer, { contentType: "image/png", upsert: true });

    if (finalUploadError) {
      const errMsg = `Chyba při ukládání finálního obrázku: ${finalUploadError.message}`;
      try {
        await updateDraftPayload(draftId, {
          ...draft.payload,
          visualStatus: "error",
          visualError: errMsg,
          visualUpdatedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
      return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
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
      visualCreativeScore: bestScore > 0 ? bestScore : undefined,
      visualFormat: formatKey,
      visualStyle: styleProfile ?? strategy?.publicLabel ?? "default",
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
      visualCreativeScore: bestScore > 0 ? bestScore : undefined,
      visualFormat: formatKey,
      visualStyle: styleProfile ?? "default",
      brandApplied: visualBrandApplied,
      brandWarnings: visualBrandWarnings,
      visualStrategyId: strategy?.id,
      visualStrategySource,
    });
  } catch (e) {
    console.error("POST /api/visuals/generate", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
