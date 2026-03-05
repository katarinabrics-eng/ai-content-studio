import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientProjectById, updateClientProject, updateClientProjectScanResult } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** PATCH: Aktualizuje name, manual_input, internal_notes (kurátor). internal_notes se ukládá do scan_result.admin_notes. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(id);
  if (!project) return NextResponse.json({ error: "Záznam nenalezen" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const updates: { name?: string | null; manual_input?: string | null } = {};
  if (typeof body.name === "string") updates.name = body.name.trim() || null;
  if (body.manual_input !== undefined) updates.manual_input = typeof body.manual_input === "string" ? body.manual_input : null;

  if (Object.keys(updates).length > 0) {
    const updated = await updateClientProject(id, updates);
    if (!updated) return NextResponse.json({ error: "Nepodařilo se aktualizovat" }, { status: 500 });
  }

  if (body.internal_notes !== undefined) {
    const notes = typeof body.internal_notes === "string" ? body.internal_notes : null;
    const freshForNotes = await getClientProjectById(id);
    const scanResult = (freshForNotes?.scan_result ?? project.scan_result ?? {}) as Record<string, unknown>;
    const merged = { ...scanResult, admin_notes: notes ?? null };
    const updatedScan = await updateClientProjectScanResult(id, { scan_result: merged });
    if (!updatedScan) return NextResponse.json({ error: "Nepodařilo se uložit poznámky" }, { status: 500 });
  }

  if (body.active_strategy_id !== undefined) {
    const activeId = body.active_strategy_id === null || body.active_strategy_id === "" ? null : (typeof body.active_strategy_id === "string" ? body.active_strategy_id : null);
    const freshForStrategy = await getClientProjectById(id);
    const scanResult = (freshForStrategy?.scan_result ?? project.scan_result ?? {}) as Record<string, unknown>;
    const merged = { ...scanResult, active_strategy_id: activeId };
    const updatedScan = await updateClientProjectScanResult(id, { scan_result: merged });
    if (!updatedScan) return NextResponse.json({ error: "Nepodařilo se uložit aktivní strategii" }, { status: 500 });
  }

  if (body.dashboard_section !== undefined) {
    const section = typeof body.dashboard_section === "string" ? body.dashboard_section : null;
    const freshForSection = await getClientProjectById(id);
    const scanResult = (freshForSection?.scan_result ?? project.scan_result ?? {}) as Record<string, unknown>;
    const merged = { ...scanResult, dashboard_section: section };
    const updatedScan = await updateClientProjectScanResult(id, { scan_result: merged });
    if (!updatedScan) return NextResponse.json({ error: "Nepodařilo se uložit sekci" }, { status: 500 });
  }

  const fresh = await getClientProjectById(id);
  return NextResponse.json({
    ok: true,
    project: fresh
      ? {
          name: fresh.name,
          manual_input: fresh.manual_input,
          internal_notes: (fresh.scan_result as Record<string, unknown>)?.admin_notes ?? null,
        }
      : null,
  });
}
