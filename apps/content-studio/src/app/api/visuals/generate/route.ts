import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getIntakeByIdOrLast } from "@/lib/supabase-intake";
import { getDraftById, updateDraftPayload } from "@/lib/supabase-posts";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const BUCKET_GENERATED_VISUALS = "generated-visuals";
const IMAGE_MODEL = "gpt-image-1";

function buildImagePrompt(
  draft: { payload: Record<string, unknown> },
  intake: Record<string, unknown>
): string {
  const p = draft.payload;
  const toneOfVoice = String(intake.toneOfVoice ?? "").trim();
  const offers = String(intake.offers ?? "").trim();
  const targetAudience = String(intake.targetAudience ?? "").trim();
  const brandAssets = (intake.brandAssets ?? {}) as Record<string, unknown>;
  const colors = Array.isArray(brandAssets.colors)
    ? (brandAssets.colors as string[]).join(", ")
    : String(brandAssets.colors ?? "").trim();
  const fonts = Array.isArray(brandAssets.fonts)
    ? (brandAssets.fonts as string[]).join(", ")
    : String(brandAssets.fonts ?? "").trim();

  const parts: string[] = [];
  const visualBrief = String(p.visualBrief ?? "").trim();
  if (visualBrief) parts.push(visualBrief);
  const hook = String(p.hook ?? "").trim();
  if (hook) parts.push(`Hook: ${hook}`);
  const caption = String(p.caption ?? "").trim();
  if (caption) parts.push(`Caption: ${caption}`);
  if (toneOfVoice) parts.push(`Tone: ${toneOfVoice}`);
  if (offers) parts.push(`Offers: ${offers}`);
  if (targetAudience) parts.push(`Target audience: ${targetAudience}`);
  if (colors) parts.push(`Colors: ${colors}`);
  if (fonts) parts.push(`Fonts: ${fonts}`);
  parts.push("Clean composition, no text, no watermark, no logo overlay.");
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
    const draftId = typeof (body as { draftId?: unknown }).draftId === "string"
      ? (body as { draftId: string }).draftId
      : null;
    if (!draftId) {
      return NextResponse.json(
        { ok: false, error: "Chybí draftId" },
        { status: 400 }
      );
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json(
        { ok: false, error: "Draft nebyl nalezen" },
        { status: 404 }
      );
    }

    const intake = await getIntakeByIdOrLast(draft.intake_id);
    if (!intake) {
      return NextResponse.json(
        { ok: false, error: "Intake nebyl nalezen" },
        { status: 404 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY není nastaven" },
        { status: 500 }
      );
    }

    const imagePrompt = buildImagePrompt(draft, intake);

    try {
      await updateDraftPayload(draftId, {
        ...draft.payload,
        visualStatus: "generating",
        visualError: undefined,
      });
    } catch (e) {
      console.error("Chyba při nastavení visualStatus=generating:", e);
    }

    let base64Data: string;
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const resp = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });
      const first = resp.data?.[0];
      const b64 = first?.b64_json;
      if (typeof b64 !== "string" || !b64) {
        throw new Error("OpenAI nevrátilo obrázek (chybí b64_json)");
      }
      base64Data = b64;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Chyba při generování obrázku";
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
        { ok: false, error: errMsg },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(base64Data, "base64");
    const timestamp = Date.now();
    const path = `drafts/${draftId}/${timestamp}.png`;

    const supabase = getSupabaseClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_GENERATED_VISUALS)
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      const errMsg = `Chyba při ukládání obrázku: ${uploadError.message}`;
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
        { ok: false, error: errMsg },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_GENERATED_VISUALS)
      .getPublicUrl(path);
    const visualImageUrl = urlData?.publicUrl ?? "";

    await updateDraftPayload(draftId, {
      ...draft.payload,
      visualImageUrl,
      visualStatus: "ready",
      visualPrompt: imagePrompt,
      visualError: undefined,
      visualUpdatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      visualImageUrl,
    });
  } catch (e) {
    console.error("POST /api/visuals/generate", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
