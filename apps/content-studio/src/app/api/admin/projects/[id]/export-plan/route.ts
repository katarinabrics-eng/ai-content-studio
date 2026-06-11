import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getProjectById } from "@/lib/supabase-projects";
import { loadStrategistOutput } from "@/lib/proposal-generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProposalRow = {
  format: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  visual_brief: string;
  selected_for_client: boolean;
  created_at: string;
};

const SEP = "================================================================================";
const SUB = "--------------------------------------------------------------------------------";

function escapeTxt(s: string): string {
  return s.replace(/\r/g, "").trim();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Projekt nenalezen" }, { status: 404 });
    }

    const brief = project.brief as Record<string, unknown> | null;
    const projectCode = (project as { project_code?: string | null }).project_code ?? projectId.slice(0, 8);
    const storagePrefix = (project as { storage_prefix?: string | null }).storage_prefix ?? null;
    const strategistOutput = await loadStrategistOutput(storagePrefix);

    const supabase = getSupabaseClient();
    const { data: proposals } = await supabase
      .from("project_proposals")
      .select("format, hook, body, cta, hashtags, visual_brief, selected_for_client, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    const list = (proposals ?? []) as ProposalRow[];

    const lines: string[] = [];
    const nl = "\n";

    lines.push("STRATEGICKÝ PLÁN NA TVORBU VIZUÁLŮ");
    lines.push(SEP);
    lines.push("");

    lines.push("1. ZÁKLADNÍ ÚDAJE PROJEKTU");
    lines.push(SUB);
    lines.push(`Projekt:     ${escapeTxt(String(brief?.brand_name ?? "—"))}`);
    lines.push(`Kód:         ${projectCode}`);
    lines.push(`Datum:       ${new Date().toLocaleDateString("cs-CZ")}`);
    lines.push(`Obor:        ${escapeTxt(String(brief?.industry ?? "—"))}`);
    lines.push(`Cíl:         ${escapeTxt(String(brief?.communication_goal ?? "—"))}`);
    lines.push(`Platformy:   ${Array.isArray(brief?.platforms) ? (brief.platforms as string[]).join(", ") : "—"}`);
    lines.push(`Tonalita:    ${escapeTxt(String(brief?.tone_of_voice ?? "—"))}`);
    if (brief?.target_audience) lines.push(`Cílová skupina: ${escapeTxt(String(brief.target_audience))}`);
    if (brief?.offers) lines.push(`Nabídky:     ${escapeTxt(String(brief.offers))}`);
    if (brief?.brand_colors) lines.push(`Barvy:       ${escapeTxt(String(brief.brand_colors))}`);
    if (brief?.brand_fonts) lines.push(`Fonty:       ${escapeTxt(String(brief.brand_fonts))}`);
    lines.push("");

    lines.push("2. STRATEGIE");
    lines.push(SUB);
    if (strategistOutput && strategistOutput.trim()) {
      lines.push(escapeTxt(strategistOutput));
    } else {
      lines.push("(Strategie zatím nebyla spuštěna nebo není uložena v projektu.)");
    }
    lines.push("");

    lines.push("3. TEXTY PŘÍSPĚVKŮ A POPIS VIZUÁLŮ");
    lines.push(SUB);
    if (list.length === 0) {
      lines.push("(Zatím žádné návrhy. Vygenerujte je v sekci „Vytvoření příspěvku dle strategie“.)");
    } else {
      list.forEach((p, i) => {
        lines.push(`--- Návrh ${i + 1} · ${p.format}${p.selected_for_client ? " · VYBRÁNO PRO KLIENTA" : ""} ---`);
        lines.push(`Hook:    ${escapeTxt(p.hook)}`);
        lines.push(`Body:   ${escapeTxt(p.body)}`);
        lines.push(`CTA:    ${escapeTxt(p.cta)}`);
        if (p.hashtags?.length) lines.push(`Hashtags: ${(p.hashtags as string[]).join(" ")}`);
        if (p.visual_brief?.trim()) lines.push(`Vizuál:  ${escapeTxt(p.visual_brief)}`);
        lines.push("");
      });
    }

    lines.push("4. PRO GRAFIKA / VIZUÁLNÍ BRIEF");
    lines.push(SUB);
    lines.push("(Bude doplněno agentem grafika.)");
    lines.push("");
    lines.push(SEP);
    lines.push("Konec exportu.");

    const body = lines.join(nl);
    const filename = `strategicky-plan-${projectCode.replace(/\s/g, "-")}.txt`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[export-plan]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
