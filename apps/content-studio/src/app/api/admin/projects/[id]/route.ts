import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getProjectById, getProjectFiles, getProjectWorkflowState, updateProjectStatus, deleteProject } from "@/lib/supabase-projects";
import { isProjectStatus, canTransition, type ProjectStatus } from "@/lib/project-status-engine";

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
  const archive = body?.archive === true;
  const status = typeof body.status === "string" ? body.status : null;

  const project = await getProjectById(id);
  if (!project) return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });

  const targetStatus = archive ? "CLOSED" : status;
  if (!targetStatus || !isProjectStatus(targetStatus)) {
    return NextResponse.json({ ok: false, error: archive ? "Neplatný požadavek" : "Neplatný status" }, { status: 400 });
  }
  if (!archive && !canTransition(project.status, targetStatus)) {
    return NextResponse.json({ ok: false, error: "Tento přechod stavu není povolen" }, { status: 400 });
  }
  const updated = await updateProjectStatus(id, targetStatus as ProjectStatus);
  if (!updated) return NextResponse.json({ ok: false, error: "Chyba při ukládání" }, { status: 500 });
  const refreshedProject = await getProjectById(id);
  return NextResponse.json({ ok: true, project: refreshedProject ?? updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
  try {
    await deleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/projects DELETE]", e);
    return NextResponse.json({ ok: false, error: "Chyba při mazání projektu." }, { status: 500 });
  }
}
