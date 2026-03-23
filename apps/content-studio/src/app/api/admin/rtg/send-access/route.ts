import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthed() {
  return cookies().get("admin_session")?.value === "1";
}

/**
 * POST /api/admin/rtg/send-access
 * Body: { project_id: string }
 * Odešle klientovi přístupový odkaz (nebo vygeneruje nový token).
 * TODO: napojit na e-mailový odesílač (Resend / SendGrid).
 */
export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { project_id?: string };
  const { project_id } = body;
  if (!project_id) return NextResponse.json({ error: "Chybí project_id" }, { status: 400 });

  const supabase = getSupabase();

  const { data: project } = await supabase
    .from("client_projects")
    .select("id, email, short_code, access_token, client_name")
    .eq("id", project_id)
    .single();

  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const p = project as {
    id: string;
    email: string | null;
    short_code: string | null;
    access_token: string | null;
    client_name: string | null;
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.CANONICAL_APP_URL ?? "https://app.lucifera.studio";
  const accessUrl = p.short_code && p.access_token
    ? `${appUrl}/client/${p.short_code}/rtg?token=${p.access_token}`
    : null;

  // TODO: odeslat e-mail přes Resend / SendGrid
  // await sendEmail({ to: p.email, subject: "Váš RTG přístup", body: accessUrl })

  console.log(`[send-access] ${p.client_name} <${p.email}> → ${accessUrl}`);

  return NextResponse.json({ ok: true, access_url: accessUrl });
}
