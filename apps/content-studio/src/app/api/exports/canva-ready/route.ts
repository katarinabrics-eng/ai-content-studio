import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getIntakeByIdOrLast } from "@/lib/supabase-intake";
import { getPostDraftsByIntakeId } from "@/lib/supabase-posts";
import { getSupabaseClient } from "@/lib/supabase-server";
import { getBrandSpecFromIntake } from "@/lib/brand-spec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EXPORTS_BUCKET = process.env.SUPABASE_EXPORTS_BUCKET ?? "exports";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "client";
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "image/*" } });
    if (!res.ok) return null;
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  } catch {
    return null;
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      intakeId?: string;
      draftIds?: string[];
      format?: "png" | "jpg";
      packageName?: string;
    };

    const intakeId = typeof body.intakeId === "string" ? body.intakeId : undefined;
    const draftIds = Array.isArray(body.draftIds) ? body.draftIds.filter((x): x is string => typeof x === "string") : undefined;
    const format = body.format === "jpg" ? "jpg" : "png";

    const intake = await getIntakeByIdOrLast(intakeId);
    if (!intake) {
      return NextResponse.json(
        { ok: false, error: "EXPORT_FAILED", detail: "Intake nebyl nalezen.", hint: "Zkontrolujte intakeId nebo nejdřív odešlete intake." },
        { status: 404 }
      );
    }

    const allDrafts = await getPostDraftsByIntakeId(intake.id);
    const toStoredDraft = (row: { id: string; intake_id: string; created_at: string; payload: Record<string, unknown> }) => {
      const p = row.payload;
      const hasVisual = typeof p.visualImageUrl === "string" || typeof p.visualBaseImageUrl === "string";
      return { row, hasVisual, payload: p };
    };

    const approvedDrafts = allDrafts
      .map(toStoredDraft)
      .filter((d) => d.hasVisual)
      .sort((a, b) => (b.row.created_at ?? "").localeCompare(a.row.created_at ?? ""))
      .slice(0, 4);

    let draftsToExport: { row: { id: string; intake_id: string; created_at: string }; payload: Record<string, unknown> }[];
    if (draftIds && draftIds.length > 0) {
      if (draftIds.length > 4) {
        return NextResponse.json(
          { ok: false, error: "EXPORT_FAILED", detail: "Lze vybrat maximálně 4 drafty.", hint: "Označte 1–4 návrhy pro export." },
          { status: 400 }
        );
      }
      const byId = new Map(approvedDrafts.map((d) => [d.row.id, d]));
      draftsToExport = draftIds
        .map((id) => byId.get(id))
        .filter((d): d is NonNullable<typeof d> => d != null);
      if (draftsToExport.length === 0) {
        return NextResponse.json(
          { ok: false, error: "NO_DRAFTS_SELECTED", detail: "Žádný vybraný draft nemá vizuál.", hint: "Vyberte drafty s vygenerovaným vizuálem." },
          { status: 400 }
        );
      }
    } else {
      draftsToExport = approvedDrafts;
    }

    if (draftsToExport.length === 0) {
      return NextResponse.json(
        { ok: false, error: "MISSING_VISUALS", detail: "Žádný draft nemá vizuál k exportu.", hint: "Vygenerujte vizuály pro drafty a zkuste znovu." },
        { status: 400 }
      );
    }

    const brandSpec = getBrandSpecFromIntake(intake as Record<string, unknown>);
    const packageName = typeof body.packageName === "string" && body.packageName.trim() ? body.packageName.trim() : undefined;
    const clientSlug = packageName ? slugify(packageName) : slugify(String((intake as Record<string, unknown>).brandName ?? "client"));
    const dateStr = new Date().toISOString().slice(0, 10);
    const rootDir = `export-${dateStr}-${clientSlug}`;

    const zip = new JSZip();
    const warnings: string[] = [];

    for (let i = 0; i < draftsToExport.length; i++) {
      const { row, payload } = draftsToExport[i];
      const num = String(i + 1).padStart(2, "0");
      const imgUrl = (payload.visualImageUrl ?? payload.visualBaseImageUrl) as string | undefined;
      const ext = format;

      const txtContent = [
        `Hook: ${String(payload.hook ?? "")}`,
        `Caption: ${String(payload.caption ?? "")}`,
        `CTA: ${String(payload.cta ?? "")}`,
        `Hashtags: ${Array.isArray(payload.hashtags) ? payload.hashtags.join(" ") : String(payload.hashtags ?? "")}`,
        `Visual brief: ${String(payload.visualBrief ?? "")}`,
      ].join("\n\n");

      zip.file(`${rootDir}/texts/post-${num}.txt`, txtContent);

      if (imgUrl) {
        const buf = await fetchImageBuffer(imgUrl);
        if (buf) {
          zip.file(`${rootDir}/assets/post-${num}.${ext}`, buf, { binary: true });
        } else {
          warnings.push(`Post ${num} (${row.id}): Nepodařilo se stáhnout obrázek z ${imgUrl}`);
        }
      } else {
        warnings.push(`Post ${num} (${row.id}): Chybí URL vizuálu`);
      }
    }

    const brandJson = {
      brandName: (intake as Record<string, unknown>).brandName ?? "",
      website: (intake as Record<string, unknown>).website ?? "",
      toneOfVoice: (intake as Record<string, unknown>).toneOfVoice ?? "",
      brandColors: brandSpec.colors,
      brandFonts: brandSpec.fonts,
      logoUrl: brandSpec.logoUrl ?? "",
      forbiddenWords: brandSpec.forbiddenWords,
    };

    zip.file(`${rootDir}/meta/brand.json`, JSON.stringify(brandJson, null, 2));

    const postsJson = draftsToExport.map(({ row, payload }, i) => ({
      post_id: row.id,
      platform: payload.platform ?? "instagram",
      strategyLabel: payload.strategyLabel ?? "",
      visualStyleLabel: payload.visualStyleLabel ?? "",
      creativeScore: typeof payload.visualCreativeScore === "number" ? payload.visualCreativeScore : undefined,
    }));

    zip.file(`${rootDir}/meta/posts.json`, JSON.stringify(postsJson, null, 2));

    const csvRows = [
      ["post_id", "platform", "hook", "caption", "cta", "hashtags"].map(escapeCsv).join(","),
      ...draftsToExport.map(({ row, payload }) =>
        [
          row.id,
          String(payload.platform ?? ""),
          String(payload.hook ?? ""),
          String(payload.caption ?? ""),
          String(payload.cta ?? ""),
          Array.isArray(payload.hashtags) ? payload.hashtags.join(" ") : String(payload.hashtags ?? ""),
        ]
          .map(escapeCsv)
          .join(",")
      ),
    ];
    zip.file(`${rootDir}/meta/captions.csv`, csvRows.join("\n"));

    const readmeContent = [
      "Canva-ready export balíček",
      "==========================",
      "",
      `Exportován: ${new Date().toISOString()}`,
      `Značka: ${brandJson.brandName}`,
      `Počet postů: ${draftsToExport.length}`,
      "",
      "Struktura:",
      "  assets/   - obrázky (PNG/JPG)",
      "  texts/    - texty postů (hook, caption, CTA, hashtags, visual brief)",
      "  meta/     - brand.json, posts.json, captions.csv",
      "",
      ...(warnings.length > 0 ? ["\nUpozornění:\n" + warnings.map((w) => "  - " + w).join("\n")] : []),
    ].join("\n");

    zip.file(`${rootDir}/README.txt`, readmeContent);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const timestamp = Date.now();
    const zipPath = `packages/${intake.id}/${timestamp}-canva-ready.zip`;

    const supabase = getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(EXPORTS_BUCKET)
      .upload(zipPath, zipBuffer, { contentType: "application/zip", upsert: true });

    if (uploadError) {
      return NextResponse.json(
        {
          ok: false,
          error: "EXPORT_FAILED",
          detail: `Chyba při ukládání ZIP: ${uploadError.message}`,
          hint: `Zkontrolujte, že bucket "${EXPORTS_BUCKET}" existuje a má správná oprávnění. Viz README.`,
        },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from(EXPORTS_BUCKET).getPublicUrl(zipPath);
    const downloadUrl = urlData.publicUrl;

    return NextResponse.json({
      ok: true,
      downloadUrl,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (e) {
    console.error("POST /api/exports/canva-ready", e);
    const message = e instanceof Error ? e.message : "Došlo k chybě při exportu";
    return NextResponse.json(
      { ok: false, error: "EXPORT_FAILED", detail: message, hint: "Zkuste to znovu nebo kontaktujte podporu." },
      { status: 500 }
    );
  }
}
