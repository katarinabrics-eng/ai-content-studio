import { NextResponse } from "next/server";
import { verifyPasswordAsync } from "@/lib/admin-password";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = typeof (body as { password?: string }).password === "string" ? (body as { password: string }).password : "";
    const nextUrl = typeof (body as { next?: string }).next === "string" ? (body as { next: string }).next : "/admin/dashboard";

    const ok = await verifyPasswordAsync(password);

    if (!ok) {
      return NextResponse.json({ ok: false, error: "Neplatné přihlášení" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, redirectTo: nextUrl.startsWith("/") ? nextUrl : "/" });
    res.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Chyba serveru" }, { status: 500 });
  }
}
