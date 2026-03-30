import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/client/rtg/download?batch_id={id}&code={code}&token={token}
 * Vrací Drive URL složky batche pro stažení schváleného obsahu.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batch_id = searchParams.get("batch_id")?.trim();
    const code = searchParams.get("code")?.trim();
    const token = searchParams.get("token")?.trim();

    if (!code || !token) {
      return NextResponse.json(
        { ok: false, error: "Chybí code nebo token" },
        { status: 401 }
      );
    }

    if (!batch_id) {
      return NextResponse.json(
        { ok: false, error: "Chybí batch_id" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Ověř přístup
    const { data: projectData } = await supabase
      .from("client_projects")
      .select("id, google_drive_folder_id")
      .eq("short_code", code)
      .eq("access_token", token)
      .single();

    if (!projectData) {
      return NextResponse.json(
        { ok: false, error: "Neplatný přístup" },
        { status: 401 }
      );
    }

    const project = projectData as { id: string; google_drive_folder_id?: string | null };

    // Načti batch — ověř, že patří tomuto projektu
    const { data: batchData } = await supabase
      .from("content_batches")
      .select("id, project_id, week_label, status")
      .eq("id", batch_id)
      .maybeSingle();

    if (!batchData) {
      return NextResponse.json(
        { ok: false, error: "Batch nenalezen" },
        { status: 404 }
      );
    }

    const batch = batchData as {
      id: string;
      project_id: string;
      week_label: string;
      status: string;
    };

    if (batch.project_id !== project.id) {
      return NextResponse.json(
        { ok: false, error: "Přístup odepřen" },
        { status: 403 }
      );
    }

    if (!project.google_drive_folder_id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Obsah ještě není připraven ke stažení. Obraťte se na kurátora.",
          not_ready: true,
        },
        { status: 404 }
      );
    }

    const driveUrl = `https://drive.google.com/drive/folders/${project.google_drive_folder_id}`;

    return NextResponse.json({ ok: true, driveUrl, week_label: batch.week_label });
  } catch (e) {
    console.error("[rtg/download]", e);
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
