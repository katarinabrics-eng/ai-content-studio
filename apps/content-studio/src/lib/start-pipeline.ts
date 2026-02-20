/**
 * Intake Pipeline v1: unified flow pro /start submit.
 * Reuse createProject, přidá Storage (brief, context, manifest, files).
 */

import { getSupabaseClient } from "./supabase-server";
import {
  createProject,
  createProjectAccessToken,
  generatePipelineProjectCode,
  insertProjectFile,
} from "./supabase-projects";
import { projectStoragePrefix, fullPath, PATH } from "./project-paths";
import { normalizeStartForm, validateRequiredBrief, type BriefSchema } from "./brief-normalizer";
import { uploadFile, ensurePlaceholderDirs } from "./storage-upload";
import { buildManifest, saveManifest } from "./project-manifest";
import { appendEvent } from "./project-events";

export type StartPipelineInput = Record<string, unknown>;

export type StartPipelineFiles = {
  logo?: File | null;
  photos?: File[];
  brandPdf?: File | null;
};

const BUCKET = "client-projects";
const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const PHOTO_MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const PDF_MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_PHOTOS = 20;
const LOGO_MIME = "image/png";
const PHOTO_MIMES = ["image/jpeg", "image/png", "image/webp"];
const PDF_MIME = "application/pdf";

function briefToContext(brief: BriefSchema): string {
  return [
    `Značka: ${brief.brand_name}`,
    `Obor: ${brief.industry}`,
    `Cíl komunikace: ${brief.communication_goal}`,
    `Cílová skupina: ${brief.target_audience ?? ""}`,
    `Nabídky: ${brief.offers ?? ""}`,
    `Tón: ${brief.tone_of_voice}`,
    `Platformy: ${brief.platforms?.join(", ") ?? ""}`,
    `Web: ${brief.website_or_profile ?? ""}`,
    `Poznámka: ${brief.note ?? ""}`,
  ].join("\n");
}

function briefToJsonPayload(brief: BriefSchema, projectId: string, projectCode: string): Record<string, unknown> {
  return {
    ...brief,
    project_id: projectId,
    project_code: projectCode,
    submitted_at: new Date().toISOString(),
  };
}

export async function runStartPipeline(
  input: StartPipelineInput,
  files?: StartPipelineFiles
): Promise<
  | { ok: true; projectId: string; projectCode: string; pin?: string; magicToken?: string; accessToken?: string; storagePrefix: string }
  | { ok: false; errorCode: string; errorMessage: string; details?: Record<string, unknown> }
> {
  const brief = normalizeStartForm(input);
  const validation = validateRequiredBrief(brief);
  if (!validation.ok) {
    return {
      ok: false,
      errorCode: "VALIDATION_FAILED",
      errorMessage: `Chybí povinná pole: ${validation.missing.join(", ")}`,
      details: { missing: validation.missing },
    };
  }

  if (files?.logo) {
    if (files.logo.type !== LOGO_MIME) {
      return { ok: false, errorCode: "LOGO_INVALID", errorMessage: "Logo musí být PNG (image/png)." };
    }
    if (files.logo.size > LOGO_MAX_BYTES) {
      return { ok: false, errorCode: "LOGO_INVALID", errorMessage: "Logo může mít maximálně 5 MB." };
    }
  }
  const photos = files?.photos ?? [];
  for (let i = 0; i < photos.length; i++) {
    const f = photos[i]!;
    if (!PHOTO_MIMES.includes(f.type)) {
      return { ok: false, errorCode: "PHOTO_INVALID", errorMessage: `Foto ${i + 1}: povolené typy JPEG, PNG, WebP` };
    }
    if (f.size > PHOTO_MAX_BYTES) {
      return { ok: false, errorCode: "PHOTO_INVALID", errorMessage: `Foto ${i + 1}: maximálně 15 MB` };
    }
  }
  if (photos.length > MAX_PHOTOS) {
    return { ok: false, errorCode: "PHOTO_INVALID", errorMessage: `Maximálně ${MAX_PHOTOS} fotek` };
  }
  if (files?.brandPdf) {
    if (files.brandPdf.type !== PDF_MIME) {
      return { ok: false, errorCode: "PDF_INVALID", errorMessage: "Brand manuál musí být PDF" };
    }
    if (files.brandPdf.size > PDF_MAX_BYTES) {
      return { ok: false, errorCode: "PDF_INVALID", errorMessage: "PDF může mít maximálně 20 MB" };
    }
  }

  const projectCode = generatePipelineProjectCode();
  const storagePrefix = projectStoragePrefix(projectCode);

  const createParams = {
    plan_id: brief.plan_id,
    brand_name: brief.brand_name,
    industry: brief.industry,
    communication_goal: brief.communication_goal,
    platforms: brief.platforms,
    tone_of_voice: brief.tone_of_voice,
    website_or_profile: brief.website_or_profile,
    client_email: brief.client_email,
    note: brief.note,
    target_audience: brief.target_audience,
    offers: brief.offers,
    forbidden_words: brief.forbidden_words,
    preferred_style: brief.preferred_style,
    preferred_cta: brief.preferred_cta,
    logo_url: brief.logo_url,
    brand_colors: brief.brand_colors,
    brand_fonts: brief.brand_fonts,
    image_refs: brief.image_refs,
    source_url: brief.source_url,
    brand_pdf_url: brief.brand_pdf_url,
    project_code: projectCode,
    storage_prefix: storagePrefix,
  };

  let projectId: string;
  let pin: string | undefined;
  let magicToken: string | undefined;
  let accessToken: string | undefined;

  try {
    const result = await createProject(createParams);
    projectId = result.project.id;
    pin = result.pin;
    magicToken = result.magicToken;
    accessToken = await createProjectAccessToken(projectId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, errorCode: "PROJECT_CREATE_FAILED", errorMessage: msg };
  }

  const supabase = getSupabaseClient();
  const fileEntries: { path: string; kind: string; mime?: string; size?: number }[] = [];
  let logoUrl: string | null = null;
  let brandPdfUrl: string | null = null;

  const uploadAndRecord = async (
    path: string,
    body: Buffer | Blob,
    contentType: string,
    meta: { kind: "logo" | "photo" | "manual"; originalName?: string; size: number }
  ): Promise<string | null> => {
    const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType, upsert: false });
    if (error) return null;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    fileEntries.push({ path, kind: meta.kind, mime: contentType, size: meta.size });
    await insertProjectFile({
      project_id: projectId,
      storage_path: path,
      kind: meta.kind,
      original_name: meta.originalName ?? null,
      content_type: contentType,
      size_bytes: meta.size,
    });
    return data?.publicUrl ?? null;
  };

  if (files?.logo) {
    const path = fullPath(storagePrefix, `${PATH.logoDir}/logo.png`);
    const buf = Buffer.from(await files.logo.arrayBuffer());
    logoUrl = await uploadAndRecord(path, buf, LOGO_MIME, {
      kind: "logo",
      originalName: files.logo.name,
      size: files.logo.size,
    });
  }
  for (let i = 0; i < photos.length; i++) {
    const f = photos[i]!;
    const ext = f.name.split(".").pop() || "jpg";
    const path = fullPath(storagePrefix, `${PATH.photosDir}/photo_${String(i + 1).padStart(2, "0")}.${ext}`);
    const buf = Buffer.from(await f.arrayBuffer());
    await uploadAndRecord(path, buf, f.type, { kind: "photo", originalName: f.name, size: f.size });
  }
  if (files?.brandPdf) {
    const safeName = files.brandPdf.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "brand-manual.pdf";
    const path = fullPath(storagePrefix, `${PATH.manualDir}/${safeName}`);
    const buf = Buffer.from(await files.brandPdf.arrayBuffer());
    brandPdfUrl = await uploadAndRecord(path, buf, PDF_MIME, {
      kind: "manual",
      originalName: files.brandPdf.name,
      size: files.brandPdf.size,
    });
  }

  if (logoUrl) {
    brief.logo_url = logoUrl;
    await supabase.from("project_brief").update({ logo_url: logoUrl, updated_at: new Date().toISOString() }).eq("project_id", projectId);
  }
  if (brandPdfUrl) {
    brief.brand_pdf_url = brandPdfUrl;
    await supabase.from("project_brief").update({ brand_pdf_url: brandPdfUrl, updated_at: new Date().toISOString() }).eq("project_id", projectId);
  }

  const briefPayload = briefToJsonPayload(brief, projectId, projectCode);
  const briefPath = fullPath(storagePrefix, PATH.brief);
  await uploadFile(briefPath, JSON.stringify(briefPayload, null, 2), { contentType: "application/json", upsert: true });

  const contextPath = fullPath(storagePrefix, PATH.context);
  await uploadFile(contextPath, briefToContext(brief), { contentType: "text/plain", upsert: true });

  const manifest = buildManifest({
    projectId,
    projectCode,
    storagePrefix,
    files: fileEntries.map((e) => ({ path: e.path, kind: e.kind, mime: e.mime, size: e.size })),
  });
  const manifestResult = await saveManifest(storagePrefix, manifest);
  if (!manifestResult.ok) {
    console.error("[start-pipeline] manifest save failed:", manifestResult.error);
  }

  await ensurePlaceholderDirs(storagePrefix);
  await appendEvent(storagePrefix, { type: "project_created", project_id: projectId, project_code: projectCode });

  return {
    ok: true,
    projectId,
    projectCode,
    pin,
    magicToken,
    accessToken,
    storagePrefix,
  };
}
