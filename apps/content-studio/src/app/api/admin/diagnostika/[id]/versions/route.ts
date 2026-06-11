import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientProjectById, getPendingDiagnosticVersion, listDiagnosticVersions, getDiagnosticVersionById, acceptDiagnosticVersion, ignoreDiagnosticVersion } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** GET: Seznam verzí diagnostiky + pending verze pro projekt. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  if (!projectId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const [pending, versions] = await Promise.all([
    getPendingDiagnosticVersion(projectId),
    listDiagnosticVersions(projectId),
  ]);

  return NextResponse.json({
    pending: pending ? { id: pending.id, scan_result: pending.scan_result, created_at: pending.created_at } : null,
    versions: versions.map((v) => ({ id: v.id, created_at: v.created_at, status: v.status })),
  });
}

/** POST: Přijmout nebo ignorovat verzi. Body: { action: "accept" | "ignore", versionId: string } */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  if (!projectId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const action = body?.action === "accept" || body?.action === "ignore" ? body.action : null;
  const versionId = typeof body?.versionId === "string" ? body.versionId.trim() || null : null;

  if (!action || !versionId) {
    return NextResponse.json({ error: "Pošlete action: 'accept' nebo 'ignore' a versionId." }, { status: 400 });
  }

  const version = await getDiagnosticVersionById(versionId);
  if (!version || version.project_id !== projectId) {
    return NextResponse.json({ error: "Verze nenalezena nebo nepatří tomuto projektu." }, { status: 400 });
  }
  if (version.status !== "pending") {
    return NextResponse.json({ error: "Verze již byla zpracována." }, { status: 400 });
  }

  if (action === "accept") {
    const ok = await acceptDiagnosticVersion(versionId);
    if (!ok) return NextResponse.json({ error: "Nepodařilo se přijmout verzi." }, { status: 500 });
    return NextResponse.json({ ok: true, message: "Verze přijata." });
  }

  const ok = await ignoreDiagnosticVersion(versionId);
  if (!ok) return NextResponse.json({ error: "Nepodařilo se ignorovat verzi." }, { status: 500 });
  return NextResponse.json({ ok: true, message: "Verze ignorována." });
}
