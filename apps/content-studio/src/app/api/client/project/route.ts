import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Surrogate-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
  }
  try {
    const { searchParams } = new URL(request.url);
    const code  = searchParams.get("code");
    const token = searchParams.get("token") ?? "";

    if (!code) {
      return NextResponse.json({ ok: false, error: "Chybí kód projektu" }, { status: 400, headers });
    }

    // 1. Pokud máme token → ověř přes magic_token_hash (přímý DB lookup, bez singletonu)
    if (token) {
      const tokenHash = createHash('sha256').update(token.trim()).digest('hex')
      const freshClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )
      const { data: projRow } = await freshClient
        .from('projects')
        .select('*')
        .eq('magic_token_hash', tokenHash)
        .single()
      if (!projRow || (projRow.project_code ?? '').toUpperCase() !== code.toUpperCase()) {
        return NextResponse.json({ ok: false, error: 'Neplatný token' }, { status: 401, headers })
      }
      const { data: briefRows } = await freshClient
        .from('project_brief')
        .select('*')
        .eq('project_id', projRow.id)
        .order('updated_at', { ascending: false })
        .limit(1)
      const brief = briefRows?.[0] ?? null
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
          id: projRow.id,
          project_code: projRow.project_code,
          plan_id: projRow.plan_id,
          status: projRow.status,
          client_name: (brief as { brand_name?: string } | null)?.brand_name ?? null,
          scan_result: rawAnalysisWithDrafts,
          pvi_active: false,
          rtg_plan: projRow.rtg_plan ?? null,
          brief: brief ? { brand_name: (brief as { brand_name?: string }).brand_name } : null,
        },
      }, { headers });
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
