/**
 * Manuální spuštění AI podle pokynu admina.
 * Pouze při stavu WAITING_MANUAL_AI_COMMAND (nebo legacy READY_FOR_AI, AWAITING_MANUAL_PROMPT, INPUT_RECEIVED).
 * Loguje: kdo spustil, kdy, jaký pokyn byl použit.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase-server";
import { runDraftGeneration } from "@/lib/draft-generation";

const ALLOWED_STATUSES = [
  "WAITING_MANUAL_AI_COMMAND",
  "READY_FOR_AI",
  "AWAITING_MANUAL_PROMPT",
  "INPUT_RECEIVED",
] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const instruction = typeof (body as { instruction?: string }).instruction === "string"
      ? (body as { instruction: string }).instruction
      : undefined;

    const supabase = getSupabaseClient();

    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("id, status")
      .eq("id", projectId)
      .single();

    if (projError || !project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const status = (project as { status: string }).status;
    if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json(
        {
          ok: false,
          error: `Projekt musí být ve stavu Čeká na manuální pokyn AI. Aktuální stav: ${status}`,
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const triggeredBy = cookieStore.get("admin_session")?.value ? "admin" : "unknown";

    const { error: logError } = await supabase.from("project_ai_command_log").insert({
      project_id: projectId,
      triggered_by: triggeredBy,
      instruction: instruction ?? null,
    });

    if (logError) {
      console.error("[trigger-ai] Failed to log command:", logError);
    }

    const result = await runDraftGeneration(projectId, {
      instruction,
      targetStatus: "AI_IN_PROGRESS",
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "AI spuštěna podle pokynu.",
      drafts: result.drafts,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[trigger-ai]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
