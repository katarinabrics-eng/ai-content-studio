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

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();

  // RTG klienti = client_projects s plan IN (start, plus, pro)
  const { data: projects, error: projError } = await supabase
    .from("client_projects")
    .select("id, created_at, client_name, email, plan, interval_days, short_code, access_token, onboarding_completed")
    .in("plan", ["start", "plus", "pro"])
    .order("created_at", { ascending: false });

  if (projError) return NextResponse.json({ error: projError.message }, { status: 500 });
  if (!projects || projects.length === 0) return NextResponse.json({ clients: [] });

  const projectIds = projects.map((p: { id: string }) => p.id);

  // Pending posty (client_review nebo pending) per projekt
  const { data: pendingPosts } = await supabase
    .from("content_posts")
    .select("project_id")
    .in("project_id", projectIds)
    .in("status", ["client_review", "pending"]);

  // Pending tasky per projekt
  const { data: pendingTasks } = await supabase
    .from("admin_tasks")
    .select("project_id")
    .in("project_id", projectIds)
    .in("status", ["new", "in_progress"]);

  // Poslední batch per projekt
  const { data: lastBatches } = await supabase
    .from("content_batches")
    .select("project_id, week_start, week_label")
    .in("project_id", projectIds)
    .order("week_start", { ascending: false });

  // Seskup data per projekt
  const postsByProject = new Map<string, number>();
  for (const post of pendingPosts ?? []) {
    const p = post as { project_id: string };
    postsByProject.set(p.project_id, (postsByProject.get(p.project_id) ?? 0) + 1);
  }

  const tasksByProject = new Map<string, number>();
  for (const task of pendingTasks ?? []) {
    const t = task as { project_id: string };
    tasksByProject.set(t.project_id, (tasksByProject.get(t.project_id) ?? 0) + 1);
  }

  const lastBatchByProject = new Map<string, { week_start: string; week_label: string }>();
  for (const batch of lastBatches ?? []) {
    const b = batch as { project_id: string; week_start: string; week_label: string };
    if (!lastBatchByProject.has(b.project_id)) {
      lastBatchByProject.set(b.project_id, { week_start: b.week_start, week_label: b.week_label });
    }
  }

  const clients = projects.map((p: {
    id: string;
    created_at: string;
    client_name: string | null;
    email: string | null;
    plan: string | null;
    interval_days: number | null;
    short_code: string | null;
    access_token: string | null;
    onboarding_completed: boolean;
  }) => ({
    id: p.id,
    created_at: p.created_at,
    client_name: p.client_name ?? p.email ?? "—",
    email: p.email ?? "—",
    plan: p.plan ?? "start",
    interval_days: p.interval_days,
    short_code: p.short_code,
    access_token: p.access_token,
    onboarding_completed: p.onboarding_completed,
    pending_posts: postsByProject.get(p.id) ?? 0,
    pending_tasks: tasksByProject.get(p.id) ?? 0,
    last_batch: lastBatchByProject.get(p.id) ?? null,
  }));

  return NextResponse.json({ clients });
}
