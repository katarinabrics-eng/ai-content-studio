import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getClientProjectById, updateClientProjectScanResult } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

export type SavedStrategy = {
  id: string;
  name: string;
  content: string;
  created_at: string;
  strategist_id: string | null;
};

/** POST: Uloží aktuální strategic_plan jako pojmenovanou strategii do scan_result.saved_strategies. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const name = typeof (body as { name?: string }).name === "string"
    ? (body as { name: string }).name.trim()
    : "";

  if (!name) {
    return NextResponse.json({ ok: false, error: "Název strategie je povinný" }, { status: 400 });
  }

  const project = await getClientProjectById(id);
  if (!project) return NextResponse.json({ error: "Záznam nenalezen" }, { status: 404 });

  const scan = (project.scan_result ?? {}) as Record<string, unknown>;
  const currentPlan = typeof scan.strategic_plan === "string" ? scan.strategic_plan : "";
  if (!currentPlan) {
    return NextResponse.json({ ok: false, error: "Nejprve spusťte stratega, aby bylo co uložit" }, { status: 400 });
  }

  const existing = Array.isArray(scan.saved_strategies) ? (scan.saved_strategies as SavedStrategy[]) : [];
  const strategy: SavedStrategy = {
    id: randomUUID(),
    name,
    content: currentPlan,
    created_at: new Date().toISOString(),
    strategist_id: (typeof scan.strategist_id === "string" ? scan.strategist_id : null) ?? null,
  };

  const merged = {
    ...scan,
    saved_strategies: [...existing, strategy],
  };

  const updated = await updateClientProjectScanResult(id, { scan_result: merged });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Nepodařilo se uložit strategii" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, strategy });
}
