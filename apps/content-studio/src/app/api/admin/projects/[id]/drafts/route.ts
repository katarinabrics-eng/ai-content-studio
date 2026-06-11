import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { runDraftGeneration } from "@/lib/draft-generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DraftRow = {
  id: string;
  project_id: string;
  draft_index: number;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  platform: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const supabase = getSupabaseClient();

    const { data: drafts, error } = await supabase
      .from("project_drafts")
      .select("*")
      .eq("project_id", projectId)
      .order("draft_index", { ascending: true });

    if (error) {
      console.error("[drafts GET]", error);
    }

    return NextResponse.json({
      ok: true,
      drafts: (drafts ?? []) as DraftRow[],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[drafts GET]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const result = await runDraftGeneration(projectId, { targetStatus: "IN_PRODUCTION" });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
    }

    const supabase = getSupabaseClient();
    const { data: inserted } = await supabase
      .from("project_drafts")
      .select("*")
      .eq("project_id", projectId)
      .order("draft_index", { ascending: true });

    return NextResponse.json({
      ok: true,
      drafts: inserted ?? result.drafts,
      stored: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[drafts POST]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const body = await request.json().catch(() => ({}));
    const action = (body as { action?: string }).action;

    if (action === "mark_ready") {
      const supabase = getSupabaseClient();
      
      await supabase
        .from("project_drafts")
        .update({ status: "ready", updated_at: new Date().toISOString() })
        .eq("project_id", projectId);

      await supabase
        .from("projects")
        .update({ status: "DRAFT_READY", updated_at: new Date().toISOString() })
        .eq("id", projectId);

      return NextResponse.json({ ok: true, message: "Návrhy označeny jako připravené pro klienta" });
    }

    return NextResponse.json({ ok: false, error: "Neznámá akce" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[drafts PATCH]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
