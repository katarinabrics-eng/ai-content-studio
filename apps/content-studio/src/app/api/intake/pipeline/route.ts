import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/intake-schema";
import { getSupabaseClient } from "@/lib/supabase-server";
import {
  createProject,
  generatePipelineProjectCode,
  insertProjectFile,
} from "@/lib/supabase-projects";
import { intakeToCreateProjectParams } from "@/lib/intake-pipeline-mapping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "client-projects";
const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const PHOTO_MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const PDF_MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_PHOTOS = 20;
const LOGO_MIME = "image/png";
const PHOTO_MIMES = ["image/jpeg", "image/png", "image/webp"];
const PDF_MIME = "application/pdf";

type PipelineErrorCode =
  | "INVALID_REQUEST"
  | "VALIDATION_FAILED"
  | "LOGO_INVALID"
  | "PHOTO_INVALID"
  | "PDF_INVALID"
  | "PROJECT_CREATE_FAILED"
  | "STORAGE_UPLOAD_FAILED"
  | "BRIEF_UPLOAD_FAILED"
  | "FILES_METADATA_FAILED";

function err(code: PipelineErrorCode, detail: string, status: number) {
  return NextResponse.json(
    { ok: false, error: code, detail },
    { status }
  );
}

function getPayloadFromForm(form: FormData): unknown {
  const raw = form.get("payload");
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function collectFiles(form: FormData, key: string): File[] {
  const list: File[] = [];
  const single = form.get(key);
  if (single instanceof File && single.size > 0) list.push(single);
  const multi = form.getAll(key);
  for (const f of multi) {
    if (f instanceof File && f.size > 0 && !list.includes(f)) list.push(f);
  }
  return list;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return err("INVALID_REQUEST", "Očekává se multipart/form-data", 400);
    }

    const formData = await request.formData();
    const payloadRaw = getPayloadFromForm(formData);
    if (!payloadRaw || typeof payloadRaw !== "object") {
      return err("INVALID_REQUEST", "Chybí nebo neplatné pole payload (JSON)", 400);
    }

    const normalized = {
      ...(payloadRaw as Record<string, unknown>),
      website:
        typeof (payloadRaw as Record<string, unknown>).website === "string" &&
        ((payloadRaw as Record<string, unknown>).website as string).trim() === ""
          ? undefined
          : (payloadRaw as Record<string, unknown>).website,
    };

    const parsed = intakeSchema.safeParse(normalized);
    if (!parsed.success) {
      const messages = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { ok: false, error: "VALIDATION_FAILED", detail: "Validace formuláře selhala", details: messages },
        { status: 400 }
      );
    }

    const logoFiles = collectFiles(formData, "logo");
    const logoFile = logoFiles[0] ?? null;
    const photoFiles = collectFiles(formData, "photos");
    const brandPdfFiles = collectFiles(formData, "brandPdf");
    const brandPdfFile = brandPdfFiles[0] ?? null;

    if (logoFile) {
      if (logoFile.type !== LOGO_MIME) {
        return err("LOGO_INVALID", "Logo musí být PNG (image/png)", 400);
      }
      if (logoFile.size > LOGO_MAX_BYTES) {
        return err("LOGO_INVALID", "Logo může mít maximálně 5 MB", 400);
      }
    }
    for (let i = 0; i < photoFiles.length; i++) {
      const f = photoFiles[i]!;
      if (!PHOTO_MIMES.includes(f.type)) {
        return err("PHOTO_INVALID", `Foto ${i + 1}: povolené typy jsou JPEG, PNG, WebP`, 400);
      }
      if (f.size > PHOTO_MAX_BYTES) {
        return err("PHOTO_INVALID", `Foto ${i + 1}: maximálně 15 MB`, 400);
      }
    }
    if (photoFiles.length > MAX_PHOTOS) {
      return err("PHOTO_INVALID", `Maximálně ${MAX_PHOTOS} fotek`, 400);
    }
    if (brandPdfFile) {
      if (brandPdfFile.type !== PDF_MIME) {
        return err("PDF_INVALID", "Brand manuál musí být PDF", 400);
      }
      if (brandPdfFile.size > PDF_MAX_BYTES) {
        return err("PDF_INVALID", "PDF může mít maximálně 20 MB", 400);
      }
    }

    const projectCode = generatePipelineProjectCode();
    const storagePrefix = `projects/${projectCode}/`;

    const emailRaw = typeof (normalized as Record<string, unknown>).client_email === "string"
      ? (normalized as Record<string, unknown>).client_email as string
      : null;
    const clientEmail =
      emailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw.trim()) ? emailRaw.trim() : null;

    const createParams = intakeToCreateProjectParams(parsed.data, { client_email: clientEmail });
    createParams.project_code = projectCode;
    createParams.storage_prefix = storagePrefix;
    createParams.plan_id = "basic";

    let projectId: string;
    let pin: string | undefined;
    let projectCodeReturn: string | undefined;

    try {
      const result = await createProject(createParams);
      projectId = result.project.id;
      pin = result.pin;
      projectCodeReturn = result.projectCode ?? projectCode;
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      console.error("[intake/pipeline] createProject:", detail);
      return err("PROJECT_CREATE_FAILED", detail, 500);
    }

    const supabase = getSupabaseClient();
    const fileEntries: { path: string; url: string }[] = [];
    let logoUrl: string | null = null;
    let brandPdfUrl: string | null = null;

    const upload = async (
      path: string,
      body: Buffer | Blob,
      contentType: string,
      meta: { original_name?: string; kind: "logo" | "photo" | "manual"; size: number }
    ): Promise<string | null> => {
      const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
        contentType,
        upsert: false,
      });
      if (error) {
        console.error("[intake/pipeline] storage upload error:", path, error);
        return null;
      }
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const url = urlData?.publicUrl ?? "";
      fileEntries.push({ path, url });
      await insertProjectFile({
        project_id: projectId,
        storage_path: path,
        kind: meta.kind,
        original_name: meta.original_name ?? null,
        content_type: contentType,
        size_bytes: meta.size,
      });
      return url;
    };

    if (logoFile) {
      const path = `${storagePrefix}assets/logo/logo.png`;
      const buf = Buffer.from(await logoFile.arrayBuffer());
      const u = await upload(path, buf, LOGO_MIME, {
        kind: "logo",
        original_name: logoFile.name,
        size: logoFile.size,
      });
      if (u) logoUrl = u;
    }

    for (let i = 0; i < photoFiles.length; i++) {
      const f = photoFiles[i]!;
      const ext = f.name.split(".").pop() || "jpg";
      const path = `${storagePrefix}assets/photos/photo_${String(i + 1).padStart(2, "0")}.${ext}`;
      const buf = Buffer.from(await f.arrayBuffer());
      await upload(path, buf, f.type, {
        kind: "photo",
        original_name: f.name,
        size: f.size,
      });
    }

    if (brandPdfFile) {
      const safeName = brandPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "brand-manual.pdf";
      const path = `${storagePrefix}assets/manual/${safeName}`;
      const buf = Buffer.from(await brandPdfFile.arrayBuffer());
      const u = await upload(path, buf, PDF_MIME, {
        kind: "manual",
        original_name: brandPdfFile.name,
        size: brandPdfFile.size,
      });
      if (u) brandPdfUrl = u;
    }

    if (logoUrl || brandPdfUrl) {
      const { data: brief } = await supabase
        .from("project_brief")
        .select("project_id")
        .eq("project_id", projectId)
        .single();
      if (brief) {
        const updates: { logo_url?: string; brand_pdf_url?: string; updated_at: string } = {
          updated_at: new Date().toISOString(),
        };
        if (logoUrl) updates.logo_url = logoUrl;
        if (brandPdfUrl) updates.brand_pdf_url = brandPdfUrl;
        await supabase.from("project_brief").update(updates).eq("project_id", projectId);
      }
    }

    const briefPayload = {
      ...parsed.data,
      client_email: clientEmail,
      logo_url: logoUrl,
      brand_pdf_url: brandPdfUrl,
      submitted_at: new Date().toISOString(),
    };
    const contextLines = [
      `Značka: ${parsed.data.brandName}`,
      `Obor: ${parsed.data.industry}`,
      `Cílová skupina: ${parsed.data.targetAudience}`,
      `Nabídky: ${parsed.data.offers}`,
      `Tón: ${parsed.data.toneOfVoice}`,
      `Cíl obsahu: ${parsed.data.contentGoal}`,
      `Platformy: ${(parsed.data.platforms ?? []).join(", ")}`,
      `Web: ${parsed.data.website ?? ""}`,
      `Poznámka: ${(parsed.data as Record<string, unknown>).forbiddenWords ?? ""}`,
    ];
    const manifestPayload = {
      project_code: projectCode,
      project_id: projectId,
      storage_prefix: storagePrefix,
      files: fileEntries.map((e) => ({ path: e.path, url: e.url })),
      created_at: new Date().toISOString(),
    };

    const briefJson = JSON.stringify(briefPayload, null, 2);
    const contextTxt = contextLines.join("\n");
    const manifestJson = JSON.stringify(manifestPayload, null, 2);

    const { error: errBrief } = await supabase.storage
      .from(BUCKET)
      .upload(`${storagePrefix}brief.json`, new Blob([briefJson], { type: "application/json" }), { upsert: true });
    if (errBrief) {
      console.error("[intake/pipeline] brief.json upload:", errBrief);
      return err("BRIEF_UPLOAD_FAILED", errBrief.message, 500);
    }
    const { error: errContext } = await supabase.storage
      .from(BUCKET)
      .upload(`${storagePrefix}context.txt`, new Blob([contextTxt], { type: "text/plain" }), { upsert: true });
    if (errContext) {
      console.error("[intake/pipeline] context.txt upload:", errContext);
      return err("BRIEF_UPLOAD_FAILED", errContext.message, 500);
    }
    const { error: errManifest } = await supabase.storage
      .from(BUCKET)
      .upload(`${storagePrefix}manifest.json`, new Blob([manifestJson], { type: "application/json" }), { upsert: true });
    if (errManifest) {
      console.error("[intake/pipeline] manifest.json upload:", errManifest);
      return err("BRIEF_UPLOAD_FAILED", errManifest.message, 500);
    }

    const baseUrl =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return NextResponse.json({
      ok: true,
      projectId,
      projectCode: projectCodeReturn,
      pin: pin ?? null,
      storage_prefix: storagePrefix,
      message: pin
        ? "Projekt vytvořen. Uložte si kód a PIN pro přístup."
        : "Projekt vytvořen.",
      loginUrl: pin ? `${baseUrl.replace(/\/$/, "")}/project/login?code=${encodeURIComponent(projectCodeReturn ?? "")}` : undefined,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[intake/pipeline]", e);
    return NextResponse.json(
      { ok: false, error: "PIPELINE_ERROR", detail },
      { status: 500 }
    );
  }
}
