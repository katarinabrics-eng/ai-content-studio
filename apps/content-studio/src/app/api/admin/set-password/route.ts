import { NextResponse } from "next/server";
import { setPasswordInDb } from "@/lib/admin-password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const setupToken = typeof (body as { setupToken?: string }).setupToken === "string" ? (body as { setupToken: string }).setupToken.trim() : "";
    const newPassword = typeof (body as { newPassword?: string }).newPassword === "string" ? (body as { newPassword: string }).newPassword : "";

    const expectedToken = process.env.ADMIN_SETUP_TOKEN ?? "";
    const trimmedExpected = expectedToken.trim();
    if (trimmedExpected.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Reset hesla není nakonfigurován. Nastavte ADMIN_SETUP_TOKEN v .env.local." },
        { status: 400 }
      );
    }
    if (setupToken !== trimmedExpected) {
      return NextResponse.json(
        { ok: false, error: "Neplatný setup token." },
        { status: 401 }
      );
    }

    const result = await setPasswordInDb(newPassword);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, message: "Heslo bylo nastaveno. Nyní se můžete přihlásit." });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/set-password]", e);
    return NextResponse.json({ ok: false, error: "Chyba serveru." }, { status: 500 });
  }
}
