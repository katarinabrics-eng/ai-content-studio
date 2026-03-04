import { NextResponse } from "next/server";
import { getProjectById, updateProjectBriefFields } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH: Aktualizuje preferred_style a/nebo brand_colors v project_brief. */
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
    const updates: { preferred_style?: string | null; brand_colors?: string | null } = {};

    if ("preferred_style" in body) {
      updates.preferred_style =
        typeof body.preferred_style === "string" ? body.preferred_style || null : null;
    }
    if ("brand_colors" in body) {
      updates.brand_colors =
        typeof body.brand_colors === "string" ? body.brand_colors || null : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, error: "Žádná pole ke změně (preferred_style, brand_colors)" },
        { status: 400 }
      );
    }

    const ok = await updateProjectBriefFields(id, updates);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Chyba při ukládání" }, { status: 500 });
    }

    const updated = await getProjectById(id);
    const brief = updated?.brief as { preferred_style?: string | null; brand_colors?: string | null } | null;
    return NextResponse.json({
      ok: true,
      preferred_style: brief?.preferred_style ?? null,
      brand_colors: brief?.brand_colors ?? null,
    });
  } catch (e) {
    console.error("[admin/projects/[id]/brief PATCH]", e);
    return NextResponse.json({ ok: false, error: "Chyba při ukládání briefu" }, { status: 500 });
  }
}
