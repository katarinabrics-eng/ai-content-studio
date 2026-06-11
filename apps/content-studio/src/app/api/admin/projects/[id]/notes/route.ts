import { NextResponse } from "next/server";
import { getProjectById, updateProjectInternalNotes } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH: Aktualizuje internal_notes projektu (project_admin_meta). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const internalNotes =
      body.internal_notes === undefined
        ? undefined
        : typeof body.internal_notes === "string"
          ? body.internal_notes
          : body.internal_notes === null
            ? null
            : undefined;

    if (internalNotes === undefined) {
      return NextResponse.json(
        { ok: false, error: "Chybí internal_notes (string | null)" },
        { status: 400 }
      );
    }

    const ok = await updateProjectInternalNotes(id, internalNotes);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Chyba při ukládání" }, { status: 500 });
    }

    const updated = await getProjectById(id);
    const notes =
      (updated?.admin_meta as { internal_notes?: string | null } | null)?.internal_notes ?? null;
    return NextResponse.json({ ok: true, internal_notes: notes });
  } catch (e) {
    console.error("[admin/projects/[id]/notes]", e);
    return NextResponse.json(
      { ok: false, error: "Chyba při ukládání poznámek" },
      { status: 500 }
    );
  }
}
