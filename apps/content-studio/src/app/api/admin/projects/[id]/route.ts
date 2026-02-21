import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getProjectById, getProjectFiles, getProjectWorkflowState, updateProjectStatus } from "@/lib/supabase-projects";
import { isProjectStatus, canTransition } from "@/lib/project-status-engine";

const CLIENT_PROJECTS_BUCKET = "client-projects";
const SIGNED_URL_EXPIRY_SEC = 3600; // 1 hour

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });

  const files = await getProjectFiles(id);
  const supabase = getSupabaseClient();
  const filesWithUrls = await Promise.all(
    files.map(async (f) => {
      const { data: signed } = await supabase.storage
        .from(CLIENT_PROJECTS_BUCKET)
        .createSignedUrl(f.storage_path, SIGNED_URL_EXPIRY_SEC);
      return {
        id: f.id,
        storage_path: f.storage_path,
        kind: f.kind,
        original_name: f.original_name,
        content_type: f.content_type,
        size_bytes: f.size_bytes,
        created_at: f.created_at,
        download_url: signed?.signedUrl ?? null,
      };
    })
  );

  const workflowState = await getProjectWorkflowState(id);
  return NextResponse.json({
    ok: true,
    project: { ...project, files: filesWithUrls, workflowState },
  });
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
