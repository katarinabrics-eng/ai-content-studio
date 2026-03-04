import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DELETE /api/admin/diagnostic-projects/[id] — smaže diagnostic_project záznám */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Chybí ID" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("diagnostic_projects")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[admin/diagnostic-projects] DELETE", error);
    return NextResponse.json(
      { ok: false, error: "Chyba při mazání: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

/** PATCH /api/admin/diagnostic-projects/[id] — archivuje (status → closed) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Chybí ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseClient();

  if (body?.archive === true) {
    const { error } = await supabase
      .from("diagnostic_projects")
      .update({ status: "closed" })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Chyba při archivaci: " + error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Neznámá akce" }, { status: 400 });
}
