import { NextResponse } from "next/server";
import { updateClientProjectEmail } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST: Uloží e-mail k záznamu diagnostiky (client_projects). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const projectId = typeof body?.projectId === "string" ? body.projectId.trim() || null : null;
    const email = typeof body?.email === "string" ? body.email.trim() || null : null;

    if (!projectId || !email) {
      return NextResponse.json(
        { ok: false, error: "Chybí projectId nebo email." },
        { status: 400 }
      );
    }

    await updateClientProjectEmail(projectId, email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[diagnostika/update-email]", e);
    return NextResponse.json(
      { ok: false, error: "Nepodařilo se uložit e-mail." },
      { status: 500 }
    );
  }
}
