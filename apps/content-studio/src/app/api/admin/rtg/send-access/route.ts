import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthed() {
  return cookies().get("admin_session")?.value === "1";
}

/**
 * POST /api/admin/rtg/send-access
 * Body: { project_id: string }
 * Odešle klientovi přístupový odkaz e-mailem přes Resend.
 */
export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { project_id?: string };
  const { project_id } = body;
  if (!project_id) return NextResponse.json({ error: "Chybí project_id" }, { status: 400 });

  const supabase = getSupabase();

  const { data: project } = await supabase
    .from("client_projects")
    .select("id, email, short_code, access_token, client_name")
    .eq("id", project_id)
    .single();

  if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

  const p = project as {
    id: string;
    email: string | null;
    short_code: string | null;
    access_token: string | null;
    client_name: string | null;
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.CANONICAL_APP_URL ?? "https://app.lucifera.studio";
  const accessUrl = p.short_code && p.access_token
    ? `${appUrl}/client/${p.short_code}/rtg?token=${p.access_token}`
    : null;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: "Lucifera <info@studiolucifera.cz>",
      to: p.email!,
      subject: "Váš obsah je připraven ke schválení — Ready to Go",
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <p style="font-size: 13px; color: #999; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.08em;">Ready to Go · Lucifera</p>
          <h2 style="font-size: 24px; font-weight: 600; color: #111; margin-bottom: 12px;">
            Ahoj ${p.client_name ?? p.email},
          </h2>
          <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 24px;">
            Váš nový obsah je připravený ke schválení. Stačí kliknout na tlačítko níže,
            vybrat varianty které se vám líbí a schválit je.
          </p>
          <a href="${accessUrl}"
             style="display: inline-block; background: #d0ec78; color: #111;
                    padding: 14px 28px; border-radius: 8px; text-decoration: none;
                    font-weight: 600; font-size: 15px;">
            Zobrazit obsah →
          </a>
          <p style="font-size: 13px; color: #999; margin-top: 32px; line-height: 1.6;">
            Pokud tlačítko nefunguje, zkopírujte tento odkaz do prohlížeče:<br>
            <a href="${accessUrl}" style="color: #666;">${accessUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="font-size: 12px; color: #bbb;">
            Ready to Go · Lucifera AI Content Studio · Praha, Kampa
          </p>
        </div>
      `,
    });
    console.log(`[send-access] email odeslán → ${p.email}`);
  } catch (e) {
    console.error(`[send-access] email selhal pro ${p.email}:`, e);
  }

  return NextResponse.json({ ok: true, access_url: accessUrl, sent_to: p.email });
}
