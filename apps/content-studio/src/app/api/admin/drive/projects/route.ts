import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();

    // Načti projekty + jejich drive config (LEFT JOIN přes Supabase)
    const { data: projects, error } = await supabase
      .from("client_projects")
      .select(`
        id,
        client_project_name,
        email,
        workflow_status,
        client_drive_config (
          drive_folder_id,
          last_synced_at,
          folder_structure,
          text_contents,
          is_active
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    // Flatten: client_drive_config je array (one-to-one), bereme první záznam
    const result = (projects ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      drive_config: Array.isArray(p.client_drive_config)
        ? (p.client_drive_config[0] ?? null)
        : (p.client_drive_config ?? null),
      client_drive_config: undefined,
    }));

    return NextResponse.json({ projects: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
