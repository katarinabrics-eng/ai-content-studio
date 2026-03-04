import { NextResponse } from "next/server";
import { getClientProjectByAccessToken, updateClientProject } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST: Klient upraví své vstupní údaje (identifikace tokenem z URL). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (!token) {
      return NextResponse.json({ ok: false, error: "Chybí token." }, { status: 400 });
    }
    const project = await getClientProjectByAccessToken(token);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Neplatný nebo vypršený odkaz." }, { status: 404 });
    }
    const name = typeof body.name === "string" ? body.name.trim() || null : undefined;
    const email = typeof body.email === "string" ? body.email.trim() || null : undefined;
    const manual_input = typeof body.manual_input === "string" ? body.manual_input.trim() || null : undefined;
    if (name === undefined && email === undefined && manual_input === undefined) {
      return NextResponse.json({ ok: false, error: "Pošlete alespoň jedno pole: name, email, manual_input." }, { status: 400 });
    }
    const updated = await updateClientProject(project.id, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(manual_input !== undefined && { manual_input }),
    });
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Chyba při ukládání." }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      project: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        manual_input: updated.manual_input,
      },
    });
  } catch (e) {
    console.error("[diagnostika/update-input]", e);
    return NextResponse.json({ ok: false, error: "Chyba při ukládání." }, { status: 500 });
  }
}
