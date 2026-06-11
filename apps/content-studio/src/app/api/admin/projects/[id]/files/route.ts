import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getProjectById, insertProjectFile } from "@/lib/supabase-projects";
import type { ProjectFileKind } from "@/lib/supabase-projects";
import { BUCKET_CLIENT_PROJECTS, fullPath, PATH } from "@/lib/project-paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CURATOR_KINDS: ProjectFileKind[] = ["strategy", "checklist", "visual", "presentation", "pdf"];

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const prefix = (project as { storage_prefix?: string | null }).storage_prefix;
    if (!prefix || typeof prefix !== "string") {
      return NextResponse.json(
        { ok: false, error: "Projekt nemá nastavenou složku (storage_prefix)." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kindRaw = formData.get("kind") as string | null;
    const kind = kindRaw && CURATOR_KINDS.includes(kindRaw as ProjectFileKind) ? (kindRaw as ProjectFileKind) : null;

    if (!file || !kind) {
      return NextResponse.json(
        { ok: false, error: "Očekáváno pole file a kind (strategy, checklist, visual, presentation, pdf)." },
        { status: 400 }
      );
    }

    const originalName = file.name || "soubor";
    const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : "";
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const storagePath = fullPath(prefix, `${PATH.curatorDir}/${kind}/${uniqueName}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";

    const supabase = getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_CLIENT_PROJECTS)
      .upload(storagePath, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error("[admin/projects/files] upload:", uploadError);
      return NextResponse.json(
        { ok: false, error: "Nepodařilo se nahrát soubor." },
        { status: 500 }
      );
    }

    await insertProjectFile({
      project_id: projectId,
      storage_path: storagePath,
      kind,
      original_name: safeFileName(originalName) !== uniqueName ? originalName : null,
      content_type: contentType,
      size_bytes: buffer.length,
    });

    return NextResponse.json({ ok: true, message: "Soubor nahrán." });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/projects/files]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
