import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("analysis_leads")
      .select("id, email, analyzed_url, result, scraped_meta, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[admin/analysis-leads]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, leads: data ?? [] });
  } catch (e) {
    console.error("[admin/analysis-leads]", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
