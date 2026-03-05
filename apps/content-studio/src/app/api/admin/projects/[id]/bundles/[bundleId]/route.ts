import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectById } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["NAVRH", "PRIPRAVENY", "GENERUJE", "HOTOVO"] as const;

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** PATCH: Změna stavu nebo názvu. Body: { status?: string, name?: string } */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; bundleId: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, bundleId } = await params;
  if (!projectId || !bundleId) return NextResponse.json({ error: "Missing id nebo bundleId" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const updates: { status?: string; name?: string } = {};
  if (typeof body?.status === "string" && STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    updates.status = body.status;
  }
  if (typeof body?.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Pošlete status nebo name." }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("strategy_bundles")
    .update(updates)
    .eq("id", bundleId)
    .eq("project_id", projectId)
    .select("id, status, name")
    .single();

  if (error) {
    return NextResponse.json({ error: "Nepodařilo se aktualizovat" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, bundle: data });
}
