import { NextResponse } from "next/server";
import { listClientProjects } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Odvozený identifikátor Supabase projektu (pro ověření, že admin a diagnostika používají stejnou DB). */
function getSupabaseProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  try {
    const host = new URL(url).hostname;
    const match = host.match(/^([a-z]+)\.supabase\.co$/i);
    return match ? match[1] : host ? host.slice(0, 12) : "?";
  } catch {
    return "?";
  }
}

export async function GET() {
  try {
    const projects = await listClientProjects();
    const supabaseRef = getSupabaseProjectRef();
    return NextResponse.json({
      ok: true,
      projects,
      _meta: { count: projects.length, supabaseRef },
    });
  } catch (e) {
    console.error("[admin/client-projects]", e);
    return NextResponse.json({ error: "Chyba načtení." }, { status: 500 });
  }
}
