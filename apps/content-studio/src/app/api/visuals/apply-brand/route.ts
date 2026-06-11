import { NextResponse } from "next/server";
import { getIntakeByIdOrLast } from "@/lib/supabase-intake";
import { getDraftById, updateDraftPayload } from "@/lib/supabase-posts";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getBrandSpecFromIntake } from "@/lib/brand-spec";
import { composeTextOverlay } from "@/lib/visual-composer";
import { PLATFORM_FORMATS } from "@/lib/visual-generate-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const VISUAL_BUCKET = process.env.SUPABASE_VISUALS_BUCKET ?? "generated-visuals";
const LOGO_FETCH_TIMEOUT_MS = 2_000;

const PLATFORM_TO_FORMAT: Record<string, keyof typeof PLATFORM_FORMATS> = {
  instagram: "instagram-feed",
  facebook: "facebook-feed",
  linkedin: "linkedin-post",
};

function err(detail: string, hint: string, status = 500, error = "VISUAL_GENERATION_FAILED") {
  return NextResponse.json(
    { ok: false, error, detail, hint },
    { status }
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      draftId?: string;
      baseImageUrl?: string;
      brandLock?: boolean;
    };
    const draftId = typeof body.draftId === "string" ? body.draftId : null;
    const baseImageUrl = typeof body.baseImageUrl === "string" ? body.baseImageUrl.trim() : "";

    if (!draftId) {
      return NextResponse.json(
        { ok: false, error: "VISUAL_GENERATION_FAILED", detail: "Chybí draftId", hint: "Odešlete draftId v těle požadavku." },
        { status: 400 }
      );
    }
    if (!baseImageUrl) {
      return NextResponse.json(
        { ok: false, error: "VISUAL_GENERATION_FAILED", detail: "Chybí baseImageUrl", hint: "Odešlete baseImageUrl z předchozího volání generate-base." },
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

    const brandLock = body.brandLock !== false;
    const brandSpec = getBrandSpecFromIntake(intake as Record<string, unknown>);
    const platform = String(draft.payload.platform ?? "instagram");
    const formatKey = PLATFORM_TO_FORMAT[platform] ?? "instagram-feed";
    const dims = PLATFORM_FORMATS[formatKey as keyof typeof PLATFORM_FORMATS];
    const brief = (draft.payload as { visualCreativeBrief?: { headline?: string; cta?: string; subheadline?: string } }).visualCreativeBrief;
    const headline = String(draft.payload.hook ?? brief?.headline ?? "");
    const cta = String(draft.payload.cta ?? brief?.cta ?? "");
    const subheadline = brief?.subheadline;

    let baseBuffer: Buffer;
    try {
      const res = await fetch(baseImageUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arr = await res.arrayBuffer();
      baseBuffer = Buffer.from(arr);
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Nepodařilo se stáhnout base obrázek";
      return err(detail, "Zkontrolujte, že baseImageUrl je platná a veřejně dostupná.");
    }

    const logoAbort = new AbortController();
    const logoTimeoutId = setTimeout(() => logoAbort.abort(), LOGO_FETCH_TIMEOUT_MS);
    const ctaColor = brandLock && brandSpec.colors.length > 0 ? brandSpec.colors[0] : undefined;
    const logoUrl = brandLock ? brandSpec.logoUrl : undefined;
    const warnings: string[] = [];

    let finalBuffer: Buffer;
    try {
      finalBuffer = await composeTextOverlay(baseBuffer, {
        headline: headline || "Nabídka",
        subheadline,
        cta: cta || "Zjistit více",
        targetWidth: dims.width,
        targetHeight: dims.height,
        ctaColor,
        logoUrl,
        brandColors: brandLock ? brandSpec.colors : undefined,
        brandLock,
        logoFetchSignal: logoUrl ? logoAbort.signal : undefined,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (e instanceof Error && e.name === "AbortError") {
        warnings.push("Logo nebylo aplikováno (časový limit 2 s).");
      } else {
        warnings.push(`Overlay: ${msg}`);
      }
      finalBuffer = baseBuffer;
    }
    clearTimeout(logoTimeoutId);

    const timestamp = Date.now();
    const finalPath = `drafts/${draftId}/${timestamp}_final.png`;
    const supabase = getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(VISUAL_BUCKET)
      .upload(finalPath, finalBuffer, { contentType: "image/png", upsert: true });

    if (uploadError) {
      return err(
        `Chyba při ukládání finálního obrázku: ${uploadError.message}`,
        "Zkontrolujte Supabase storage a oprávnění."
      );
    }

    const finalVisualUrl = supabase.storage.from(VISUAL_BUCKET).getPublicUrl(finalPath).data.publicUrl;
    const baseUrl = draft.payload.visualBaseImageUrl ?? baseImageUrl;

    await updateDraftPayload(draftId, {
      ...draft.payload,
      visualImageUrl: finalVisualUrl,
      visualBaseImageUrl: baseUrl,
      visualStatus: "ready",
      visualError: undefined,
      visualBrandWarnings: warnings.length ? warnings : undefined,
      visualUpdatedAt: new Date().toISOString(),
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      finalVisualUrl,
      baseImageUrl: baseUrl,
      ...(warnings.length > 0 ? { warnings } : {}),
    });
  } catch (e) {
    console.error("POST /api/visuals/apply-brand", e);
    const detail = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json(
      { ok: false, error: "VISUAL_GENERATION_FAILED", detail, hint: "Zkuste to znovu nebo kontaktujte podporu." },
      { status: 500 }
    );
  }
}
