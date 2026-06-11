import { randomUUID } from "crypto";
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

  const scanForBrandDna = project.scan_result as {
    brandDna?: {
      positioning?: string;
      uniqueValue?: string;
      targetAudience?: string;
      tone?: string;
      toneOfVoice?: string;
      contentPillars?: string[];
      archetype?: string;
    };
  } | null;
  const brandDna = scanForBrandDna?.brandDna;
  const brandDnaStructured = brandDna
    ? `
- Positioning: ${brandDna.positioning ?? "—"}
- Unique Value: ${brandDna.uniqueValue ?? "—"}
- Target Audience: ${brandDna.targetAudience ?? "—"}
- Tone of Voice: ${brandDna.toneOfVoice ?? brandDna.tone ?? "—"}
- Content Pillars: ${(brandDna.contentPillars ?? []).join(", ") || "—"}
- Brand Archetype: ${brandDna.archetype ?? "—"}
`.trim()
    : "Brand DNA není k dispozici.";

  let prompt = buildPrompt(strategist, {
    kontext,
    brand_dna_structured: brandDnaStructured,
    produkt_sluzba: (project.scan_result as { brandDna?: { name?: string } })?.brandDna?.name ?? project.name ?? project.email ?? "",
    tema_napad: kontext.slice(0, 200),
    cil: kontext.slice(0, 200),
    sdeleni_text: project.manual_input ?? kontext.slice(0, 300),
    produkt: (project.scan_result as { brandDna?: { name?: string } })?.brandDna?.name ?? project.name ?? "",
  });

  const scan = project.scan_result as { admin_notes?: string | null; notes_ai_enabled?: boolean } | null;
  if (scan?.notes_ai_enabled && typeof scan.admin_notes === "string" && scan.admin_notes.trim()) {
    prompt += `\n\nPoznámky kurátora k tomuto projektu:\n${scan.admin_notes.trim()}`;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ ok: false, error: "OPENAI_API_KEY není nastaven. Kontaktujte správce." }, { status: 500 });
  }

  let output: string;
  try {
    const openai = new OpenAI({ apiKey: openaiKey });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
      },
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    output = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      return NextResponse.json({ ok: false, error: "Vypršel časový limit (60 s). Zkuste to znovu." }, { status: 408 });
    }
    if (msg.includes("rate limit") || msg.includes("429")) {
      return NextResponse.json({ ok: false, error: "Příliš mnoho požadavků. Počkejte chvíli a zkuste znovu." }, { status: 429 });
    }
    if (msg.includes("API key") || msg.includes("401") || msg.includes("Incorrect API key")) {
      return NextResponse.json({ ok: false, error: "Neplatný API klíč pro AI. Kontaktujte správce." }, { status: 500 });
    }
    console.error("[run-strategist]", err);
    return NextResponse.json({ ok: false, error: `Generování strategie selhalo: ${msg.slice(0, 120)}` }, { status: 500 });
  }
  const now = new Date().toISOString();
  const scanResult = (project.scan_result ?? {}) as Record<string, unknown>;
  const existingSaved = Array.isArray(scanResult.saved_strategies) ? scanResult.saved_strategies as Array<{ id: string; name?: string; created_at?: string; strategist_id?: string; content?: string }> : [];
  const newEntry = {
    id: randomUUID(),
    name: strategist.name,
    created_at: now,
    strategist_id: strategistId,
    content: output,
  };
  const merged = {
    ...scanResult,
    strategic_plan: output,
    strategist_id: strategistId,
    strategist_run_at: now,
    saved_strategies: [...existingSaved, newEntry],
  };

  const updated = await updateClientProjectScanResult(id, { scan_result: merged });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Nepodařilo se uložit výstup stratega do databáze." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, output });
}
