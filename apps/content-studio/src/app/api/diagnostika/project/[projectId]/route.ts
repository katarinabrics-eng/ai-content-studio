import { NextResponse } from "next/server";
import { getDiagnosticProjectById } from "@/lib/lucifera-diagnostic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: "Chybí projectId." }, { status: 400 });
    }
    const project = await getDiagnosticProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Chyba při načítání projektu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
