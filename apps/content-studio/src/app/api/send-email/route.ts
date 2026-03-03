import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

const SERVICE_LABELS: Record<string, string> = {
  portrait: "Portrétní focení",
  rodina: "Rodinné focení",
  brand: "Brand focení",
  board: "Strategický Visual Board",
};

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 });
  }

  let body: { email?: string; date?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const date = typeof body.date === "string" ? body.date : "";
  const type = typeof body.type === "string" ? body.type : "";

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const serviceLabel = SERVICE_LABELS[type] || type || "Rezervace";

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "Lucifera <info@studiolucifera.cz>",
      to: email,
      subject: "Potvrzení rezervace – Studio Lucifera",
      html: `
        <h2>Vaše rezervace je potvrzena</h2>
        <p>Služba: ${serviceLabel}</p>
        <p>Termín: ${date}</p>
        <p>Děkujeme za důvěru.</p>
        <p>— Studio Lucifera</p>
      `,
    });

    if (error) {
      console.error("[send-email] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[send-email]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
