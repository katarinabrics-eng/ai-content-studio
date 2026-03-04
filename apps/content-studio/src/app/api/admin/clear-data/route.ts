import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST: Vyčistí data podle scope.
 * Body: { scope: "client_projects" | "projects" | "all" }
 * Není vratné.
 */

/** Smaže všechny záznamy z tabulky. Tichě ignoruje tabulky co neexistují. */
async function deleteAll(
  supabase: ReturnType<typeof import("@/lib/supabase-server").getSupabaseClient>,
  table: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: rows, error: selErr } = await supabase.from(table).select("id");
    if (selErr) {
      // Tabulka pravděpodobně neexistuje – přeskočíme
      console.warn(`[clear-data] ${table} select:`, selErr.message);
      return { ok: true };
    }
    const ids = (rows ?? []).map((r: { id: string }) => r.id);
    const BATCH = 100;
    for (let i = 0; i < ids.length; i += BATCH) {
      const chunk = ids.slice(i, i + BATCH);
      if (chunk.length === 0) continue;
      const { error: delErr } = await supabase.from(table).delete().in("id", chunk);
      if (delErr) {
        console.error(`[clear-data] ${table} delete:`, delErr.message);
        return { ok: false, error: `Chyba při mazání ${table}: ${delErr.message}` };
      }
    }
    return { ok: true };
  } catch (e) {
    console.error(`[clear-data] ${table} exception:`, e);
    return { ok: true }; // Tichá chyba – pokračujeme
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const scope = body?.scope as string;
    if (!["client_projects", "projects", "all"].includes(scope)) {
      return NextResponse.json(
        { ok: false, error: "Neplatný scope. Použijte: client_projects, projects, all." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    if (scope === "client_projects" || scope === "all") {
      // Smaž diagnostiky (bookings, analysis_leads nemají FK na client_projects – OK)
      const r = await deleteAll(supabase, "client_projects");
      if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
    }

    if (scope === "projects" || scope === "all") {
      // Nejdřív child tabulky (mají FK → projects), pak projects samotné
      const childTables = [
        "content_notification_log",
        "post_drafts",
        "content_posts",
        "project_proposals",
        "project_files",
        "project_brief",
        "project_admin_meta",    // nemusí existovat – deleteAll to zvládne
        "project_workflow_states", // nemusí existovat
      ];
      for (const table of childTables) {
        const r = await deleteAll(supabase, table);
        if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
      }
      // Teď smaž projekty
      const r = await deleteAll(supabase, "projects");
      if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
    }

    if (scope === "all") {
      // Lucifera tabulky (nemusí existovat)
      await deleteAll(supabase, "diagnostic_projects");
      await deleteAll(supabase, "clients");
      // Ostatní pomocné tabulky
      await deleteAll(supabase, "analysis_leads");
      await deleteAll(supabase, "bookings");
      await deleteAll(supabase, "intake_submissions");
    }

    return NextResponse.json({
      ok: true,
      message:
        scope === "all"
          ? "Vše smazáno (diagnostiky, projekty, leads, bookings)."
          : scope === "client_projects"
            ? "Diagnostiky smazány."
            : "Projekty smazány.",
    });
  } catch (e) {
    console.error("[admin/clear-data]", e);
    return NextResponse.json(
      { ok: false, error: "Chyba při čištění: " + (e instanceof Error ? e.message : String(e)) },
      { status: 500 }
    );
  }
}
