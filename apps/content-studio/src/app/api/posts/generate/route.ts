import { NextResponse } from "next/server";
import { generateRequestSchema } from "@/lib/posts-schema";
import { chooseProcessingMode } from "@/lib/openai-processing";
import { createJob, getJobById, updateJob } from "@/lib/supabase-jobs";
import { executePostsGenerate } from "@/lib/posts-generate-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // empty body ok
    }
    const parsed = generateRequestSchema.safeParse(body);
    const intakeId = parsed.success ? parsed.data.intakeId : undefined;
    const count = parsed.success ? Math.min(3, Math.max(1, parsed.data.count ?? 3)) : 3;
    const brandLock = parsed.success ? parsed.data.brandLock !== false : true;
    const rush = parsed.success ? parsed.data.rush : false;

    const { mode, reason, useBatch, eta } = chooseProcessingMode({
      jobType: "weekly_posts",
      rush,
    });

    const batchEnabled = process.env.OPENAI_BATCH_ENABLED !== "false";
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY není nastaven" },
        { status: 500 }
      );
    }

    const startedAt = new Date().toISOString();

    if (useBatch && batchEnabled && mode === "batch") {
      try {
        const job = await createJob({
          jobType: "weekly_posts",
          status: "queued",
          payload: {
            intakeId,
            count,
            brandLock,
            strategyMode: parsed.success ? parsed.data.strategyMode : undefined,
            strategyId: parsed.success ? parsed.data.strategyId : undefined,
          },
          processingMode: mode,
          processingReason: reason,
        });
        return NextResponse.json({
          ok: true,
          queued: true,
          jobId: job.id,
          eta: eta ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          processingMode: mode,
          processingReason: reason,
        });
      } catch (e) {
        console.warn("Batch job creation failed, fallback to realtime:", e);
      }
    }

    const result = await executePostsGenerate(openaiKey, {
      intakeId,
      count,
      brandLock,
      strategyMode: parsed.success ? parsed.data.strategyMode : undefined,
      strategyId: parsed.success ? parsed.data.strategyId : undefined,
    });

    const finishedAt = new Date().toISOString();
    const warnings: string[] = [];
    if (useBatch && batchEnabled && mode !== "batch") {
      warnings.push("Batch nebyl použit: fallback na realtime.");
    }

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      intakeId: result.intakeId,
      drafts: result.drafts,
      processingMode: mode,
      processingReason: reason,
      startedAt,
      finishedAt,
      warnings: warnings.length ? warnings : undefined,
    });
  } catch (e) {
    console.error("POST /api/posts/generate", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě serveru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
