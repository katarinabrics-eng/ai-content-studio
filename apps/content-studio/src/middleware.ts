import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/intake", "/navrhy-postu", "/kurator", "/drafts", "/curator", "/admin"] as const;

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const AUTH_COOKIE = "admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const authorized = request.cookies.get(AUTH_COOKIE)?.value === "1";
  if (authorized) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/intake", "/intake/:path*",
    "/navrhy-postu", "/navrhy-postu/:path*",
    "/kurator", "/kurator/:path*",
    "/drafts", "/drafts/:path*",
    "/curator", "/curator/:path*",
    "/admin", "/admin/:path*",
  ],
};
