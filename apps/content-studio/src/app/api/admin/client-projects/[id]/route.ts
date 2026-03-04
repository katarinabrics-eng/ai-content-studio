import { NextResponse } from "next/server";
import {
  getClientProjectById,
  updateClientProjectStatus,
  updateClientProject,
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
  try {
    const project = await getClientProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
    }
    if (body?.archive === true) {
      const updated = await updateClientProjectStatus(id, "done");
      if (!updated) {
        return NextResponse.json({ error: "Chyba při archivaci." }, { status: 500 });
      }
      return NextResponse.json({ ok: true, project: updated });
    }
    const name = typeof body.name === "string" ? body.name.trim() || null : undefined;
    const email = typeof body.email === "string" ? body.email.trim() || null : undefined;
    const web_url = typeof body.web_url === "string" ? body.web_url.trim() || null : undefined;
    const manual_input = typeof body.manual_input === "string" ? body.manual_input.trim() || null : undefined;
    if (name === undefined && email === undefined && web_url === undefined && manual_input === undefined) {
      return NextResponse.json({ error: "Pošlete archive: true nebo alespoň jedno pole: name, email, web_url, manual_input." }, { status: 400 });
    }
    const updated = await updateClientProject(id, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(web_url !== undefined && { web_url }),
      ...(manual_input !== undefined && { manual_input }),
    });
    if (!updated) {
      return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, project: updated });
  } catch (e) {
    console.error("[admin/client-projects/[id] PATCH]", e);
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
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
