import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getClientProjectByAccessToken } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
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

    const body = await request.json().catch(() => ({}));
    const { post_id, selected_variant, client_note } = body as {
      post_id?: string;
      selected_variant?: "A" | "B";
      client_note?: string;
    };

    if (!post_id || !selected_variant) {
      return NextResponse.json(
        { ok: false, error: "Chybí post_id nebo selected_variant" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch post — verify it belongs to this client's project
    const { data: post, error: postError } = await supabase
      .from("content_posts")
      .select("id, batch_id, project_id")
      .eq("id", post_id)
      .maybeSingle();

    if (postError || !post) {
      return NextResponse.json({ ok: false, error: "Post nenalezen" }, { status: 404 });
    }

    const p = post as { id: string; batch_id: string; project_id: string };

    if (p.project_id !== clientProject.id) {
      return NextResponse.json({ ok: false, error: "Přístup odepřen" }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Approve the post
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

    // Check if all posts in batch are now approved
    const { data: batchPosts } = await supabase
      .from("content_posts")
      .select("id, status")
      .eq("batch_id", p.batch_id);

    const allPosts = (batchPosts ?? []) as { id: string; status: string }[];
    const approvedCount = allPosts.filter((bp) => bp.status === "approved").length;
    const batchFullyApproved = allPosts.length > 0 && approvedCount === allPosts.length;

    // Update batch status
    const newBatchStatus = batchFullyApproved
      ? "approved"
      : approvedCount > 0
      ? "partial"
      : "pending";

    await supabase
      .from("content_batches")
      .update({ status: newBatchStatus, updated_at: now })
      .eq("id", p.batch_id);

    return NextResponse.json({ ok: true, batch_fully_approved: batchFullyApproved });
  } catch (e) {
    console.error("[rtg/approve]", e);
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
