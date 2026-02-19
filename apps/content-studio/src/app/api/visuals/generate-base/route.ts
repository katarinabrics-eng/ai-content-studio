import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getIntakeByIdOrLast } from "@/lib/supabase-intake";
import { getDraftById, updateDraftPayload } from "@/lib/supabase-posts";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getBrandSpecFromIntake } from "@/lib/brand-spec";
import { getStrategyById } from "@/lib/strategy-library";
import { pickStrategy } from "@/lib/strategy-picker";
import type { CreativeBrief } from "@/lib/visual-schema";
import { resolveVisualStyle } from "@/lib/visual-style-resolver";
import { CANONICAL_STYLE_IDS, normalizeStyleId, type VisualStyleId } from "@/lib/visual-style-presets";
import {
  buildCreativeBriefPrompt,
  buildPresetStyleImagePrompt,
  getOpenAISize,
  PLATFORM_FORMATS,
  type ResolvedStyleForPrompt,
} from "@/lib/visual-generate-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const VISUAL_BUCKET = process.env.SUPABASE_VISUALS_BUCKET ?? "generated-visuals";
const IMAGE_MODEL = "gpt-image-1";
const IMAGE_TIMEOUT_MS = 45_000;

const STYLE_PROFILES = [...CANONICAL_STYLE_IDS, "simby_product_ad", "brand_product_ad", "generic_saas", "minimal_clean"];

const PLATFORM_TO_FORMAT: Record<string, keyof typeof PLATFORM_FORMATS> = {
  instagram: "instagram-feed",
  facebook: "facebook-feed",
  linkedin: "linkedin-post",
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("VISUAL_TIMEOUT")), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

function err(detail: string, hint: string, status = 500, error = "VISUAL_GENERATION_FAILED") {
  return NextResponse.json(
    { ok: false, error, detail, hint },
    { status: status === 408 ? 408 : 500 }
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      draftId?: string;
      styleProfile?: string;
      brandLock?: boolean;
    };
    const draftId = typeof body.draftId === "string" ? body.draftId : null;
    if (!draftId) {
      return NextResponse.json(
        { ok: false, error: "VISUAL_GENERATION_FAILED", detail: "Chybí draftId", hint: "Odešlete draftId v těle požadavku." },
        { status: 400 }
      );
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json(
        { ok: false, error: "VISUAL_GENERATION_FAILED", detail: "Draft nebyl nalezen", hint: "Zkontrolujte, že draftId existuje." },
        { status: 404 }
      );
    }

    const intake = await getIntakeByIdOrLast(draft.intake_id);
    if (!intake) {
      return NextResponse.json(
        { ok: false, error: "VISUAL_GENERATION_FAILED", detail: "Intake nebyl nalezen", hint: "Přidružený intake byl smazán." },
        { status: 404 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { ok: false, error: "VISUAL_GENERATION_FAILED", detail: "OPENAI_API_KEY není nastaven", hint: "Nastavte OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const platform = String(draft.payload.platform ?? "instagram");
    const formatKey = (PLATFORM_TO_FORMAT[platform] ?? "instagram-feed") as keyof typeof PLATFORM_FORMATS;
    const brandSpec = getBrandSpecFromIntake(intake as Record<string, unknown>);
    const styleProfile = typeof body.styleProfile === "string" && STYLE_PROFILES.includes(body.styleProfile)
      ? body.styleProfile
      : undefined;
    const intakePayload = (intake as { payload?: unknown }).payload ?? (intake as Record<string, unknown>);
    const intakePayloadObj = (typeof intakePayload === "object" && intakePayload !== null ? intakePayload : {}) as Record<string, unknown>;
    const rawStyleId = (styleProfile as VisualStyleId) ?? "auto";
    const requestedStyleId = rawStyleId === "auto" ? "auto" : (normalizeStyleId(rawStyleId) as VisualStyleId);
    const { preset } = resolveVisualStyle({
      requestedStyleId,
      brandName: intakePayloadObj?.brandName as string | undefined,
      website: intakePayloadObj?.website as string | undefined,
    });
    const resolvedStyle: ResolvedStyleForPrompt = {
      palette: brandSpec.colors,
      moodKeywords: preset.promptDirectives,
      negativePrompt: preset.negativePrompt.join(", "),
      visualStyleId: preset.id,
      visualStyleLabel: preset.label,
      visualStyleSource: "preset",
      brandContextApplied: false,
    };
    const brandAssetsColors = (intakePayloadObj?.brandAssets as { colors?: string | string[] } | undefined)?.colors;
    const brandColors = Array.isArray(brandAssetsColors)
      ? brandAssetsColors
      : typeof brandAssetsColors === "string"
        ? [brandAssetsColors]
        : [];
    const tone = (intakePayloadObj?.toneOfVoice as string) || "profesionální, důvěryhodný";
    const visualStyleProfile = (intake as Record<string, unknown>).visualStyleProfile as Record<string, unknown> | null | undefined;

    let strategy: { visualDirectives?: string[] } | undefined;
    if (draft.payload.strategyId && getStrategyById(draft.payload.strategyId as import("@/lib/strategy-library").StrategyId)) {
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

    await updateDraftPayload(draftId, { ...draft.payload, visualStatus: "generating", visualError: undefined }).catch(() => {});

    const openai = new OpenAI({ apiKey: openaiKey });

    let brief: CreativeBrief;
    try {
      const briefPrompt = buildCreativeBriefPrompt(
        draft,
        intake as Record<string, unknown>,
        brandSpec,
        resolvedStyle,
        visualStyleProfile,
        strategy
      );
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
      const detail = e instanceof Error ? e.message : "Chyba při generování creative brief";
      await updateDraftPayload(draftId, { ...draft.payload, visualStatus: "error", visualError: detail, visualUpdatedAt: new Date().toISOString() }).catch(() => {});
      return err(detail, "Zkuste znovu; problém může být s draftem nebo AI modelem.");
    }

    const imagePrompt = buildPresetStyleImagePrompt(brief, preset, brandColors, tone);
    const size = getOpenAISize(formatKey);

    let b64: string;
    try {
      const resp = await withTimeout(
        openai.images.generate({ model: IMAGE_MODEL, prompt: imagePrompt, n: 1, size }),
        IMAGE_TIMEOUT_MS
      );
      const first = resp.data?.[0]?.b64_json;
      if (typeof first !== "string" || !first) {
        await updateDraftPayload(draftId, { ...draft.payload, visualStatus: "error", visualError: "OpenAI nevrátilo obrázek", visualUpdatedAt: new Date().toISOString() }).catch(() => {});
        return err("OpenAI nevrátilo obrázek", "Zkontrolujte OPENAI_API_KEY a model gpt-image-1.");
      }
      b64 = first;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await updateDraftPayload(draftId, { ...draft.payload, visualStatus: "error", visualError: "Časový limit generování obrázku.", visualUpdatedAt: new Date().toISOString() }).catch(() => {});
      if (msg.includes("VISUAL_TIMEOUT")) {
        return NextResponse.json(
          { ok: false, error: "VISUAL_TIMEOUT", detail: "Generování obrázku překročilo časový limit (45 s).", hint: "Zkuste znovu nebo vypněte Brand Lock." },
          { status: 408 }
        );
      }
      return err(msg, "Zkontrolujte OPENAI_API_KEY a dostupnost modelu.");
    }

    const baseBuffer = Buffer.from(b64, "base64");
    const timestamp = Date.now();
    const basePath = `drafts/${draftId}/${timestamp}_base.png`;
    const supabase = getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(VISUAL_BUCKET)
      .upload(basePath, baseBuffer, { contentType: "image/png", upsert: true });

    if (uploadError) {
      await updateDraftPayload(draftId, { ...draft.payload, visualStatus: "error", visualError: uploadError.message, visualUpdatedAt: new Date().toISOString() }).catch(() => {});
      return err(
        `Chyba při ukládání obrázku: ${uploadError.message}`,
        `Zkontrolujte bucket "${VISUAL_BUCKET}" a oprávnění.`
      );
    }

    const baseImageUrl = supabase.storage.from(VISUAL_BUCKET).getPublicUrl(basePath).data.publicUrl;

    await updateDraftPayload(draftId, {
      ...draft.payload,
      visualBaseImageUrl: baseImageUrl,
      visualCreativeBrief: brief,
      visualPrompt: imagePrompt,
      visualFormat: formatKey,
      visualUpdatedAt: new Date().toISOString(),
    }).catch(() => {});

    return NextResponse.json({ ok: true, baseImageUrl });
  } catch (e) {
    console.error("POST /api/visuals/generate-base", e);
    const detail = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json(
      { ok: false, error: "VISUAL_GENERATION_FAILED", detail, hint: "Zkuste to znovu nebo kontaktujte podporu." },
      { status: 500 }
    );
  }
}
