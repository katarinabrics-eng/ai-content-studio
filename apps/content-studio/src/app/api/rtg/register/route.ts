import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

const PLAN_LABELS: Record<string, string> = {
  start: "Start",
  plus:  "Plus",
  pro:   "Pro",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as {
      name?: string;
      email?: string;
      plan?: string;
    };

    const name  = body.name?.trim()  ?? "";
    const email = body.email?.trim() ?? "";
    const plan  = body.plan?.trim()  ?? "plus";

    if (!name || !email) {
      return NextResponse.json({ ok: false, error: "Chybí jméno nebo email" }, { status: 400 });
    }

    const planLabel = PLAN_LABELS[plan] ?? plan;

    console.log('[rtg/register] Ukládám do DB:', { email, plan, name });
    console.log('[rtg/register] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

    // 1. Ulož do analysis_leads
    const supabase = getSupabaseClient();
    const { error: dbError } = await supabase
      .from("analysis_leads")
      .insert({
        email,
        analyzed_url: "rtg-registration",
        result: { name, plan, source: "rtg-lp" },
        scraped_meta: { registered_at: new Date().toISOString() },
      });

    if (dbError) {
      console.error("[rtg/register] DB chyba:", dbError);
      return NextResponse.json({ ok: false, error: "Nepodařilo se uložit registraci" }, { status: 500 });
    }

    // Emaily — každý samostatně, chyba neblokuje { ok: true }
    let resend: Resend | null = null;
    try {
      resend = getResend();
    } catch (keyErr) {
      console.error("[rtg/register] Resend init selhal:", keyErr);
    }

    // 2. Notifikace na studio
    if (resend) try {
      await resend.emails.send({
        from: "Lucifera <info@studiolucifera.cz>",
        to: "ahoj@studiolucifera.cz",
        subject: `Nová RTG registrace — ${name} (${planLabel})`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; padding: 32px 24px;">
            <p style="font-size: 13px; color: #999; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.08em;">Ready to Go · Nová registrace</p>
            <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px; width: 80px;">Jméno</td><td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">E-mail</td><td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 600;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Plán</td><td style="padding: 8px 0; font-size: 14px;"><span style="background: #d0ec78; color: #111; padding: 2px 10px; border-radius: 100px; font-weight: 600;">${planLabel}</span></td></tr>
            </table>
            <a href="https://ai-content-studio-omega.vercel.app/admin/rtg"
               style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Otevřít Admin RTG →
            </a>
            <p style="font-size: 12px; color: #bbb; margin-top: 24px;">
              Vytvoř klienta v adminu a pošli přístupový odkaz.
            </p>
          </div>
        `,
      });
    } catch (notifErr) {
      console.error("[rtg/register] Notifikační email selhal:", notifErr);
    }

    // 3. Potvrzovací email klientovi
    if (resend) try {
      await resend.emails.send({
        from: "Lucifera <info@studiolucifera.cz>",
        to: email,
        subject: "Přihláška Ready to Go přijata ✓",
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
            <p style="font-size: 13px; color: #999; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.08em;">Ready to Go · Lucifera</p>
            <h2 style="font-size: 24px; font-weight: 600; color: #111; margin-bottom: 12px;">
              Ahoj ${name},
            </h2>
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 16px;">
              děkujeme za zájem o <strong>Ready to Go</strong> — plán <strong>${planLabel}</strong>.
            </p>
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 32px;">
              Ozveme se do 24 hodin s přístupovým odkazem a dalšími kroky.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
            <p style="font-size: 13px; color: #888; line-height: 1.6;">
              — Katarína, Lucifera<br>
              <a href="https://studiolucifera.cz" style="color: #888;">studiolucifera.cz</a>
            </p>
          </div>
        `,
      });
    } catch (confirmErr) {
      console.error("[rtg/register] Potvrzovací email selhal:", confirmErr);
    }

    console.log('[rtg/register] Hotovo, registrace uložena');
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[rtg/register] Chyba:", err);
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
