import { NextResponse } from "next/server";
import { listProjects } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ ok: true, projects });
}
