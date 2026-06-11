import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectById } from "@/lib/supabase-client-projects";
import { BUCKET_PROJECT_ASSETS } from "@/lib/project-paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES = ["photos", "logos", "inspiration"] as const;
type Category = (typeof CATEGORIES)[number];

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** DELETE: Smazat podklad (záznam + soubor ve storage). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, assetId } = await params;
  if (!projectId || !assetId) return NextResponse.json({ error: "Missing id nebo assetId" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const supabase = getSupabaseClient();
  const { data: row, error: fetchError } = await supabase
    .from("project_assets")
    .select("id, storage_path")
    .eq("id", assetId)
    .eq("project_id", projectId)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Podklad nenalezen" }, { status: 404 });
  }

  const r = row as { id: string; storage_path: string };
  await supabase.storage.from(BUCKET_PROJECT_ASSETS).remove([r.storage_path]);

  const { error: deleteError } = await supabase.from("project_assets").delete().eq("id", assetId);

  if (deleteError) {
    console.error("[admin/projects/assets/assetId] delete row:", deleteError);
    return NextResponse.json({ error: "Nepodařilo se smazat záznam" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** PATCH: Změna kategorie. Body: { category: "photos" | "logos" | "inspiration" } */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, assetId } = await params;
  if (!projectId || !assetId) return NextResponse.json({ error: "Missing id nebo assetId" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const categoryRaw = (body?.category as string)?.trim();
  if (!categoryRaw || !CATEGORIES.includes(categoryRaw as Category)) {
    return NextResponse.json({ error: "Pošlete category: photos, logos nebo inspiration" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("project_assets")
    .update({ category: categoryRaw })
    .eq("id", assetId)
    .eq("project_id", projectId)
    .select("id, category")
    .single();

  if (error) {
    return NextResponse.json({ error: "Nepodařilo se aktualizovat" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, asset: data });
}
