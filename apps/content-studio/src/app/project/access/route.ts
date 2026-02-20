import { NextResponse } from "next/server";
import { createProjectSession, verifyAndConsumeAccessToken } from "@/lib/supabase-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "project_session";
const COOKIE_DAYS = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || typeof token !== "string") {
    return NextResponse.redirect(new URL("/?error=missing_token", request.url));
  }

  const projectId = await verifyAndConsumeAccessToken(token);
  if (!projectId) {
    return NextResponse.redirect(new URL("/?error=invalid_token", request.url));
  }

  const sessionToken = await createProjectSession(projectId);
  const redirectUrl = new URL("/project", request.url);
  const res = NextResponse.redirect(redirectUrl);
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_DAYS);
  res.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
  return res;
}
