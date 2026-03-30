import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/client/rtg/update-text
 * Body: { post_id, field: 'hook' | 'body', value, code, token }
 * Ukládá inline editaci textu klientem do DB.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as {
      post_id?: string;
      field?: string;
      value?: string;
      code?: string;
      token?: string;
    };

    const { post_id, field, value, code, token } = body;

    if (!code?.trim() || !token?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Chybí code nebo token" },
        { status: 401 }
      );
    }

    if (!post_id || !field) {
      return NextResponse.json(
        { ok: false, error: "Chybí post_id nebo field" },
        { status: 400 }
      );
    }

    if (field !== "hook" && field !== "body") {
      return NextResponse.json(
        { ok: false, error: "field musí být 'hook' nebo 'body'" },
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

    // Ověř, že post patří tomuto projektu a není schválený
    const { data: postData } = await supabase
      .from("content_posts")
      .select("id, project_id, status")
      .eq("id", post_id)
      .maybeSingle();

    if (!postData) {
      return NextResponse.json(
        { ok: false, error: "Post nenalezen" },
        { status: 404 }
      );
    }

    const post = postData as { id: string; project_id: string; status: string };

    if (post.project_id !== project.id) {
      return NextResponse.json(
        { ok: false, error: "Přístup odepřen" },
        { status: 403 }
      );
    }

    if (post.status === "approved") {
      return NextResponse.json(
        { ok: false, error: "Schválený post nelze editovat" },
        { status: 409 }
      );
    }

    // Ulož upravenou verzi textu (do editovaných sloupců, originál zachován)
    const updateField = field === "hook" ? "text_hook_edited" : "text_body_edited";
    const { error: updateError } = await supabase
      .from("content_posts")
      .update({
        [updateField]: value ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post_id);

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: "Nepodařilo se uložit text" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[rtg/update-text]", e);
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
