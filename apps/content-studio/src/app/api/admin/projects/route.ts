import { NextResponse } from "next/server";
import { listProjects, getWorkflowStateForProjects } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await listProjects();
  const stateMap = await getWorkflowStateForProjects(projects);
  const projectsWithState = projects.map((p) => ({
    ...p,
    workflowState: stateMap.get(p.id) ?? null,
  }));
  return NextResponse.json({ ok: true, projects: projectsWithState });
}
