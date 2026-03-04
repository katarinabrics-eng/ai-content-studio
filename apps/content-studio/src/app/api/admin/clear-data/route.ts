import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST: Vyčistí data podle scope.
 * Body: { scope: "client_projects" | "projects" | "all" }
 * - client_projects: smaže všechny záznamy z diagnostiky (scan + platba)
 * - projects: smaže všechny AI projekty (cascade smaže související tabulky)
 * - all: obojí
 * Není vratné.
 */
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

    const BATCH = 100;

    if (scope === "client_projects" || scope === "all") {
      const { data: rows } = await supabase.from("client_projects").select("id");
      const ids = (rows ?? []).map((r: { id: string }) => r.id);
      for (let i = 0; i < ids.length; i += BATCH) {
        const chunk = ids.slice(i, i + BATCH);
        const { error } = await supabase.from("client_projects").delete().in("id", chunk);
        if (error) {
          console.error("[admin/clear-data] client_projects", error);
          return NextResponse.json(
            { ok: false, error: "Chyba při mazání diagnostik: " + (error.message || "neznámá chyba") },
            { status: 500 }
          );
        }
      }
    }

    if (scope === "projects" || scope === "all") {
      const { data: rows } = await supabase.from("projects").select("id");
      const ids = (rows ?? []).map((r: { id: string }) => r.id);
      for (let i = 0; i < ids.length; i += BATCH) {
        const chunk = ids.slice(i, i + BATCH);
        const { error } = await supabase.from("projects").delete().in("id", chunk);
        if (error) {
          console.error("[admin/clear-data] projects", error);
          return NextResponse.json(
            { ok: false, error: "Chyba při mazání projektů: " + (error.message || "neznámá chyba") },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        scope === "all"
          ? "Diagnostiky i projekty smazány."
          : scope === "client_projects"
            ? "Diagnostiky smazány."
            : "Projekty smazány.",
    });
  } catch (e) {
    console.error("[admin/clear-data]", e);
    return NextResponse.json(
      { ok: false, error: "Chyba při čištění." },
      { status: 500 }
    );
  }
}
