import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProjectByMagicToken, getProjectBySessionToken } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token?.trim()) {
    const project = await getProjectByMagicToken(token.trim());
    if (!project) {
      return NextResponse.json({ ok: false, error: "Neplatný nebo expirovaný odkaz." }, { status: 401 });
    }
    return NextResponse.json({ ok: true, project: sanitize(project) });
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("project_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "Nejste přihlášeni." }, { status: 401 });
  }

  const project = await getProjectBySessionToken(sessionToken);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Session vypršela. Přihlaste se znovu (kód + PIN)." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, project: sanitize(project) });
}

function sanitize(p: { id: string; plan_id: string; status: string; created_at: string; updated_at: string; brief?: { brand_name?: string } | null }) {
  return {
    id: p.id,
    plan_id: p.plan_id,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at,
    brief: p.brief ?? null,
  };
}
