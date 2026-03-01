import { NextResponse } from "next/server";
import { createDiagnosticProject } from "@/lib/lucifera-diagnostic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json(
        { error: "E-mail je povinný." },
        { status: 400 }
      );
    }
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const intake_data =
      body?.intake_data && typeof body.intake_data === "object"
        ? body.intake_data
        : {};

    const { clientId, projectId } = await createDiagnosticProject({
      email,
      name,
      intake_data,
    });

    return NextResponse.json({
      ok: true,
      clientId,
      projectId,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Nepodařilo se uložit diagnostiku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
