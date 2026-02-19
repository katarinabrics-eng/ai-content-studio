import { NextResponse } from "next/server";
import { getJobById, updateJob } from "@/lib/supabase-jobs";
import { executePostsGenerate } from "@/lib/posts-generate-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Chybí job ID" }, { status: 400 });
    }

    const job = await getJobById(id);
    if (!job) {
      return NextResponse.json({ ok: false, error: "Job nenalezen" }, { status: 404 });
    }

    if (job.status === "queued" && job.job_type === "weekly_posts") {
      await updateJob(id, { status: "processing", started_at: new Date().toISOString() });

      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        await updateJob(id, {
          status: "failed",
          finished_at: new Date().toISOString(),
          result: { error: "OPENAI_API_KEY není nastaven" },
        });
        return NextResponse.json({
          ok: true,
          jobId: id,
          status: "failed",
          error: "OPENAI_API_KEY není nastaven",
          processingMode: job.processing_mode,
          processingReason: job.processing_reason,
        });
      }

      const payload = job.payload as { intakeId?: string; count?: number; brandLock?: boolean; strategyMode?: string; strategyId?: string };
      const result = await executePostsGenerate(openaiKey, {
        intakeId: payload.intakeId,
        count: payload.count,
        brandLock: payload.brandLock,
        strategyMode: payload.strategyMode,
        strategyId: payload.strategyId,
      });

      const finishedAt = new Date().toISOString();

      if (!result.ok) {
        await updateJob(id, {
          status: "failed",
          finished_at: finishedAt,
          result: { error: result.error },
        });
        return NextResponse.json({
          ok: true,
          jobId: id,
          status: "failed",
          error: result.error,
          processingMode: job.processing_mode,
          processingReason: job.processing_reason,
          startedAt: job.started_at,
          finishedAt,
        });
      }

      await updateJob(id, {
        status: "completed",
        finished_at: finishedAt,
        result: {
          intakeId: result.intakeId,
          drafts: result.drafts,
        },
      });

      return NextResponse.json({
        ok: true,
        jobId: id,
        status: "completed",
        intakeId: result.intakeId,
        drafts: result.drafts,
        processingMode: job.processing_mode,
        processingReason: job.processing_reason,
        startedAt: job.started_at,
        finishedAt,
      });
    }

    const result = job.result as Record<string, unknown> | null;
    return NextResponse.json({
      ok: true,
      jobId: id,
      status: job.status,
      intakeId: result?.intakeId,
      drafts: result?.drafts,
      error: result && "error" in result ? result.error : undefined,
      processingMode: job.processing_mode,
      processingReason: job.processing_reason,
      startedAt: job.started_at,
      finishedAt: job.finished_at,
    });
  } catch (e) {
    console.error("GET /api/jobs/[id]", e);
    const message = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
