import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ ok: false, error: "Chybí kód projektu" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        id,
        plan_id,
        status,
        created_at,
        updated_at,
        project_code,
        project_brief (
          brand_name
        )
      `)
      .eq("project_code", code.toUpperCase())
      .single();

    if (error || !project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const brief = Array.isArray(project.project_brief) 
      ? project.project_brief[0] 
      : project.project_brief;

    return NextResponse.json({
      ok: true,
      project: {
        id: project.id,
        project_code: project.project_code,
        plan_id: project.plan_id,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        brief: brief ?? null,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/client/project]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
