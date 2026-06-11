import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

function generateShortCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateAccessToken() {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, email, web_url } = body as { name: string; email?: string; web_url?: string };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Jméno projektu je povinné" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("client_projects")
      .insert({
        name: name.trim(),
        email: email?.trim() || null,
        web_url: web_url?.trim() || null,
        workflow_status: "DIAG_AWAITING_CURATOR",
        scan_result: {},
        short_code: generateShortCode(),
        access_token: generateAccessToken(),
        access_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, id: (data as { id: string }).id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
