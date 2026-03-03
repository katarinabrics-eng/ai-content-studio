import { NextResponse } from "next/server";
import { getClientProjectByAccessToken } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?token=... – vrací projekt pro zobrazení nástěnky. Pokud token neplatí nebo vypršel, vrací error. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token?.trim()) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const project = await getClientProjectByAccessToken(token.trim());

  if (!project) {
    const supabase = (await import("@/lib/supabase-server")).getSupabaseClient();
    const { data } = await supabase
      .from("client_projects")
      .select("access_expires_at")
      .eq("access_token", token.trim())
      .maybeSingle();
    const row = data as { access_expires_at: string | null } | null;
    const expiresAt = row?.access_expires_at ? new Date(row.access_expires_at).getTime() : 0;
    const expired = expiresAt > 0 && Date.now() > expiresAt;
    return NextResponse.json(
      { ok: false, error: expired ? "expired" : "not_found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    project: {
      id: project.id,
      scan_result: project.scan_result,
      access_expires_at: project.access_expires_at,
    },
  });
}
