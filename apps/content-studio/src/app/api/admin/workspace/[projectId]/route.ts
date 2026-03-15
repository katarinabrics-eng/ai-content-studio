import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { projectId } = params;

    const { data, error } = await supabase
      .from("client_projects")
      .select(`
        id,
        name,
        client_project_name,
        email,
        web_url,
        workflow_status,
        scan_result,
        client_drive_config (
          drive_folder_id,
          folder_structure,
          text_contents,
          last_synced_at,
          is_active
        ),
        client_selected_photos (
          selected_file_ids,
          updated_at
        )
      `)
      .eq("id", projectId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

    // Flatten one-to-one relations
    const result = {
      ...data,
      drive_config: Array.isArray(data.client_drive_config)
        ? (data.client_drive_config[0] ?? null)
        : (data.client_drive_config ?? null),
      selected_photos: Array.isArray(data.client_selected_photos)
        ? (data.client_selected_photos[0] ?? null)
        : (data.client_selected_photos ?? null),
      client_drive_config: undefined,
      client_selected_photos: undefined,
    };

    return NextResponse.json({ project: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
