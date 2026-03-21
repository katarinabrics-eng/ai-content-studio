import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectByAccessToken } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH ?token=... — dokončí onboarding RTG klienta. */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token?.trim()) {
      return NextResponse.json({ ok: false, error: "Chybí token" }, { status: 401 });
    }

    const clientProject = await getClientProjectByAccessToken(token.trim());
    if (!clientProject) {
      return NextResponse.json(
        { ok: false, error: "Neplatný nebo expirovaný odkaz." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { web_url, interval, topics } = body as {
      web_url?: string;
      interval?: string;
      topics?: string[];
    };

    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("client_projects")
      .update({
        onboarding_completed: true,
        web_url: web_url ?? null,
        interval: interval ?? null,
        topics: topics ?? [],
        updated_at: now,
      })
      .eq("id", clientProject.id);

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
