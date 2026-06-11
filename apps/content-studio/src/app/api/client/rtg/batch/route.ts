import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectByAccessToken } from "@/lib/supabase-client-projects";
import type { ContentBatchRow, ContentPostRow } from "@/lib/types/rtg-database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?token=... — vrací aktuální (nejnovější pending/partial) batch s posty pro RTG klienta. */
export async function GET(request: Request) {
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

    const supabase = getSupabaseClient();

    // Nejnovější pending nebo partial batch pro tento projekt
    const { data: batchData, error: batchError } = await supabase
      .from("content_batches")
      .select("*")
      .eq("project_id", clientProject.id)
      .in("status", ["pending", "partial"])
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (batchError) {
      return NextResponse.json({ ok: false, error: "Chyba načtení batche" }, { status: 500 });
    }

    if (!batchData) {
      return NextResponse.json({ ok: true, batch: null, posts: [] });
    }

    const batch = batchData as ContentBatchRow;

    // Posty tohoto batche, seřazené podle pair_index
    const { data: postsData, error: postsError } = await supabase
      .from("content_posts")
      .select("*")
      .eq("batch_id", batch.id)
      .order("pair_index", { ascending: true });

    if (postsError) {
      return NextResponse.json({ ok: false, error: "Chyba načtení postů" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      batch,
      posts: (postsData ?? []) as ContentPostRow[],
    });
  } catch (e) {
    console.error("[rtg/batch]", e);
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
