import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getContentPostsByProjectId } from "@/lib/content-posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?code=... – příspěvky projektu (pro klientský portál). Vrací jen ty ve client_review (ke schválení) nebo approved/published (pro přehled). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.json({ ok: false, error: "Chybí kód projektu" }, { status: 400 });
    }
    const supabase = getSupabaseClient();
    const { data: proj, error: eProj } = await supabase
      .from("projects")
      .select("id")
      .eq("project_code", code.toUpperCase())
      .single();
    if (eProj || !proj) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }
    const posts = await getContentPostsByProjectId((proj as { id: string }).id);
    return NextResponse.json({ ok: true, posts });
  } catch (e) {
    console.error("[client/content-posts]", e);
    return NextResponse.json({ error: "Chyba načtení" }, { status: 500 });
  }
}
