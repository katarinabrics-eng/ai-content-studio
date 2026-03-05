import { NextResponse } from "next/server";
import { canDiagTransition } from "@/lib/diagnostika-workflow";
import {
  getClientProjectById,
  updateClientProjectWorkflowStatus,
  updateClientProject,
} from "@/lib/supabase-client-projects";
import type { DiagWorkflowStatus } from "@/lib/diagnostika-workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "Chybí id." }, { status: 400 });
  }
  let body: { workflow_status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON." }, { status: 400 });
  }
  const workflowStatus = body.workflow_status as DiagWorkflowStatus | undefined;
  if (!workflowStatus || typeof workflowStatus !== "string") {
    return NextResponse.json(
      { error: "Chybí nebo neplatný workflow_status." },
      { status: 400 }
    );
  }
  const project = await getClientProjectById(id);
  if (!project) {
    return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
  }
  if (!canDiagTransition(project.workflow_status, workflowStatus)) {
    return NextResponse.json(
      { error: "Tento přechod stavu není povolen." },
      { status: 400 }
    );
  }
  const updated = await updateClientProjectWorkflowStatus(id, workflowStatus);
  if (!updated) {
    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat stav." },
      { status: 500 }
    );
  }
  if (workflowStatus === "DIAG_READY_FOR_CLIENT") {
    await updateClientProject(id, { last_contact_at: new Date().toISOString() });
  }
  const fresh = await getClientProjectById(id);
  return NextResponse.json({ ok: true, project: fresh ?? updated });
}
