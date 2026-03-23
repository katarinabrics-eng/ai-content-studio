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
 * POST /api/admin/rtg/generate
 * Body: { project_id: string }
 * Spustí generování nového batche pro RTG klienta.
 * TODO: napojit na skutečný generátor (Higgsfield pipeline).
 */
export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { project_id?: string };
  const { project_id } = body;
  if (!project_id) return NextResponse.json({ error: "Chybí project_id" }, { status: 400 });

  const supabase = getSupabase();

  const { data: project } = await supabase
    .from("client_projects")
    .select("id, client_name, plan, onboarding_completed")
    .eq("id", project_id)
    .single();

  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const p = project as { id: string; client_name: string | null; plan: string | null; onboarding_completed: boolean };

  if (!p.onboarding_completed) {
    return NextResponse.json({ error: "Klient nemá dokončený onboarding" }, { status: 400 });
  }

  // Vytvoř admin task pro generování
  const now = new Date().toISOString();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // pondělí
  const weekLabel = weekStart.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });

  const { error: taskError } = await supabase
    .from("admin_tasks")
    .insert({
      project_id: p.id,
      type: "generate_batch",
      status: "new",
      priority: "high",
      note: `Generovat batch pro ${p.client_name ?? p.id} — týden ${weekLabel}`,
      created_at: now,
      updated_at: now,
    });

  if (taskError) {
    return NextResponse.json({ error: "Nepodařilo se vytvořit task" }, { status: 500 });
  }

  console.log(`[generate] Spuštěno generování pro projekt ${p.id} (${p.client_name})`);

  return NextResponse.json({ ok: true });
}
