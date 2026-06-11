import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectById } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** GET: Seznam posledních aktivit projektu (max 10). */
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
    .from("project_activity")
    .select("id, type, message, seen_at, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[admin/projects/activity]", error);
    return NextResponse.json({ error: "Chyba načtení" }, { status: 500 });
  }

  return NextResponse.json({ activities: data ?? [] });
}

/** PATCH: Označit všechny aktivity projektu jako přečtené (seen_at = now()). */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  if (!projectId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("project_activity")
    .update({ seen_at: now })
    .eq("project_id", projectId)
    .is("seen_at", null);

  if (error) {
    console.error("[admin/projects/activity] PATCH", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
