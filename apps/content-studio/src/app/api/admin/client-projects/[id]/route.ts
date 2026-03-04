import { NextResponse } from "next/server";
import {
  getClientProjectById,
  updateClientProjectStatus,
  deleteClientProject,
} from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveId(params: { id?: string } | Promise<{ id?: string }>) {
  const p = await Promise.resolve(params);
  return p?.id;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await resolveId(params);
  if (!id) {
    return NextResponse.json({ error: "Chybí id." }, { status: 400 });
  }
  try {
    const project = await getClientProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, project });
  } catch (e) {
    console.error("[admin/client-projects/[id]]", e);
    return NextResponse.json({ error: "Chyba načtení." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await resolveId(params);
  if (!id) {
    return NextResponse.json({ error: "Chybí id." }, { status: 400 });
  }
  const body = await request.json().catch(() => ({}));
  if (body?.archive !== true) {
    return NextResponse.json({ error: "Pouze archive: true je podporováno." }, { status: 400 });
  }
  try {
    const project = await getClientProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
    }
    const updated = await updateClientProjectStatus(id, "done");
    if (!updated) {
      return NextResponse.json({ error: "Chyba při archivaci." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, project: updated });
  } catch (e) {
    console.error("[admin/client-projects/[id] PATCH]", e);
    return NextResponse.json({ error: "Chyba při archivaci." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await resolveId(params);
  if (!id) {
    return NextResponse.json({ error: "Chybí id." }, { status: 400 });
  }
  try {
    const project = await getClientProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
    }
    await deleteClientProject(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/client-projects/[id] DELETE]", e);
    return NextResponse.json({ error: "Chyba při mazání." }, { status: 500 });
  }
}
