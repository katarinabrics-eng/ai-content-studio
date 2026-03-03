import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getProjectById } from "@/lib/supabase-projects";
import { getStrategist, buildPrompt } from "@/lib/strategists/config";
import { projectToStrategistParams, isValidStrategistId } from "@/lib/strategists/project-params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const strategistId = typeof (body as { strategistId?: string }).strategistId === "string"
      ? (body as { strategistId: string }).strategistId
      : null;
    const overrides = typeof (body as { params?: Record<string, string> }).params === "object" && (body as { params: Record<string, string> }).params !== null
      ? (body as { params: Record<string, string> }).params
      : {};

    if (!strategistId || !isValidStrategistId(strategistId)) {
      return NextResponse.json(
        { ok: false, error: "Neplatný strategistId" },
        { status: 400 }
      );
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const strategist = getStrategist(strategistId);
    if (!strategist) {
      return NextResponse.json({ ok: false, error: "Stratega nenalezen" }, { status: 400 });
    }

    const params = { ...projectToStrategistParams(project), ...overrides };
    const prompt = buildPrompt(strategist, params);

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY není nastaven" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    });

    const output = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ ok: true, output });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[run-strategist]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
