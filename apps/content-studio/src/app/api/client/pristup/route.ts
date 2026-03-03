import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Entry = { type: "diagnostika"; id: string; url: string; label: string } | { type: "project"; id: string; projectCode: string; url: string; label: string };
type CpRow = { id: string; short_code: string | null; access_token: string | null; access_expires_at: string | null; created_at: string };

/** POST: Vyhledá podle e-mailu client_projects a projects, vrací seznam odkazů (shortUrl pro diagnostiku, /client/[code] pro projekt). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
    if (!email) {
      return NextResponse.json({ ok: false, error: "Zadejte e-mail." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const origin = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") === "https" ? "https" : "http";
    const base = origin ? `${protocol}://${origin}` : "";

    const [cpRes, projRes] = await Promise.all([
      supabase.from("client_projects").select("id, short_code, access_token, access_expires_at, created_at").ilike("email", email),
      supabase.from("projects").select("id, project_code, client_email, created_at").ilike("client_email", email),
    ]);

    const entries: Entry[] = [];
    const now = Date.now();

    for (const row of cpRes.data ?? []) {
      const cp = row as CpRow;
      const expiresAt = cp.access_expires_at ? new Date(cp.access_expires_at).getTime() : 0;
      if (expiresAt > 0 && now > expiresAt) continue;
      const url = base && cp.short_code ? `${base}/d/${cp.short_code}` : base && cp.access_token ? `${base}/diagnostika/view?token=${encodeURIComponent(cp.access_token)}` : "";
      if (!url) continue;
      const created = cp.created_at ? new Date(cp.created_at).toLocaleDateString("cs-CZ", { day: "numeric", month: "2-digit", year: "numeric" }) : "";
      entries.push({ type: "diagnostika", id: cp.id, url, label: `Diagnostika ${created}` });
    }

    for (const row of projRes.data ?? []) {
      const p = row as { id: string; project_code: string | null; created_at?: string };
      const code = (p.project_code ?? "").trim();
      if (!code) continue;
      const url = `${base}/client/${encodeURIComponent(code)}`;
      const created = p.created_at ? new Date(p.created_at).toLocaleDateString("cs-CZ", { day: "numeric", month: "2-digit", year: "numeric" }) : "";
      entries.push({ type: "project", id: p.id, projectCode: code, url, label: `Projekt ${code}${created ? ` (${created})` : ""}` });
    }

    const redirectUrl = entries.length === 1 ? entries[0]!.url : undefined;
    return NextResponse.json({ ok: true, entries, redirectUrl });
  } catch (e) {
    console.error("[client/pristup]", e);
    return NextResponse.json({ ok: false, error: "Při vyhledávání došlo k chybě." }, { status: 500 });
  }
}
