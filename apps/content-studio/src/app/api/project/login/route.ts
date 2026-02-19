import { NextResponse } from "next/server";
import { getProjectByCodeAndPin, createProjectSession } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "project_session";
const COOKIE_DAYS = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";
    if (!code || !pin) {
      return NextResponse.json({ ok: false, error: "Zadejte kód a PIN." }, { status: 400 });
    }

    const project = await getProjectByCodeAndPin(code, pin);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Neplatný kód nebo PIN." }, { status: 401 });
    }

    const token = await createProjectSession(project.id);
    const res = NextResponse.json({ ok: true, redirect: "/project" });
    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_DAYS);
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[/api/project/login]", e);
    return NextResponse.json({ ok: false, error: "Přihlášení se nezdařilo." }, { status: 500 });
  }
}
