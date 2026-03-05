import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectById } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OUTPUT_TYPES = ["GAMMA", "CANVA", "NOTEBOOKLM", "CUSTOM"] as const;
type OutputType = (typeof OUTPUT_TYPES)[number];

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** GET: Seznam balíčků projektu. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  if (!projectId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("strategy_bundles")
    .select("id, project_id, name, output_type, status, strategy_label, created_at, output_url")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/projects/bundles] list:", error);
    return NextResponse.json({ error: "Chyba načtení" }, { status: 500 });
  }

  return NextResponse.json({ bundles: data ?? [] });
}

/** POST: Vytvořit balíček. Body: { name: string, output_type: "GAMMA"|"CANVA"|"NOTEBOOKLM"|"CUSTOM", strategy_label?: string }. Snapshot DNA a aktivní strategie se uloží z projektu. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  if (!projectId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : null;
  const outputTypeRaw = body?.output_type;
  const outputType: OutputType | null = OUTPUT_TYPES.includes(outputTypeRaw) ? outputTypeRaw : null;
  const strategyLabel = typeof body?.strategy_label === "string" ? body.strategy_label.trim() || null : null;

  if (!name) return NextResponse.json({ error: "Pošlete name (název balíčku)." }, { status: 400 });
  if (!outputType) return NextResponse.json({ error: "Pošlete output_type: GAMMA, CANVA, NOTEBOOKLM nebo CUSTOM." }, { status: 400 });

  const scan = (project.scan_result ?? {}) as Record<string, unknown>;
  const snapshotDna = scan.brandDna ?? null;
  const activeId = (scan.active_strategy_id as string) ?? null;
  const savedStrategies = (scan.saved_strategies as Array<{ id: string; [k: string]: unknown }>) ?? [];
  const activeStrategy = activeId ? savedStrategies.find((s) => s.id === activeId) ?? null : null;
  const snapshotStrategy = activeStrategy ? { id: activeStrategy.id, name: activeStrategy.name, content: activeStrategy.content, ...activeStrategy } : null;

  const supabase = getSupabaseClient();
  const { data: inserted, error: insertError } = await supabase
    .from("strategy_bundles")
    .insert({
      project_id: projectId,
      name,
      output_type: outputType,
      status: "NAVRH",
      strategy_label: strategyLabel ?? null,
      snapshot_dna: snapshotDna,
      snapshot_strategy: snapshotStrategy,
    })
    .select("id, name, output_type, status, strategy_label, created_at")
    .single();

  if (insertError) {
    console.error("[admin/projects/bundles] insert:", insertError);
    return NextResponse.json({ error: "Nepodařilo se vytvořit balíček" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, bundle: inserted });
}
