import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Paths that require admin auth. Homepage, /_next/*, static assets are never matched by config.matcher. */
const PROTECTED_PREFIXES = ["/admin", "/intake", "/kurator", "/navrhy-postu"] as const;

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const AUTH_COOKIE = "admin_session";

/** Admin ochrana vypnutá – přímý přístup bez hesla. */
const ADMIN_AUTH_DISABLED = true;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminPath && ADMIN_AUTH_DISABLED) {
    const res = NextResponse.next();
    res.cookies.set(AUTH_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  const authorized = request.cookies.get(AUTH_COOKIE)?.value === "1";
  if (authorized) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Exclude _next, favicon, robots – middleware never runs for these (avoids 401 on /_next/image)
  matcher: ["/((?!_next|favicon.ico|robots.txt).*)"],
};
