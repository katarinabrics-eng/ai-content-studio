import { NextResponse } from "next/server";
import { verifyProjectByCodeAndPin, createProjectSession } from "@/lib/supabase-projects";
import { normalizeProjectCode, normalizePin } from "@/lib/project-code-normalize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "project_session";
const COOKIE_DAYS = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawCode = typeof body.code === "string" ? body.code : "";
    const rawPin = typeof body.pin === "string" ? body.pin : "";
    const code = normalizeProjectCode(rawCode);
    const pin = normalizePin(rawPin);
    if (!code || !pin) {
      return NextResponse.json({ ok: false, error: "Zadejte kód a PIN." }, { status: 400 });
    }

    const result = await verifyProjectByCodeAndPin(code, pin);
    if (!result.ok) {
      const reason = result.error; // code_not_found | pin_mismatch | pin_expired | pin_hash_missing
      console.warn("[project/login] failed:", { reason, codePrefix: code.slice(0, 4) });
      const payload: Record<string, unknown> = { ok: false, error: "Neplatný kód nebo PIN." };
      if (process.env.NODE_ENV !== "production") payload.reason = reason;
      return NextResponse.json(payload, { status: 401 });
    }

    const project = result.project;

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
