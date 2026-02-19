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

function validateStartPayload(body: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string; status: number } {
  const plan_id = str(body.plan_id) || "basic";
  const brand_name = str(body.brand_name ?? body.brand);
  const industry = str(body.industry ?? body.obor);
  const communication_goal = str(body.communication_goal ?? body.cil);
  const sit = str(body.sit);
  const platforms: string[] = Array.isArray(body.platforms)
    ? (body.platforms as string[]).filter((x) => typeof x === "string" && x.trim())
    : sit ? (sit === "vse" ? ["instagram", "linkedin", "facebook"] : [sit]) : [];
  const tone_of_voice = str(body.tone_of_voice ?? body.tonalita);

  const missing: string[] = [];
  if (!brand_name) missing.push("Značka / název");
  if (!industry) missing.push("Obor");
  if (!communication_goal) missing.push("Cíl komunikace");
  if (!platforms.length) missing.push("Síť(e)");
  if (!tone_of_voice) missing.push("Tonalita");
  if (!plan_id) missing.push("Tarif");

  if (missing.length) {
    return { ok: false, error: `Chybí povinná pole: ${missing.join(", ")}`, status: 400 };
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim() : typeof body.client_email === "string" ? body.client_email.trim() : null;
  const client_email = emailRaw && zEmail(emailRaw) ? emailRaw : null;

  const website_or_profile = str(body.website_or_profile ?? body.web ?? "");
  const note = str(body.note ?? body.poznamka);

  const data = {
    plan_id,
    brand_name,
    industry,
    communication_goal,
    platforms,
    tone_of_voice,
    website_or_profile,
    client_email: client_email ?? undefined,
    note: note || undefined,
    target_audience: strOrNull(body.target_audience ?? body.cilova_skupina) ?? undefined,
    offers: strOrNull(body.offers ?? body.nabidky_produkty) ?? undefined,
    forbidden_words: strOrNull(body.forbidden_words ?? body.zakazana_slova) ?? undefined,
    preferred_style: strOrNull(body.preferred_style ?? body.preferovany_styl) ?? undefined,
    preferred_cta: strOrNull(body.preferred_cta ?? body.preferovana_cta) ?? undefined,
    logo_url: strOrNull(body.logo_url ?? (body.brand_assets as Record<string, unknown> | undefined)?.logo_url) ?? undefined,
    brand_colors: strOrNull(body.brand_colors ?? (body.brand_assets as Record<string, unknown> | undefined)?.barvy) ?? undefined,
    brand_fonts: strOrNull(body.brand_fonts ?? (body.brand_assets as Record<string, unknown> | undefined)?.fonty) ?? undefined,
    image_refs: strOrNull(body.image_refs ?? (body.brand_assets as Record<string, unknown> | undefined)?.obrazky) ?? undefined,
    source_url: strOrNull(body.source_url ?? body.url_pdf_autofill) ?? undefined,
    brand_pdf_url: strOrNull(body.brand_pdf_url) ?? undefined,
  };
  return { ok: true, data };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const payload = typeof body === "object" && body !== null ? body : {};

    const validated = validateStartPayload(payload as Record<string, unknown>);
    if (!validated.ok) {
      return NextResponse.json(
        { ok: false, error: validated.error },
        { status: validated.status }
      );
    }

    const { project, magicToken, projectCode, pin } = await createProject(validated.data as Parameters<typeof createProject>[0]);

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
      projectCode: projectCode ?? null,
      pin: pin ?? null,
      message: "Projekt vytvořen. Uložte si kód a PIN pro přístup.",
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    const errName = e instanceof Error ? e.name : "Error";
    console.error("[POST /api/start] failure:", errName, detail);
    if (e instanceof Error && e.stack) {
      console.error("[POST /api/start] stack:", e.stack);
    }
    return NextResponse.json(
      { ok: false, error: "Nepodařilo se vytvořit projekt.", detail },
      { status: 500 }
    );
  }
}
