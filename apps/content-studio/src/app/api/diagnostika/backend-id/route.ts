import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET: Vrací identifikátor Supabase projektu (stejný jako admin). Pro ověření, že diagnostika a admin používají stejnou DB. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let supabaseRef = "?";
  try {
    const host = new URL(url).hostname;
    const match = host.match(/^([a-z]+)\.supabase\.co$/i);
    supabaseRef = match ? match[1] : host ? host.slice(0, 12) : "?";
  } catch {
    /* ignore */
  }
  return NextResponse.json({ supabaseRef });
}
