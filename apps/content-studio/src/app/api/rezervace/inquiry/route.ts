import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Neplatná data." }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const interestType = typeof body.interestType === "string" ? body.interestType.trim() : undefined;

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Vyplňte jméno, e-mail a zprávu." },
        { status: 400 }
      );
    }

    // TODO: odeslat e-mail nebo uložit do DB; zatím jen log
    console.log("[rezervace/inquiry]", { name, email, phone, interestType, messageLength: message.length });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/rezervace/inquiry]", e);
    return NextResponse.json(
      { ok: false, error: "Došlo k chybě. Zkuste to později." },
      { status: 500 }
    );
  }
}
