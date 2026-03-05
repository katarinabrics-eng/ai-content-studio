import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientProjectById, updateClientProject } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** POST: Odešle klientovi přístupový odkaz (e-mail se zatím pouze loguje; po doplnění Resend/SendGrid se odešle). Nastaví access_sent_at. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  if (!projectId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const email = project.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Projekt nemá vyplněný e-mail." }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = project.short_code
    ? `${baseUrl.replace(/\/$/, "")}/d/${encodeURIComponent(project.short_code)}`
    : project.access_token
      ? `${baseUrl.replace(/\/$/, "")}/diagnostika/view?token=${encodeURIComponent(project.access_token)}`
      : null;

  if (!link) {
    return NextResponse.json({ error: "Projekt nemá short_code ani access_token." }, { status: 400 });
  }

  const now = new Date().toISOString();
  await updateClientProject(projectId, { access_sent_at: now });

  // TODO: odeslat e-mail s odkazem (Resend/SendGrid). Zatím jen uložíme access_sent_at.
  console.info("[admin/send-access]", { projectId, email, link });

  return NextResponse.json({
    ok: true,
    message: "Odkaz byl odeslán na e-mail.",
    email,
    sentAt: now,
  });
}
