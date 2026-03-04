import { NextResponse } from "next/server";
import { createClientProject, updateClientProjectScanResult, getClientProjectById } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST: Uloží nebo aktualizuje výsledek scanu v client_projects. Pokud je projectId, aktualizuje existující záznam (druhé uložení po refine). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = typeof body?.projectId === "string" ? body.projectId.trim() || null : null;
    const webUrl = typeof body?.webUrl === "string" ? body.webUrl.trim() || null : null;
    const manualInput = typeof body?.manualInput === "string" ? body.manualInput.trim() || null : null;
    const name = typeof body?.name === "string" ? body.name.trim() || null : null;
    const email = typeof body?.email === "string" ? body.email.trim() || null : null;
    const result = body?.result;

    if (!result || typeof result !== "object") {
      return NextResponse.json({ error: "Chybí result (objekt scanu)." }, { status: 400 });
    }

    const scanResult = result as Record<string, unknown>;

    if (projectId) {
      const existing = await getClientProjectById(projectId);
      if (!existing) {
        return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
      }
      const updated = await updateClientProjectScanResult(projectId, {
        scan_result: scanResult,
        web_url: webUrl ?? undefined,
        manual_input: manualInput ?? undefined,
      });
      if (!updated) {
        return NextResponse.json({ error: "Nepodařilo se aktualizovat scan." }, { status: 500 });
      }
      return NextResponse.json({ ok: true, id: projectId });
    }

    const { id } = await createClientProject({
      web_url: webUrl,
      manual_input: manualInput,
      scan_result: scanResult,
      name: name ?? undefined,
      email: email ?? undefined,
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
