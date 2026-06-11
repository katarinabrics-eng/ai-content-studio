import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientProjectById } from "@/lib/supabase-client-projects";
import { buildNotebookLMSources } from "@/lib/client-output-builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const project = await getClientProjectById(id);
  if (!project) return NextResponse.json({ error: "Záznam nenalezen" }, { status: 404 });

  const hasPlan = project.scan_result != null && (
    typeof (project.scan_result as { strategic_plan?: unknown }).strategic_plan === "string" ||
    typeof (project.scan_result as { strategic_plan?: unknown }).strategic_plan === "object"
  );
  if (!hasPlan) {
    return NextResponse.json(
      { error: "Projekt nemá strategický plán. Nejdřív spusť stratéga." },
      { status: 400 }
    );
  }

  const sources = buildNotebookLMSources(project);

  return NextResponse.json({
    mode: "manual",
    notebookTitle: `${project.name ?? "Projekt"} — Strategický průvodce`,
    instruction: [
      "1. Otevři notebooklm.google.com",
      "2. Vytvoř nový notebook s názvem z 'notebookTitle'",
      "3. Přidej zdroje v tomto pořadí (každý jako .txt soubor nebo paste text):",
      "   → Zdroj 1: Brand DNA & diagnostika",
      "   → Zdroj 2: Strategický plán",
      "   → Zdroj 3: Akční plán",
      "   → Zdroj 4: Připravené příspěvky",
      "   → Zdroj 5: Průvodce pro AI (PŘIDEJ JAKO POSLEDNÍ)",
      "4. Počkej až NotebookLM zpracuje zdroje (~2 min)",
      "5. Klikni 'Generate audio overview' pro podcast verzi",
      "6. Sdílej odkaz na notebook s klientem",
    ].join("\n"),
    sources: sources.map((s, idx) => ({
      order: idx + 1,
      filename: s.filename,
      title: s.title,
      description: s.description,
      content: s.content,
      characterCount: s.content.length,
    })),
  });
}
