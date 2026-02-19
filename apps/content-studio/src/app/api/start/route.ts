import { NextResponse } from "next/server";
import { createProject } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zEmail = (v: unknown) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan_id = typeof body.plan_id === "string" ? body.plan_id.trim() || "basic" : "basic";
    const brand = typeof body.brand === "string" ? body.brand.trim() : "";
    const obor = typeof body.obor === "string" ? body.obor.trim() : "";
    const cil = typeof body.cil === "string" ? body.cil.trim() : "";
    const sit = typeof body.sit === "string" ? body.sit.trim() : "";
    const tonalita = typeof body.tonalita === "string" ? body.tonalita.trim() : "";
    const poznamka = typeof body.poznamka === "string" ? body.poznamka.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : null;
    const emailOrNull = email && zEmail(email) ? email : null;

    const baseUrl =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { project, magicToken, projectCode, pin } = await createProject({
      plan_id,
      brand,
      obor,
      cil,
      sit,
      tonalita,
      poznamka,
      email: emailOrNull,
    });

    if (magicToken) {
      const magicLinkUrl = `${baseUrl.replace(/\/$/, "")}/project?token=${encodeURIComponent(magicToken)}`;
      // Optional: integrate mailer (Resend/SendGrid) and send magicLinkUrl to emailOrNull
      return NextResponse.json({
        ok: true,
        projectId: project.id,
        magicLinkUrl,
        message: "Projekt vytvořen. Odkaz jsme odeslali na email a zobrazíme ho níže.",
      });
    }

    return NextResponse.json({
      ok: true,
      projectId: project.id,
      projectCode,
      pin,
      message: "Projekt vytvořen. Uložte si kód a PIN pro přístup.",
    });
  } catch (e) {
    console.error("[/api/start]", e);
    return NextResponse.json(
      { ok: false, error: "Nepodařilo se vytvořit projekt." },
      { status: 500 }
    );
  }
}
