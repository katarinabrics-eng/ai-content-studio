import { NextResponse } from "next/server";
import { verifyAndRotateToken } from "@/lib/supabase-client-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Chybí token" },
      { status: 400 }
    );
  }

  const result = await verifyAndRotateToken(token.trim());
  if (!result) {
    return NextResponse.json(
      { ok: false, error: "Neplatný nebo expirovaný odkaz. Požádejte o nový." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    client: {
      id: result.client.id,
      email: result.client.email,
      name: result.client.name,
    },
    token: result.newToken,
    expiresAt: result.expiresAt.toISOString(),
    redirectTo: "/kreativa",
  });
}
