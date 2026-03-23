import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthed() {
  return cookies().get("admin_session")?.value === "1";
}

/**
 * GET /api/admin/rtg/tasks?status=new,in_progress
 * PATCH /api/admin/rtg/tasks/{id}/done — hotovo (přes query param id)
 */
export async function GET(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") ?? "new,in_progress";
  const statuses = statusParam.split(",").map((s) => s.trim()).filter(Boolean);

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("admin_tasks")
    .select("id, project_id, type, status, priority, note, created_at, client_projects(client_name, email)")
    .in("status", statuses)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tasks: data ?? [] });
}

export async function PATCH(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Chybí id" }, { status: 400 });

  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("admin_tasks")
    .update({ status: "done", updated_at: now })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
