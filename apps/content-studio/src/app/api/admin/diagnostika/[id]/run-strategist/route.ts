import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { getClientProjectById, updateClientProjectScanResult } from "@/lib/supabase-client-projects";
import { getStrategist, buildPrompt, type StrategistId } from "@/lib/strategists/config";
import { isValidStrategistId } from "@/lib/strategists/project-params";
import { buildDiagnostikaContext } from "@/lib/diagnostika-strategist-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

/** POST: Spustí stratega na záznamu diagnostiky (client_project). Kontext = scan_result + manual_input. Výstup uloží do scan_result.strategic_plan. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const strategistId = typeof (body as { strategistId?: string }).strategistId === "string"
    ? (body as { strategistId: string }).strategistId
    : null;

  if (!strategistId || !isValidStrategistId(strategistId)) {
    return NextResponse.json({ ok: false, error: "Neplatný strategistId" }, { status: 400 });
  }

  const project = await getClientProjectById(id);
  if (!project) return NextResponse.json({ error: "Záznam nenalezen" }, { status: 404 });

  const strategist = getStrategist(strategistId as StrategistId);
  if (!strategist) return NextResponse.json({ error: "Stratega nenalezen" }, { status: 400 });

  const kontext = buildDiagnostikaContext({
    scan_result: project.scan_result as Record<string, unknown>,
    manual_input: project.manual_input,
    name: project.name,
    email: project.email,
    web_url: project.web_url,
  });

  const prompt = buildPrompt(strategist, {
    kontext,
    produkt_sluzba: (project.scan_result as { brandDna?: { name?: string } })?.brandDna?.name ?? project.name ?? project.email ?? "",
    tema_napad: kontext.slice(0, 200),
    cil: kontext.slice(0, 200),
    sdeleni_text: project.manual_input ?? kontext.slice(0, 300),
    produkt: (project.scan_result as { brandDna?: { name?: string } })?.brandDna?.name ?? project.name ?? "",
  });

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY není nastaven" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
  });

  const output = completion.choices[0]?.message?.content?.trim() ?? "";
  const scanResult = (project.scan_result ?? {}) as Record<string, unknown>;
  const merged = {
    ...scanResult,
    strategic_plan: output,
    strategist_id: strategistId,
    strategist_run_at: new Date().toISOString(),
  };

  const updated = await updateClientProjectScanResult(id, { scan_result: merged });
  if (!updated) {
    return NextResponse.json({ error: "Nepodařilo se uložit výstup stratega" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, output });
}
