import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/client/rtg/onboarding/complete
 * Body: { code, token, web_url, interval_days, topics }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as {
      code?: string;
      token?: string;
      web_url?: string;
      interval_days?: 7 | 14 | 21 | 30;
      topics?: string[];
    };

    const { code, token, web_url, interval_days, topics } = body;

    if (!code?.trim() || !token?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Chybí code nebo token" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Ověř přístup
    const { data: projectData } = await supabase
      .from("client_projects")
      .select("id")
      .eq("short_code", code.trim())
      .eq("access_token", token.trim())
      .single();

    if (!projectData) {
      return NextResponse.json(
        { ok: false, error: "Neplatný přístup" },
        { status: 401 }
      );
    }

    const project = projectData as { id: string };
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("client_projects")
      .update({
        web_url: web_url ?? null,
        interval_days: interval_days ?? null,
        topics: topics ?? [],
        onboarding_completed: true,
        rtg_activated_at: now,
        updated_at: now,
      })
      .eq("id", project.id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Nepodařilo se uložit onboarding" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[rtg/onboarding/complete]", e);
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
