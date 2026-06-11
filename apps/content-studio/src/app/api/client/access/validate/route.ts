import { NextResponse } from "next/server";
import { validateToken } from "@/lib/supabase-client-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Validate token for client page loads (does not rotate or mark used). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Chybí token" },
      { status: 400 }
    );
  }

  const result = await validateToken(token.trim());
  if (!result) {
    return NextResponse.json(
      { ok: false, error: "Neplatný nebo expirovaný odkaz." },
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
  });
}
