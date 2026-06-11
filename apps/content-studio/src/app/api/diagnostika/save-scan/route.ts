import { NextResponse } from "next/server";
import { createClientProject, updateClientProjectScanResult, updateClientProject, getClientProjectById, getClientProjectByEmail, getClientProjectByEmailAndWeb, insertDiagnosticVersion } from "@/lib/supabase-client-projects";

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
  if (incoming.client_name !== undefined) merged.client_name = incoming.client_name;
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

    let baseUrl = "";
    try {
      baseUrl = new URL(request.url).origin;
    } catch {
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
      const scheme = request.headers.get("x-forwarded-proto") || "https";
      if (host) baseUrl = `${scheme}://${host}`;
    }

    const viewUrlFor = (project: { access_token: string | null } | null): string | undefined => {
      if (!baseUrl || !project?.access_token) return undefined;
      return `${baseUrl}/diagnostika/view?token=${encodeURIComponent(project.access_token)}`;
    };

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
      const projectUpdates: { name?: string | null; email?: string | null; web_url?: string | null } = {};
      if (name != null) projectUpdates.name = name || null;
      if (email != null) projectUpdates.email = email || null;
      if (webUrl != null) projectUpdates.web_url = webUrl || null;
      if (Object.keys(projectUpdates).length > 0) {
        await updateClientProject(projectId, projectUpdates);
      }
      const fresh = await getClientProjectById(projectId);
      return NextResponse.json({ ok: true, id: projectId, viewUrl: viewUrlFor(fresh) });
    }

    if (email?.trim()) {
      const existingByEmailAndWeb = await getClientProjectByEmailAndWeb(email.trim(), webUrl ?? null);
      if (existingByEmailAndWeb) {
        await insertDiagnosticVersion(existingByEmailAndWeb.id, scanResult);
        const fresh = await getClientProjectById(existingByEmailAndWeb.id);
        return NextResponse.json({ ok: true, id: existingByEmailAndWeb.id, viewUrl: viewUrlFor(fresh), newVersionSaved: true });
      }
      const existingByEmail = await getClientProjectByEmail(email.trim());
      if (existingByEmail) {
        const existingScan = (existingByEmail.scan_result ?? {}) as Record<string, unknown>;
        const mergedScan = mergeScanResult(existingScan, scanResult);
        const updated = await updateClientProjectScanResult(existingByEmail.id, {
          scan_result: mergedScan,
          web_url: webUrl ?? undefined,
          manual_input: manualInput ?? undefined,
        });
        if (!updated) {
          return NextResponse.json({ error: "Nepodařilo se aktualizovat scan." }, { status: 500 });
        }
        if (name != null) {
          await updateClientProject(existingByEmail.id, { name: name || null });
        }
        const fresh = await getClientProjectById(existingByEmail.id);
        return NextResponse.json({ ok: true, id: existingByEmail.id, viewUrl: viewUrlFor(fresh) });
      }
    }

    const { id } = await createClientProject({
      web_url: webUrl,
      manual_input: manualInput,
      scan_result: scanResult,
      name: name ?? undefined,
      email: email ?? undefined,
    });

    const fresh = await getClientProjectById(id);
    return NextResponse.json({ ok: true, id, viewUrl: viewUrlFor(fresh) });
  } catch (e) {
    console.error("[diagnostika/save-scan]", e);
    return NextResponse.json(
      { error: "Nepodařilo se uložit scan." },
      { status: 500 }
    );
  }
}
