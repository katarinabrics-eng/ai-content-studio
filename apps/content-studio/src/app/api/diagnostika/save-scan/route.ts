import { NextResponse } from "next/server";
import { createClientProject, updateClientProjectScanResult, updateClientProject, getClientProjectById } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Při update sloučí nový result s existujícím scan_result: brandScore, brandDna, summary přepíše; pillarAnalysis a suggested_strategists zachová, pokud nový result je nemá (např. po refine). */
function mergeScanResult(existing: Record<string, unknown>, incoming: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...existing };
  if (incoming.brandScore != null) merged.brandScore = incoming.brandScore;
  if (incoming.brandDna != null) merged.brandDna = incoming.brandDna;
  if (incoming.summary !== undefined) merged.summary = incoming.summary;
  const hasPillarAnalysis = incoming.pillarAnalysis && typeof incoming.pillarAnalysis === "object" && Object.keys(incoming.pillarAnalysis as object).length > 0;
  if (hasPillarAnalysis) merged.pillarAnalysis = incoming.pillarAnalysis;
  const hasSuggested = Array.isArray(incoming.suggested_strategists) && incoming.suggested_strategists.length > 0;
  if (hasSuggested) merged.suggested_strategists = incoming.suggested_strategists;
  return merged;
}

/** POST: Uloží nebo aktualizuje výsledek scanu v client_projects. Pokud je projectId, aktualizuje existující záznam (druhé uložení po refine) — merge zachová pilíře a doporučení stratégů. */
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
      const existingScan = (existing.scan_result ?? {}) as Record<string, unknown>;
      const mergedScan = mergeScanResult(existingScan, scanResult);
      const updated = await updateClientProjectScanResult(projectId, {
        scan_result: mergedScan,
        web_url: webUrl ?? undefined,
        manual_input: manualInput ?? undefined,
      });
      if (!updated) {
        return NextResponse.json({ error: "Nepodařilo se aktualizovat scan." }, { status: 500 });
      }
      if (name != null) {
        await updateClientProject(projectId, { name: name || null });
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
