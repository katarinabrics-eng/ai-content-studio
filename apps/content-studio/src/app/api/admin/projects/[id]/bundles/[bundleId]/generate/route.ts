import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectById } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** POST: Spustí generování výstupu pro balíček. Nastaví status GENERUJE, volá existující API (Gamma / NotebookLM) podle output_type, po dokončení HOTOVO + output_url. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; bundleId: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, bundleId } = await params;
  if (!projectId || !bundleId) return NextResponse.json({ error: "Missing id nebo bundleId" }, { status: 400 });

  const project = await getClientProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const supabase = getSupabaseClient();
  const { data: bundle, error: fetchErr } = await supabase
    .from("strategy_bundles")
    .select("id, output_type, status")
    .eq("id", bundleId)
    .eq("project_id", projectId)
    .single();

  if (fetchErr || !bundle) {
    return NextResponse.json({ error: "Balíček nenalezen" }, { status: 404 });
  }

  const b = bundle as { id: string; output_type: string; status: string };
  if (b.status !== "PRIPRAVENY" && b.status !== "NAVRH") {
    return NextResponse.json({ error: "Balíček není ve stavu pro generování" }, { status: 400 });
  }

  await supabase
    .from("strategy_bundles")
    .update({ status: "GENERUJE" })
    .eq("id", bundleId)
    .eq("project_id", projectId);

  const cookieHeader = request.headers.get("cookie") ?? "";
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let outputUrl: string | null = null;
  if (b.output_type === "GAMMA") {
    try {
      const res = await fetch(`${base}/api/admin/diagnostika/${projectId}/generate-presentation`, {
        method: "POST",
        headers: { cookie: cookieHeader },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.gammaUrl) outputUrl = data.gammaUrl;
    } catch (e) {
      console.error("[bundles/generate] Gamma:", e);
    }
  }
  if (b.output_type === "NOTEBOOKLM") {
    try {
      await fetch(`${base}/api/admin/diagnostika/${projectId}/export-notebooklm`, {
        method: "POST",
        headers: { cookie: cookieHeader },
      });
    } catch (e) {
      console.error("[bundles/generate] NotebookLM:", e);
    }
  }

  await supabase
    .from("strategy_bundles")
    .update({ status: "HOTOVO", output_url: outputUrl })
    .eq("id", bundleId)
    .eq("project_id", projectId);

  return NextResponse.json({ ok: true, status: "HOTOVO", output_url: outputUrl });
}
