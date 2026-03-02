import { NextResponse } from "next/server";
import { getClientProjectById } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = params?.id;
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
