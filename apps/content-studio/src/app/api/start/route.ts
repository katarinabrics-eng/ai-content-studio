import { NextResponse } from "next/server";
import { createProject } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zEmail = (v: unknown) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function strOrNull(v: unknown): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

/** Mapování z formuláře (české názvy) na DB pole (required + optional). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan_id = str(body.plan_id) || "basic";
    const brand_name = str(body.brand_name ?? body.brand);
    const industry = str(body.industry ?? body.obor);
    const communication_goal = str(body.communication_goal ?? body.cil);
    const sit = str(body.sit);
    const platforms: string[] = Array.isArray(body.platforms)
      ? (body.platforms as string[]).filter((x) => typeof x === "string" && x.trim())
      : sit ? (sit === "vse" ? ["instagram", "linkedin", "facebook"] : [sit]) : [];
    const tone_of_voice = str(body.tone_of_voice ?? body.tonalita);
    const website_or_profile = str(body.website_or_profile ?? body.web ?? "");
    const note = str(body.note ?? body.poznamka);
    const emailRaw = typeof body.email === "string" ? body.email.trim() : typeof body.client_email === "string" ? body.client_email.trim() : null;
    const client_email = emailRaw && zEmail(emailRaw) ? emailRaw : null;

    const { project, magicToken, projectCode, pin } = await createProject({
      plan_id,
      brand_name,
      industry,
      communication_goal,
      platforms,
      tone_of_voice,
      website_or_profile,
      client_email: client_email || undefined,
      note: note || undefined,
      target_audience: strOrNull(body.target_audience ?? body.cilova_skupina) ?? undefined,
      offers: strOrNull(body.offers ?? body.nabidky_produkty) ?? undefined,
      forbidden_words: strOrNull(body.forbidden_words ?? body.zakazana_slova) ?? undefined,
      preferred_style: strOrNull(body.preferred_style ?? body.preferovany_styl) ?? undefined,
      preferred_cta: strOrNull(body.preferred_cta ?? body.preferovana_cta) ?? undefined,
      logo_url: strOrNull(body.logo_url ?? body.brand_assets?.logo_url) ?? undefined,
      brand_colors: strOrNull(body.brand_colors ?? body.brand_assets?.barvy) ?? undefined,
      brand_fonts: strOrNull(body.brand_fonts ?? body.brand_assets?.fonty) ?? undefined,
      image_refs: strOrNull(body.image_refs ?? body.brand_assets?.obrazky) ?? undefined,
      source_url: strOrNull(body.source_url ?? body.url_pdf_autofill) ?? undefined,
      brand_pdf_url: strOrNull(body.brand_pdf_url) ?? undefined,
    });

    const baseUrl =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (magicToken) {
      const magicLinkUrl = `${baseUrl.replace(/\/$/, "")}/project?token=${encodeURIComponent(magicToken)}`;
      return NextResponse.json({
        ok: true,
        projectId: project.id,
        magicLinkUrl,
        message: "Projekt vytvořen. Odkaz jsme odeslali na email a zobrazíme ho níže.",
      });
    }

    return NextResponse.json({
      ok: true,
      projectId: project.id,
      projectCode,
      pin,
      message: "Projekt vytvořen. Uložte si kód a PIN pro přístup.",
    });
  } catch (e) {
    console.error("[/api/start]", e);
    return NextResponse.json(
      { ok: false, error: "Nepodařilo se vytvořit projekt." },
      { status: 500 }
    );
  }
}
