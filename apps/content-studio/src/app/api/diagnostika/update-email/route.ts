import { NextResponse } from "next/server";
import { updateClientProjectEmail, getClientProjectById } from "@/lib/supabase-client-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST: Uloží e-mail k záznamu diagnostiky (client_projects). Vrací accessUrl pro návrat klienta (magický odkaz). */
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
    const project = await getClientProjectById(projectId);
    const origin = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") === "https" ? "https" : "http";
    const base = origin ? `${protocol}://${origin}` : "";
    const accessUrl =
      project?.access_token && base
        ? `${base}/diagnostika/view?token=${encodeURIComponent(project.access_token)}`
        : undefined;
    const shortUrl =
      base && project?.short_code ? `${base}/d/${project.short_code}` : undefined;
    return NextResponse.json({
      ok: true,
      accessUrl: shortUrl ?? accessUrl,
      shortUrl: shortUrl ?? undefined,
    });
  } catch (e) {
    console.error("[diagnostika/update-email]", e);
    return NextResponse.json(
      { ok: false, error: "Nepodařilo se uložit e-mail." },
      { status: 500 }
    );
  }
}
