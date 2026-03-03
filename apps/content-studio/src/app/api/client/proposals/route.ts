import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vrátí návrhy vybrané pro klienta (selected_for_client) podle kódu projektu. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.json({ ok: false, error: "Chybí kód projektu" }, { status: 400 });
    }
    const supabase = getSupabaseClient();
    const codeNorm = code.trim().toUpperCase().replace(/[\u2013\u2014\u2011]/g, "-");
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("project_code", codeNorm)
      .maybeSingle();
    if (projectError || !project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }
    const { data: rows, error } = await supabase
      .from("project_proposals")
      .select("id, format, hook, body, cta, hashtags, visual_brief, created_at")
      .eq("project_id", project.id)
      .eq("selected_for_client", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[client/proposals]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, proposals: rows ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[client/proposals]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
