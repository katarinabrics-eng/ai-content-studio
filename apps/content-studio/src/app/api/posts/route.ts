import { NextResponse } from "next/server";
import { getIntakeByIdOrLast, readPostDrafts } from "@/lib/posts-data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const intakeId = searchParams.get("intakeId") ?? undefined;

    const intake = getIntakeByIdOrLast(intakeId ?? undefined);
    if (!intake) {
      return NextResponse.json({ ok: true, drafts: [], intakeId: null });
    }

    const allDrafts = readPostDrafts();
    const drafts = allDrafts.filter((d) => d.intakeId === intake.id);

    return NextResponse.json({
      ok: true,
      intakeId: intake.id,
      drafts,
    });
  } catch (e) {
    console.error("GET /api/posts", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Došlo k chybě serveru" },
      { status: 500 }
    );
  }
}
