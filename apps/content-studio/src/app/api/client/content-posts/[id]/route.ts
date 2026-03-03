import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getContentPostById, updateContentPostStatus } from "@/lib/content-posts";
import { notifyClientApproved, notifyClientRevision } from "@/lib/content-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Ověří, že příspěvek patří projektu s daným kódem; vrátí project_id nebo null */
async function getProjectIdByCode(code: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("project_code", code.toUpperCase())
    .single();
  return data ? (data as { id: string }).id : null;
}

/** PATCH – klient schválí nebo žádá úpravu (action: approve | revision, client_note?) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { code?: string; action?: string; client_note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON" }, { status: 400 });
  }
  const code = body.code?.trim();
  if (!code) return NextResponse.json({ error: "Chybí kód projektu" }, { status: 400 });
  const projectId = await getProjectIdByCode(code);
  if (!projectId) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const post = await getContentPostById(id);
  if (!post) return NextResponse.json({ error: "Příspěvek nenalezen" }, { status: 404 });
  if (post.project_id !== projectId) {
    return NextResponse.json({ error: "Příspěvek nepatří tomuto projektu" }, { status: 403 });
  }
  if (post.status !== "client_review") {
    return NextResponse.json({ error: "Příspěvek není ke schválení" }, { status: 400 });
  }

  if (body.action === "approve") {
    const updated = await updateContentPostStatus(id, "approved");
    if (!updated) return NextResponse.json({ error: "Nepodařilo se uložit" }, { status: 500 });
    await notifyClientApproved({
      projectId,
      postId: id,
      scheduledDate: post.scheduled_for ?? undefined,
    });
    return NextResponse.json({ ok: true, post: updated });
  }

  if (body.action === "revision" && body.client_note !== undefined) {
    const updated = await updateContentPostStatus(id, "curator_review", {
      client_note: body.client_note,
    });
    if (!updated) return NextResponse.json({ error: "Nepodařilo se uložit" }, { status: 500 });
    await notifyClientRevision({
      projectId,
      postId: id,
      clientNote: body.client_note,
    });
    return NextResponse.json({ ok: true, post: updated });
  }

  return NextResponse.json({ error: "Neznámá akce nebo chybí client_note" }, { status: 400 });
}
