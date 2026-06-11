import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/client/rtg/approve
 * Body: { post_id, selected_variant, client_note?, code, token }
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as {
      post_id?: string;
      selected_variant?: "A" | "B";
      client_note?: string;
      code?: string;
      token?: string;
    };

    const { post_id, selected_variant, client_note, code, token } = body;

    if (!code?.trim() || !token?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Chybí code nebo token" },
        { status: 401 }
      );
    }

    if (!post_id || !selected_variant) {
      return NextResponse.json(
        { ok: false, error: "Chybí post_id nebo selected_variant" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Ověř přístup
    const { data: projectData } = await supabase
      .from("client_projects")
      .select("id")
      .eq("short_code", code.trim())
      .eq("access_token", token.trim())
      .single();

    if (!projectData) {
      return NextResponse.json(
        { ok: false, error: "Neplatný přístup" },
        { status: 401 }
      );
    }

    const project = projectData as { id: string };

    // Načti post — ověř, že patří tomuto projektu
    const { data: postData, error: postError } = await supabase
      .from("content_posts")
      .select("id, batch_id, project_id")
      .eq("id", post_id)
      .maybeSingle();

    if (postError || !postData) {
      return NextResponse.json(
        { ok: false, error: "Post nenalezen" },
        { status: 404 }
      );
    }

    const post = postData as { id: string; batch_id: string; project_id: string };

    if (post.project_id !== project.id) {
      return NextResponse.json(
        { ok: false, error: "Přístup odepřen" },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // Schval post
    const { error: updateError } = await supabase
      .from("content_posts")
      .update({
        status: "approved",
        client_approved_at: now,
        client_note: client_note ?? null,
        updated_at: now,
      })
      .eq("id", post_id);

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: "Nepodařilo se schválit post" },
        { status: 500 }
      );
    }

    // Spočítej approved v batchi
    const { count } = await supabase
      .from("content_posts")
      .select("id", { count: "exact" })
      .eq("batch_id", post.batch_id)
      .eq("status", "approved");

    const approvedCount = count ?? 0;

    // Načti celkový počet v batchi
    const { data: batchData } = await supabase
      .from("content_batches")
      .select("items_total")
      .eq("id", post.batch_id)
      .single();

    const batchFullyApproved =
      batchData != null &&
      approvedCount === (batchData as { items_total: number }).items_total;

    // Aktualizuj batch status
    if (batchFullyApproved) {
      await supabase
        .from("content_batches")
        .update({ status: "approved", items_approved: approvedCount, updated_at: now })
        .eq("id", post.batch_id);
    } else {
      await supabase
        .from("content_batches")
        .update({ items_approved: approvedCount, updated_at: now })
        .eq("id", post.batch_id);
    }

    return NextResponse.json({ ok: true, batch_fully_approved: batchFullyApproved });
  } catch (e) {
    console.error("[rtg/approve]", e);
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
