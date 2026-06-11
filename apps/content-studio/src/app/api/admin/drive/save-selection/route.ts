import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientProjectId, selectedFileIds } = body as {
      clientProjectId: string;
      selectedFileIds: string[];
    };

    if (!clientProjectId || !Array.isArray(selectedFileIds)) {
      return NextResponse.json({ error: "Chybí clientProjectId nebo selectedFileIds" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("client_selected_photos")
      .upsert(
        {
          client_project_id: clientProjectId,
          selected_file_ids: selectedFileIds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_project_id" }
      );

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, count: selectedFileIds.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
