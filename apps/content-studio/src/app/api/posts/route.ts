import { NextResponse } from "next/server";
import { getIntakeByIdOrLast } from "@/lib/supabase-intake";
import { getPostDraftsByIntakeId } from "@/lib/supabase-posts";
import type { StoredPostDraft } from "@/lib/posts-schema";

function toStoredDraft(row: { id: string; intake_id: string; created_at: string; payload: Record<string, unknown> }): StoredPostDraft {
  const p = row.payload;
  return {
    id: row.id,
    intakeId: row.intake_id,
    createdAt: row.created_at ?? new Date().toISOString(),
    platform: (p.platform as StoredPostDraft["platform"]) ?? "instagram",
    angle: String(p.angle ?? ""),
    hook: String(p.hook ?? ""),
    caption: String(p.caption ?? ""),
    cta: String(p.cta ?? ""),
    hashtags: Array.isArray(p.hashtags) ? p.hashtags.map(String) : [],
    visualBrief: String(p.visualBrief ?? ""),
    status: "draft",
    visualImageUrl: typeof p.visualImageUrl === "string" ? p.visualImageUrl : undefined,
    visualStatus: p.visualStatus as StoredPostDraft["visualStatus"] | undefined,
    visualPrompt: typeof p.visualPrompt === "string" ? p.visualPrompt : undefined,
    visualError: typeof p.visualError === "string" ? p.visualError : undefined,
    visualUpdatedAt: typeof p.visualUpdatedAt === "string" ? p.visualUpdatedAt : undefined,
  };
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const intakeId = searchParams.get("intakeId") ?? undefined;

    const intake = await getIntakeByIdOrLast(intakeId ?? undefined);
    if (!intake) {
      return NextResponse.json({ ok: true, drafts: [], intakeId: null });
    }

    const rows = await getPostDraftsByIntakeId(intake.id);
    const drafts = rows.map(toStoredDraft);

    return NextResponse.json({
      ok: true,
      intakeId: intake.id,
      drafts,
    });
  } catch (e) {
    console.error("GET /api/posts", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
