import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { normalizeStartForm, validateRequiredBrief } from "@/lib/brief-normalizer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = ["PAID", "WAITING_BRIEF"];

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code?.trim()) {
      return NextResponse.json({ ok: false, error: "Chybí kód projektu" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const brief = normalizeStartForm(body as Record<string, unknown>);
    const validation = validateRequiredBrief(brief);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: "Chybějící pole", missing: validation.missing },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("id, status")
      .eq("project_code", code.toUpperCase())
      .single();

    if (projError || !project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const proj = project as { id: string; status: string };
    if (!ALLOWED_STATUSES.includes(proj.status)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Dotazník lze odeslat pouze ve stavu Čeká na dotazník. Aktuální stav: ${proj.status}`,
        },
        { status: 400 }
      );
    }

    const { error: briefError } = await supabase
      .from("project_brief")
      .update({
        brand_name: brief.brand_name,
        industry: brief.industry,
        communication_goal: brief.communication_goal,
        platforms: brief.platforms,
        tone_of_voice: brief.tone_of_voice,
        website_or_profile: brief.website_or_profile,
        client_email: brief.client_email,
        note: brief.note,
        target_audience: brief.target_audience,
        offers: brief.offers,
        forbidden_words: brief.forbidden_words,
        preferred_style: brief.preferred_style,
        preferred_cta: brief.preferred_cta,
        logo_url: brief.logo_url,
        brand_colors: brief.brand_colors,
        brand_fonts: brief.brand_fonts,
        image_refs: brief.image_refs,
        source_url: brief.source_url,
        brand_pdf_url: brief.brand_pdf_url,
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", proj.id);

    if (briefError) {
      console.error("[client/brief]", briefError);
      return NextResponse.json({ ok: false, error: "Chyba při ukládání dotazníku" }, { status: 500 });
    }

    await supabase
      .from("projects")
      .update({
        status: "WAITING_MANUAL_AI_COMMAND",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proj.id);

    return NextResponse.json({
      ok: true,
      message: "Dotazník byl odeslán. Čekáme na interní zpracování.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[client/brief]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
