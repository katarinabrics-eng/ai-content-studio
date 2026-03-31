import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/client/rtg/batches?code={short_code}&token={access_token}
 * Vrací aktuální (nejnovější pending/partial) batch s posty pro RTG klienta.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim();
    const token = searchParams.get("token")?.trim();

    if (!code || !token) {
      return NextResponse.json(
        { ok: false, error: "Chybí code nebo token" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Ověř přístup přes short_code + access_token
    const { data: projectData } = await supabase
      .from("client_projects")
      .select("id, plan, rtg_plan, interval_days, client_name, onboarding_completed, pvi_active, portrait_active, google_drive_folder_id")
      .eq("short_code", code)
      .eq("access_token", token)
      .single();

    if (!projectData) {
      return NextResponse.json(
        { ok: false, error: "Neplatný přístup" },
        { status: 401 }
      );
    }

    const project = projectData as {
      id: string;
      plan: string | null;
      rtg_plan: string | null;
      interval_days: number | null;
      client_name: string | null;
      onboarding_completed: boolean;
      pvi_active: boolean;
      portrait_active: boolean;
      google_drive_folder_id: string | null;
    };

    // Nejnovější pending nebo partial batch
    const { data: batchData, error: batchError } = await supabase
      .from("content_batches")
      .select("*")
      .eq("project_id", project.id)
      .in("status", ["pending", "partial"])
      .order("week_start", { ascending: false })
      .limit(1)
      .single();

    if (batchError && batchError.code !== "PGRST116") {
      return NextResponse.json(
        { ok: false, error: "Chyba načtení batche" },
        { status: 500 }
      );
    }

    const batch = batchData ?? null;

    // Posty batche (jen pokud batch existuje)
    let posts: unknown[] = [];
    if (batch) {
      const { data: postsData, error: postsError } = await supabase
        .from("content_posts")
        .select("*")
        .eq("batch_id", (batch as { id: string }).id)
        .in("status", ["client_review", "pending", "approved"])
        .order("pair_index", { ascending: true });

      if (postsError) {
        return NextResponse.json(
          { ok: false, error: "Chyba načtení postů" },
          { status: 500 }
        );
      }
      posts = postsData ?? [];
    }

    return NextResponse.json({
      ok: true,
      batch,
      posts,
      project: {
        plan: project.plan,
        rtg_plan: project.rtg_plan ?? project.plan,
        interval_days: project.interval_days,
        client_name: project.client_name,
        onboarding_completed: project.onboarding_completed,
        pvi_active: project.pvi_active ?? false,
        portrait_active: project.portrait_active ?? false,
        google_drive_folder_id: project.google_drive_folder_id ?? null,
      },
    });
  } catch (e) {
    console.error("[rtg/batches]", e);
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
