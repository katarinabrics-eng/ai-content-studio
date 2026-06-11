import { NextResponse } from "next/server";
import { getDiagnosticProjectsByClientId } from "@/lib/lucifera-diagnostic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?clientId=... – vrací projekty klienta (pro /studio). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json(
        { error: "Chybí clientId." },
        { status: 400 }
      );
    }
    const projects = await getDiagnosticProjectsByClientId(clientId);
    return NextResponse.json({ projects });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Nepodařilo se načíst projekty.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
