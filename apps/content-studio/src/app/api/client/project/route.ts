import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getProjectByMagicToken } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') ?? ''
  const token = request.nextUrl.searchParams.get('token') ?? ''
  console.log('PROJECT ROUTE:', { code, hasToken: !!token, tokenLen: token.length })
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
  try {
    const { searchParams } = new URL(request.url);
    const code  = searchParams.get("code");
    const token = searchParams.get("token") ?? "";

    if (!code) {
      return NextResponse.json({ ok: false, error: "Chybí kód projektu" }, { status: 400, headers });
    }

    // 1. Pokud máme token → ověř přes magic_token_hash (vrátí project + brief)
    if (token) {
      const proj = await getProjectByMagicToken(token);
      if (proj && proj.project_code.toUpperCase() === code.toUpperCase()) {
        const brief = proj.brief;
        const rawAnalysis = brief?.raw_analysis ?? null;
        console.log('RAW ANALYSIS KEYS:', rawAnalysis ? Object.keys(rawAnalysis as Record<string, unknown>) : 'null')
        console.log('SCHEDULED IN RAW:', (rawAnalysis as Record<string, unknown>)?.scheduledPosts)
        const rawAnalysisWithDrafts = rawAnalysis ? {
          ...rawAnalysis,
          postDrafts: (rawAnalysis as Record<string, unknown>).postDrafts ?? {},
          postStatuses: (rawAnalysis as Record<string, unknown>).postStatuses ?? {},
          scheduledPosts: (rawAnalysis as Record<string, unknown>).scheduledPosts ?? [],
        } : null;
        console.log('DEBUG brief keys:', brief ? Object.keys(brief) : 'brief is null');
        console.log('DEBUG rawAnalysis v2:', typeof rawAnalysis, rawAnalysis ? Object.keys(rawAnalysis as Record<string, unknown>) : 'null');
        return NextResponse.json({
          ok: true,
          _ts: Date.now(),
          project: {
            id: proj.id,
            project_code: proj.project_code,
            plan_id: proj.plan_id,
            status: proj.status,
            client_name: brief?.brand_name ?? null,
            scan_result: rawAnalysisWithDrafts,
            pvi_active: false,
            rtg_plan: proj.rtg_plan ?? null,
            brief: brief ? { brand_name: brief.brand_name } : null,
          },
        }, { headers });
      }
    }

    // 2. Fallback: lookup jen podle project_code (bez auth — free/demo přístup)
    const supabase = getSupabaseClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        id,
        plan_id,
        status,
        rtg_plan,
        project_code,
        project_brief (
          brand_name,
          raw_analysis,
          archetype,
          color_palette,
          visual_style,
          industry,
          tone_of_voice,
          target_audience
        )
      `)
      .eq("project_code", code.toUpperCase())
      .single();

    if (error || !project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404, headers });
    }

    const brief = Array.isArray(project.project_brief)
      ? project.project_brief[0]
      : project.project_brief;

    const rawAnalysis = (brief as { raw_analysis?: unknown } | null)?.raw_analysis ?? null;
    const rawAnalysisWithDrafts = rawAnalysis ? {
      ...(rawAnalysis as Record<string, unknown>),
      postDrafts: (rawAnalysis as Record<string, unknown>).postDrafts ?? {},
      postStatuses: (rawAnalysis as Record<string, unknown>).postStatuses ?? {},
      scheduledPosts: (rawAnalysis as Record<string, unknown>).scheduledPosts ?? [],
    } : null;

    return NextResponse.json({
      ok: true,
      _ts: Date.now(),
      project: {
        id: project.id,
        project_code: project.project_code,
        plan_id: project.plan_id,
        status: project.status,
        client_name: (brief as { brand_name?: string } | null)?.brand_name ?? null,
        scan_result: rawAnalysisWithDrafts,
        pvi_active: false,
        rtg_plan: project.rtg_plan ?? null,
        brief: brief ? { brand_name: (brief as { brand_name?: string }).brand_name } : null,
      },
    }, { headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/client/project]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500, headers });
  }
}
