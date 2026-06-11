import { NextResponse } from "next/server";
import { getContentPostById, updateContentPostStatus } from "@/lib/content-posts";
import { getProjectById } from "@/lib/supabase-projects";
import { notifyClientReady } from "@/lib/content-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET – detail příspěvku pro kurátora */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getContentPostById(id);
  if (!post) return NextResponse.json({ ok: false, error: "Příspěvek nenalezen" }, { status: 404 });
  const project = await getProjectById(post.project_id);
  return NextResponse.json({
    ok: true,
    post: {
      ...post,
      project_code: project?.project_code ?? null,
      client_email: project?.client_email ?? null,
    },
  });
}

/** PATCH – akce: approve_to_client | add_note */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { action?: string; curator_note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON" }, { status: 400 });
  }
  const post = await getContentPostById(id);
  if (!post) return NextResponse.json({ ok: false, error: "Příspěvek nenalezen" }, { status: 404 });

  if (body.action === "approve_to_client") {
    const updated = await updateContentPostStatus(id, "client_review");
    if (!updated) return NextResponse.json({ error: "Nepodařilo se aktualizovat" }, { status: 500 });
    const project = await getProjectById(post.project_id);
    const clientEmail = project?.client_email?.trim();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
    const approvalLink = baseUrl ? `${baseUrl}/client/${project?.project_code ?? ""}?tab=prispevky` : undefined;
    if (clientEmail) {
      await notifyClientReady({
        projectId: post.project_id,
        postId: id,
        clientEmail,
        scheduledDate: post.scheduled_for ?? undefined,
        approvalLink,
      });
    }
    return NextResponse.json({ ok: true, post: updated });
  }

  if (body.action === "add_note" && body.curator_note !== undefined) {
    const updated = await updateContentPostStatus(id, post.status, {
      curator_note: body.curator_note,
    });
    return NextResponse.json({ ok: true, post: updated ?? post });
  }

  return NextResponse.json({ error: "Neznámá akce" }, { status: 400 });
}
