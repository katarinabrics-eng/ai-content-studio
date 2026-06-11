import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** GET: Celkový počet nepřečtených aktivit a po projektách (seen_at IS NULL). Per projekt: count a hasNewMessage. */
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("project_activity")
    .select("project_id, type")
    .is("seen_at", null);

  if (error) {
    console.error("[admin/activity-unread-counts]", error);
    return NextResponse.json({ total: 0, byProject: {} });
  }

  const byProject: Record<string, { count: number; hasNewMessage: boolean }> = {};
  for (const row of data ?? []) {
    const r = row as { project_id: string; type: string };
    const pid = r.project_id;
    if (!byProject[pid]) byProject[pid] = { count: 0, hasNewMessage: false };
    byProject[pid].count += 1;
    if (r.type === "new_message") byProject[pid].hasNewMessage = true;
  }
  const total = (data ?? []).length;

  return NextResponse.json({ total, byProject });
}
