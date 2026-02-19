import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
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
    visualBaseImageUrl: typeof p.visualBaseImageUrl === "string" ? p.visualBaseImageUrl : undefined,
    visualStatus: p.visualStatus as StoredPostDraft["visualStatus"] | undefined,
    visualPrompt: typeof p.visualPrompt === "string" ? p.visualPrompt : undefined,
    visualError: typeof p.visualError === "string" ? p.visualError : undefined,
    visualUpdatedAt: typeof p.visualUpdatedAt === "string" ? p.visualUpdatedAt : undefined,
    visualCreativeScore: typeof p.visualCreativeScore === "number" ? p.visualCreativeScore : undefined,
    visualFormat: typeof p.visualFormat === "string" ? p.visualFormat : undefined,
    visualStyleLocked: typeof p.visualStyleLocked === "boolean" ? p.visualStyleLocked : undefined,
    brandApplied: p.brandApplied as StoredPostDraft["brandApplied"],
    brandWarnings: Array.isArray(p.brandWarnings) ? p.brandWarnings.map(String) : undefined,
    visualStyle: typeof p.visualStyle === "string" ? p.visualStyle : undefined,
    visualVariants: Array.isArray(p.visualVariants) ? p.visualVariants as { url: string; score: number }[] : undefined,
    visualCriticNote: typeof p.visualCriticNote === "string" ? p.visualCriticNote : undefined,
    visualBrandApplied: p.visualBrandApplied as StoredPostDraft["visualBrandApplied"],
    visualBrandWarnings: Array.isArray(p.visualBrandWarnings) ? p.visualBrandWarnings.map(String) : undefined,
    strategyId: typeof p.strategyId === "string" ? p.strategyId : undefined,
    strategyLabel: typeof p.strategyLabel === "string" ? p.strategyLabel : undefined,
    strategyRationale: typeof p.strategyRationale === "string" ? p.strategyRationale : undefined,
    awarenessLevel: typeof p.awarenessLevel === "string" ? p.awarenessLevel : undefined,
    visualStrategyId: typeof p.visualStrategyId === "string" ? p.visualStrategyId : undefined,
    visualStrategySource: p.visualStrategySource === "draft" || p.visualStrategySource === "override" ? p.visualStrategySource : undefined,
    topicCompliance:
      p.topicCompliance && typeof p.topicCompliance === "object" && typeof (p.topicCompliance as { passed?: unknown }).passed === "boolean"
        ? {
            passed: (p.topicCompliance as { passed: boolean }).passed,
            violations: Array.isArray((p.topicCompliance as { violations?: unknown }).violations)
              ? ((p.topicCompliance as { violations: string[] }).violations).filter((x): x is string => typeof x === "string")
              : [],
          }
        : undefined,
  };
}

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
