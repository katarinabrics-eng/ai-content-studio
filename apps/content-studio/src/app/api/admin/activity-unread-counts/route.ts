import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** GET: Celkový počet nepřečtených aktivit a počet po projektech (seen_at IS NULL). */
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("project_activity")
    .select("project_id")
    .is("seen_at", null);

  if (error) {
    console.error("[admin/activity-unread-counts]", error);
    return NextResponse.json({ total: 0, byProject: {} });
  }

  const byProject: Record<string, number> = {};
  for (const row of data ?? []) {
    const pid = (row as { project_id: string }).project_id;
    byProject[pid] = (byProject[pid] ?? 0) + 1;
  }
  const total = (data ?? []).length;

  return NextResponse.json({ total, byProject });
}
