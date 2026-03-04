import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * FLOW RESET v1 + FAZE 1: Simplified middleware
 * Protected: /admin, /kurator, /navrhy-postu
 * Public: /, /start, /client/:projectCode, /pricing, /faq, /kontakt, /vstup, /_next/*
 */
const PROTECTED_PREFIXES = ["/admin", "/kurator", "/navrhy-postu"] as const;

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const AUTH_COOKIE = "admin_session";

/** Pokud je nastaveno, všechny requesty přesměruj na tuto adresu – jedna DB, jeden zdroj pravdy. */
const CANONICAL_APP_URL = process.env.CANONICAL_APP_URL?.trim();

export function middleware(request: NextRequest) {
  if (CANONICAL_APP_URL) {
    try {
      const canonical = new URL(CANONICAL_APP_URL);
      const host = request.nextUrl.host;
      if (host !== canonical.host) {
        const target = new URL(request.nextUrl.pathname + request.nextUrl.search, CANONICAL_APP_URL);
        return NextResponse.redirect(target, 307);
      }
    } catch {
      /* ignore invalid URL */
    }
  }

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
  matcher: ["/((?!_next|favicon.ico|favicon.png|robots.txt|placeholders|api).*)"],
};
