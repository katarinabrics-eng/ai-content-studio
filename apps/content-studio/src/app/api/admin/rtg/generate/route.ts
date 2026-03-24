import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { getSupabaseClient } from "@/lib/supabase-server";
import {
  buildBrandContext,
  buildTextAgentSystemPrompt,
  buildImageAgentSystemPrompt,
} from "@/lib/agents/brand-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// ── Auth ──────────────────────────────────────────────────────────────────────

function isAuthed() {
  return cookies().get("admin_session")?.value === "1";
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey: key });
}

// ── Plan limits ───────────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, { videos: number; graphics: number }> = {
  start: { videos: 2, graphics: 2 },
  plus:  { videos: 4, graphics: 4 },
  pro:   { videos: 8, graphics: 10 },
};

// ── Week helpers ──────────────────────────────────────────────────────────────

function getCurrentWeekLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const fmt = (d: Date) =>
    d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });
  return `Týden ${fmt(monday)}–${fmt(friday)}`;
}

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0]!;
}

// ── Content pillars ───────────────────────────────────────────────────────────

const PILLARS = ["vzdělávání", "inspirace", "zákulisí", "produkt"] as const;

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({})) as { project_id?: string };
    const { project_id } = body;

    if (!project_id) {
      return NextResponse.json({ error: "Chybí project_id" }, { status: 400 });
    }

    // 1. Brand kontext
    const brandContext = await buildBrandContext(project_id);
    if (!brandContext) {
      return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });
    }

    const supabase = getSupabaseClient();
    const openai = getOpenAI();

    // 2. Plan limits
    const limits = PLAN_LIMITS[brandContext.plan] ?? PLAN_LIMITS["start"]!;
    const graphicsCount = limits.graphics;

    console.log(`[generate] Projekt: ${brandContext.client_name} | Plán: ${brandContext.plan} | Grafiky: ${graphicsCount}`);

    // 3. Vytvoř content_batch
    const now = new Date().toISOString();
    const { data: batchData, error: batchError } = await supabase
      .from("content_batches")
      .insert({
        project_id,
        week_label: getCurrentWeekLabel(),
        week_start: getCurrentWeekStart(),
        status: "pending",
        items_total: graphicsCount * 2,
        items_approved: 0,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (batchError || !batchData) {
      console.error("[generate] Chyba při vytváření batche:", batchError);
      return NextResponse.json({ error: "Nepodařilo se vytvořit batch" }, { status: 500 });
    }

    const batch_id = (batchData as { id: string }).id;
    console.log(`[generate] Batch vytvořen: ${batch_id}`);

    const systemPrompt = buildTextAgentSystemPrompt(brandContext);
    const imageSystemPrompt = buildImageAgentSystemPrompt(brandContext);
    let postsCreated = 0;

    // 4. Generuj pro každý grafický příspěvek
    for (let i = 0; i < graphicsCount; i++) {
      const pillar = PILLARS[i % PILLARS.length]!;
      console.log(`[generate] Generuji pár ${i + 1}/${graphicsCount} — pilíř: ${pillar}`);

      // ── GPT-4o: texty ────────────────────────────────────────────────────
      let variantA = { hook: "", body: "", cta: "" };
      let variantB = { hook: "", body: "", cta: "" };

      try {
        const textRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Vygeneruj grafický příspěvek číslo ${i + 1} z ${graphicsCount}.
Pilíř: ${pillar}
Platforma: instagram

Vrať JSON:
{
  "variantA": { "hook": string, "body": string, "cta": string },
  "variantB": { "hook": string, "body": string, "cta": string }
}
Pouze JSON, žádný text kolem.`,
            },
          ],
          temperature: 0.8,
          response_format: { type: "json_object" },
        });

        const raw = textRes.choices[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(raw) as {
          variantA?: { hook?: string; body?: string; cta?: string };
          variantB?: { hook?: string; body?: string; cta?: string };
        };
        variantA = {
          hook: parsed.variantA?.hook ?? "",
          body: parsed.variantA?.body ?? "",
          cta:  parsed.variantA?.cta  ?? "",
        };
        variantB = {
          hook: parsed.variantB?.hook ?? "",
          body: parsed.variantB?.body ?? "",
          cta:  parsed.variantB?.cta  ?? "",
        };
      } catch (textErr) {
        console.error(`[generate] GPT-4o chyba pro pár ${i + 1}:`, textErr);
      }

      // ── DALL-E 3: obrázek pro variantu A ────────────────────────────────
      let dalleUrl: string | null = null;

      try {
        const imagePrompt =
          `${imageSystemPrompt}\n\nCreate a social media graphic for: ${variantA.hook || pillar}` +
          `\nStyle: ${brandContext.visual_style}` +
          `\nColors: ${brandContext.color_palette.join(", ")}` +
          `\nAspect ratio: 1:1, clean minimal style, no text in image`;

        const imageRes = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        });

        dalleUrl = imageRes.data?.[0]?.url ?? null;
        console.log(`[generate] DALL-E pár ${i + 1}: ${dalleUrl ? "OK" : "null"}`);
      } catch (imgErr) {
        console.error(`[generate] DALL-E chyba pro pár ${i + 1}:`, imgErr);
      }

      // 5. Ulož oba posty do DB
      const { error: insertError } = await supabase
        .from("content_posts")
        .insert([
          {
            batch_id,
            project_id,
            type: "graphic",
            variant: "A",
            pair_index: i,
            status: "client_review",
            hook: variantA.hook || null,
            body: variantA.body || null,
            cta:  variantA.cta  || null,
            thumbnail_url: dalleUrl,
            output_url:    dalleUrl,
            platform: "instagram",
            created_at: now,
            updated_at: now,
          },
          {
            batch_id,
            project_id,
            type: "graphic",
            variant: "B",
            pair_index: i,
            status: "client_review",
            hook: variantB.hook || null,
            body: variantB.body || null,
            cta:  variantB.cta  || null,
            thumbnail_url: null,
            output_url:    null,
            platform: "instagram",
            created_at: now,
            updated_at: now,
          },
        ]);

      if (insertError) {
        console.error(`[generate] Chyba při ukládání postů pro pár ${i + 1}:`, insertError);
      } else {
        postsCreated += 2;
      }
    }

    // 6. Aktualizuj batch — skutečný počet vložených postů
    await supabase
      .from("content_batches")
      .update({ items_total: postsCreated, updated_at: now })
      .eq("id", batch_id);

    console.log(`[generate] Hotovo. Batch: ${batch_id}, posty: ${postsCreated}`);

    // 7. Odpověď
    return NextResponse.json({ ok: true, batch_id, posts_created: postsCreated });

  } catch (err) {
    console.error("[generate] Neočekávaná chyba:", err);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
