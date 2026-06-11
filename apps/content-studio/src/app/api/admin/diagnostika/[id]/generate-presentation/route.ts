import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientProjectById, updateClientProjectScanResult } from "@/lib/supabase-client-projects";
import { buildGammaInput, buildNotebookLMSources } from "@/lib/client-output-builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GAMMA_API_KEY = process.env.GAMMA_API_KEY ?? "";
const GAMMA_API_URL = "https://public-api.gamma.app/v1.0/generations";
const GAMMA_THEME_ID = process.env.GAMMA_THEME_ID ?? "";

function isAuthed() {
  const store = cookies();
  return store.get("admin_session")?.value === "1";
}

async function pollGammaGeneration(
  generationId: string,
  maxAttempts = 36,
  intervalMs = 5000
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const res = await fetch(`${GAMMA_API_URL}/${generationId}`, {
      headers: { "X-API-KEY": GAMMA_API_KEY },
    });
    const data = (await res.json()) as { status?: string; gammaUrl?: string };
    if (data.status === "completed" && data.gammaUrl) return data.gammaUrl;
    if (data.status === "failed") {
      throw new Error(`Gamma generování selhalo: ${generationId}`);
    }
  }
  throw new Error("Gamma generování překročilo časový limit (3 min)");
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
      { error: "Projekt nemá aktivní strategický plán. Nejdřív spusť stratéga." },
      { status: 400 }
    );
  }

  const gammaInput = buildGammaInput(project);
  const notebookSources = buildNotebookLMSources(project);

  if (!GAMMA_API_KEY) {
    return NextResponse.json({
      mode: "manual",
      gamma: {
        instruction: "Zkopíruj gammaInputText do Gamma.app → Nový projekt → Vložit obsah → Preserve",
        gammaInputText: gammaInput,
        recommendedSettings: {
          textMode: "preserve",
          format: "presentation",
          numCards: gammaInput.split("\n---\n").length,
          tone: "professional, inspiring",
          language: "cs",
        },
      },
      notebookLM: {
        instruction: "Nahraj tyto soubory do NotebookLM jako zdroje. Doporučené pořadí: 1→2→3→4→5",
        sources: notebookSources.map((s) => ({
          filename: s.filename,
          title: s.title,
          description: s.description,
          content: s.content,
        })),
      },
    });
  }

  try {
    const cardCount = gammaInput.split("\n---\n").length;
    const generateRes = await fetch(GAMMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": GAMMA_API_KEY,
      },
      body: JSON.stringify({
        inputText: gammaInput,
        textMode: "preserve",
        format: "presentation",
        numCards: cardCount,
        cardSplit: "inputTextBreaks",
        ...(GAMMA_THEME_ID && { themeId: GAMMA_THEME_ID }),
        textOptions: {
          amount: "detailed",
          tone: "professional, inspiring, warm",
          language: "cs",
        },
        imageOptions: {
          source: "aiGenerated",
          model: "imagen-4-pro",
          style: "clean, modern, professional",
        },
        cardOptions: {
          dimensions: "fluid",
          headerFooter: {
            bottomRight: { type: "cardNumber" },
            hideFromFirstCard: true,
            hideFromLastCard: true,
          },
        },
        sharingOptions: {
          workspaceAccess: "view",
          externalAccess: "view",
        },
      }),
    });

    if (!generateRes.ok) {
      const err = (await generateRes.json()) as { message?: string };
      throw new Error(err?.message ?? `Gamma API error ${generateRes.status}`);
    }

    const { generationId } = (await generateRes.json()) as { generationId?: string };
    if (!generationId) throw new Error("Gamma nevrátil generationId");

    const gammaUrl = await pollGammaGeneration(generationId);

    const scanResult = (project.scan_result ?? {}) as Record<string, unknown>;
    const merged = {
      ...scanResult,
      gamma_presentation_url: gammaUrl,
      gamma_generated_at: new Date().toISOString(),
    };
    const updated = await updateClientProjectScanResult(id, { scan_result: merged });
    if (!updated) {
      return NextResponse.json({ error: "Nepodařilo se uložit odkaz na prezentaci" }, { status: 500 });
    }

    return NextResponse.json({
      mode: "api",
      gammaUrl,
      notebookLM: {
        instruction: "Nahraj tyto soubory do NotebookLM",
        sources: notebookSources,
      },
    });
  } catch (error) {
    console.error("Gamma API error:", error);
    return NextResponse.json({
      mode: "manual_fallback",
      error: error instanceof Error ? error.message : String(error),
      gamma: { gammaInputText: gammaInput },
      notebookLM: { sources: notebookSources },
    });
  }
}
