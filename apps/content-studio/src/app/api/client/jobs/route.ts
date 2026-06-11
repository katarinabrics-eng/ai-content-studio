import { NextResponse } from "next/server";
import { validateToken } from "@/lib/supabase-client-access";
import { getClientJobsByClientId } from "@/lib/supabase-client-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?token=...&clientId=... – validate token and return jobs for client. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const clientId = searchParams.get("clientId");

  if (!token?.trim()) {
    return NextResponse.json({ ok: false, error: "Chybí token" }, { status: 400 });
  }

  const result = await validateToken(token.trim());
  if (!result) {
    return NextResponse.json(
      { ok: false, error: "Neplatný nebo expirovaný odkaz." },
      { status: 401 }
    );
  }

  const requestedId = clientId?.trim();
  if (requestedId && requestedId !== result.client.id) {
    return NextResponse.json({ ok: false, error: "Nemáte oprávnění." }, { status: 403 });
  }

  const jobs = await getClientJobsByClientId(result.client.id);
  return NextResponse.json({
    ok: true,
    jobs: jobs.map((j) => ({
      id: j.id,
      client_id: j.client_id,
      week_key: j.week_key,
      status: j.status,
      due_at: j.due_at,
      priority: j.priority,
      created_at: j.created_at,
      updated_at: j.updated_at,
    })),
  });
}
