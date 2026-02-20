import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * FLOW RESET v1: Simplified middleware
 * Protected: /admin, /kurator, /navrhy-postu
 * Public: /, /start, /pricing, /faq, /kontakt, /vstup, /_next/*
 */
const PROTECTED_PREFIXES = ["/admin", "/kurator", "/navrhy-postu"] as const;

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const AUTH_COOKIE = "admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const authorized = request.cookies.get(AUTH_COOKIE)?.value === "1";
  if (authorized) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|placeholders|api).*)"],
};
