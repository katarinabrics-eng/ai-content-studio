import { NextResponse } from "next/server";
import { listClientProjects } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await listClientProjects();
    return NextResponse.json({ ok: true, projects });
  } catch (e) {
    console.error("[admin/client-projects]", e);
    return NextResponse.json({ error: "Chyba načtení." }, { status: 500 });
  }
}
