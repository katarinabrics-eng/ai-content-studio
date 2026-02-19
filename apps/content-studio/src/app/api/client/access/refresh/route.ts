import { NextResponse } from "next/server";
import { validateToken, createAccessLinkForClient } from "@/lib/supabase-client-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Refresh: validate current token, issue new one (short expiry), return new token.
 * Body: { token: string } or query ?token=...
 */
export async function POST(request: Request) {
  try {
    let token: string | null = null;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      token = typeof body.token === "string" ? body.token : null;
    }
    if (!token) {
      const { searchParams } = new URL(request.url);
      token = searchParams.get("token");
    }
    if (!token?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Chybí token" },
        { status: 400 }
      );
    }

    const result = await validateToken(token.trim());
    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Neplatný nebo expirovaný token." },
        { status: 401 }
      );
    }

    const { newToken, expiresAt } = await createAccessLinkForClient(result.client.id);

    return NextResponse.json({
      ok: true,
      token: newToken,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (e) {
    console.error("[/api/client/access/refresh]", e);
    return NextResponse.json(
      { ok: false, error: "Nepodařilo obnovit token." },
      { status: 500 }
    );
  }
}
