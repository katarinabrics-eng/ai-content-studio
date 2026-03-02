import { NextResponse } from "next/server";
import { createClientProject } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST: Uloží výsledek scanu do client_projects. Volá se po zobrazení teaseru. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const webUrl = typeof body?.webUrl === "string" ? body.webUrl.trim() || null : null;
    const manualInput = typeof body?.manualInput === "string" ? body.manualInput.trim() || null : null;
    const result = body?.result;

    if (!result || typeof result !== "object") {
      return NextResponse.json({ error: "Chybí result (objekt scanu)." }, { status: 400 });
    }

    const { id } = await createClientProject({
      web_url: webUrl,
      manual_input: manualInput,
      scan_result: result as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[diagnostika/save-scan]", e);
    return NextResponse.json(
      { error: "Nepodařilo se uložit scan." },
      { status: 500 }
    );
  }
}
