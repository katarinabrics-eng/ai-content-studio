import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getProjectById } from "@/lib/supabase-projects";
import {
  loadStrategistOutput,
  generateProposalsWithAI,
  type ProposalFormat,
} from "@/lib/proposal-generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_FORMATS: ProposalFormat[] = ["facebook", "instagram", "linkedin", "letak", "carousel"];

type ProposalRow = {
  id: string;
  project_id: string;
  format: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  visual_brief: string;
  selected_for_client: boolean;
  created_at: string;
  updated_at: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = getSupabaseClient();
    const { data: rows, error } = await supabase
      .from("project_proposals")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[proposals GET]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, proposals: (rows ?? []) as ProposalRow[] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[proposals GET]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const format = typeof (body as { format?: string }).format === "string"
      ? (body as { format: string }).format.toLowerCase()
      : null;

    if (!format || !VALID_FORMATS.includes(format as ProposalFormat)) {
      return NextResponse.json(
        { ok: false, error: "Neplatný formát. Použij: facebook, instagram, linkedin, letak, carousel" },
        { status: 400 }
      );
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const brief = project.brief as Record<string, unknown> | null;
    if (!brief) {
      return NextResponse.json({ ok: false, error: "Brief projektu nenalezen" }, { status: 400 });
    }

    const storagePrefix = (project as { storage_prefix?: string | null }).storage_prefix ?? null;
    const strategistOutput = await loadStrategistOutput(storagePrefix);

    const proposals = await generateProposalsWithAI(
      brief,
      strategistOutput,
      format as ProposalFormat
    );

    const supabase = getSupabaseClient();
    const insertRows = proposals.map((p) => ({
      project_id: projectId,
      format,
      hook: p.hook,
      body: p.body,
      cta: p.cta,
      hashtags: p.hashtags,
      visual_brief: p.visual_brief,
      selected_for_client: false,
      updated_at: new Date().toISOString(),
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("project_proposals")
      .insert(insertRows)
      .select("*");

    if (insertError) {
      console.error("[proposals POST] insert error:", insertError);
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      proposals: (inserted ?? []) as ProposalRow[],
      count: proposals.length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[proposals POST]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const proposalIds = (body as { proposalIds?: string[] }).proposalIds;
    const selectedForClient = (body as { selectedForClient?: boolean }).selectedForClient;

    if (!Array.isArray(proposalIds) || proposalIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Očekáváno pole proposalIds" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("project_proposals")
      .update({ selected_for_client: !!selectedForClient, updated_at: now })
      .eq("project_id", projectId)
      .in("id", proposalIds);

    if (updateError) {
      console.error("[proposals PATCH]", updateError);
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: selectedForClient ? "Návrhy přidány do výběru pro klienta" : "Návrhy odebrány z výběru",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[proposals PATCH]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
