import { NextResponse } from "next/server";
import { getProjectById, updateProjectStatus } from "@/lib/supabase-projects";
import { isProjectStatus, canTransition } from "@/lib/project-status-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
  return NextResponse.json({ ok: true, project });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = typeof body.status === "string" ? body.status : null;
  if (!status || !isProjectStatus(status)) {
    return NextResponse.json({ ok: false, error: "Neplatný status" }, { status: 400 });
  }
  const project = await getProjectById(id);
  if (!project) return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
  if (!isProjectStatus(project.status)) return NextResponse.json({ ok: false, error: "Neplatný stav projektu" }, { status: 400 });
  if (!canTransition(project.status, status)) {
    return NextResponse.json({ ok: false, error: "Tento přechod stavu není povolen" }, { status: 400 });
  }
  const updated = await updateProjectStatus(id, status);
  if (!updated) return NextResponse.json({ ok: false, error: "Chyba při ukládání" }, { status: 500 });
  const refreshedProject = await getProjectById(id);
  return NextResponse.json({ ok: true, project: refreshedProject ?? updated });
}
