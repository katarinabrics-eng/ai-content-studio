import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { getSupabaseClient } from "./supabase-server";
import type { ProjectStatus } from "./project-status-engine";

const CODE_LENGTH = 8;
const PIN_LENGTH = 6;
const TOKEN_BYTES = 32;

/** Pole briefu (project_brief tabulka) — required + optional. */
export type ProjectBriefRow = {
  project_id: string;
  plan_id: string;
  brand_name: string;
  industry: string;
  communication_goal: string;
  platforms: string[];
  tone_of_voice: string;
  website_or_profile: string;
  client_email: string | null;
  note: string;
  target_audience: string | null;
  offers: string | null;
  forbidden_words: string | null;
  preferred_style: string | null;
  preferred_cta: string | null;
  logo_url: string | null;
  brand_colors: string | null;
  brand_fonts: string | null;
  image_refs: string | null;
  source_url: string | null;
  brand_pdf_url: string | null;
  created_at: string;
  updated_at: string;
};

/** Admin-only metadata (project_admin_meta). Klient nikdy nečte. */
export type ProjectAdminMetaRow = {
  project_id: string;
  assigned_curator_id: string | null;
  brief_completeness: number;
  missing_fields: string[];
  ai_confidence: number | null;
  qa_score: number | null;
  internal_notes: string | null;
  risk_flags: string[];
  sla_due_at: string | null;
  revision_count: number;
  last_ai_run_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Hlavní řádek projektu (projects). */
export type ProjectRow = {
  id: string;
  plan_id: string;
  project_code: string | null;
  project_pin_hash: string | null;
  access_pin_hash: string | null;
  project_pin_expires_at: string | null;
  access_pin_expires_at: string | null;
  magic_token_hash: string | null;
  status: string;
  client_email: string | null;
  assigned_curator_id: string | null;
  storage_prefix: string | null;
  created_at: string;
  updated_at: string;
};

/** Záznam v project_files (nahraný soubor). */
export type ProjectFileRow = {
  id: string;
  project_id: string;
  storage_path: string;
  kind: "logo" | "photo" | "manual";
  original_name: string | null;
  content_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

/** Projekt včetně briefu a admin meta (pro admin dashboard). */
export type ProjectWithBriefAndMeta = ProjectRow & {
  brief: ProjectBriefRow | null;
  admin_meta: ProjectAdminMetaRow | null;
};

/** Klíčová pole pro výpočet completeness. */
const BRIEF_KEY_FIELDS = [
  "brand_name",
  "industry",
  "communication_goal",
  "platforms",
  "tone_of_voice",
] as const;

const BRIEF_KEY_LABELS: Record<string, string> = {
  brand_name: "Značka / název",
  industry: "Obor",
  communication_goal: "Cíl komunikace",
  platforms: "Síť(e)",
  tone_of_voice: "Tonalita",
};

export function getBriefCompleteness(brief: ProjectBriefRow | null): {
  percent: number;
  missing: string[];
} {
  if (!brief) return { percent: 0, missing: BRIEF_KEY_FIELDS.map((k) => BRIEF_KEY_LABELS[k] ?? k) };
  const missing: string[] = [];
  for (const key of BRIEF_KEY_FIELDS) {
    const v = brief[key as keyof ProjectBriefRow];
    if (v === undefined || v === null) missing.push(BRIEF_KEY_LABELS[key] ?? key);
    else if (Array.isArray(v) && v.length === 0) missing.push(BRIEF_KEY_LABELS[key] ?? key);
    else if (typeof v === "string" && v.trim() === "") missing.push(BRIEF_KEY_LABELS[key] ?? key);
  }
  const filled = BRIEF_KEY_FIELDS.length - missing.length;
  const percent = BRIEF_KEY_FIELDS.length ? Math.round((filled / BRIEF_KEY_FIELDS.length) * 100) : 0;
  return { percent, missing };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const bytes = randomBytes(CODE_LENGTH);
  for (let i = 0; i < CODE_LENGTH; i++) s += chars[bytes[i]! % chars.length];
  return s;
}

/** Formát LCF-YYYYMMDD-XXXX pro intake pipeline. */
export function generatePipelineProjectCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = generateCode().slice(0, 4);
  return `LCF-${y}${m}${d}-${suffix}`;
}

function generatePin(): string {
  let s = "";
  const bytes = randomBytes(PIN_LENGTH);
  for (let i = 0; i < PIN_LENGTH; i++) s += String(bytes[i]! % 10);
  return s;
}

export function generateMagicToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

const ACCESS_TOKEN_BYTES = 32;
const ACCESS_TOKEN_DAYS = 7;

/** Generuje one-time access token (uuid-like). */
export function generateAccessToken(): string {
  return randomBytes(ACCESS_TOKEN_BYTES).toString("hex");
}

/**
 * Vytvoří one-time access token pro projekt, uloží hash do project_access_tokens.
 * Vrací raw token (pouze jednou - zobrazit klientovi).
 */
export async function createProjectAccessToken(projectId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const rawToken = generateAccessToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ACCESS_TOKEN_DAYS);
  const { error } = await supabase.from("project_access_tokens").insert({
    project_id: projectId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error(`Chyba při vytváření access tokenu: ${error.message}`);
  return rawToken;
}

/**
 * Ověří access token, vrátí projectId pokud platný. Token se označí jako použitý (used_at).
 */
export async function verifyAndConsumeAccessToken(rawToken: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const tokenHash = hashToken(rawToken.trim());
  const { data: row, error } = await supabase
    .from("project_access_tokens")
    .select("id, project_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error || !row) return null;
  const r = row as { id: string; project_id: string; expires_at: string; used_at: string | null };
  if (r.used_at) return null;
  if (new Date(r.expires_at) < new Date()) return null;
  await supabase.from("project_access_tokens").update({ used_at: new Date().toISOString() }).eq("id", r.id);
  return r.project_id;
}

/** Parametry pro vytvoření projektu (mapování z formuláře). */
export type CreateProjectParams = {
  plan_id: string;
  brand_name: string;
  industry: string;
  communication_goal: string;
  platforms: string[];
  tone_of_voice: string;
  website_or_profile: string;
  client_email?: string | null;
  note?: string;
  target_audience?: string | null;
  offers?: string | null;
  forbidden_words?: string | null;
  preferred_style?: string | null;
  preferred_cta?: string | null;
  logo_url?: string | null;
  brand_colors?: string | null;
  brand_fonts?: string | null;
  image_refs?: string | null;
  source_url?: string | null;
  brand_pdf_url?: string | null;
  /** Pro intake pipeline: přednastavený project_code a storage_prefix. */
  project_code?: string | null;
  storage_prefix?: string | null;
};

export async function createProject(params: CreateProjectParams): Promise<{
  project: ProjectRow;
  magicToken?: string;
  projectCode?: string;
  pin?: string;
}> {
  const supabase = getSupabaseClient();
  const email = params.client_email?.trim() || null;

  let magicToken: string | undefined;
  let magicTokenHash: string | null = null;
  let projectCode: string | undefined;
  let pin: string | undefined;
  let pinHash: string | null = null;

  if (params.project_code != null && params.project_code !== "") {
    projectCode = params.project_code;
    pin = generatePin();
    pinHash = hashToken(pin);
  } else if (email) {
    magicToken = generateMagicToken();
    magicTokenHash = hashToken(magicToken);
  } else {
    projectCode = generateCode();
    pin = generatePin();
    pinHash = hashToken(pin);
  }

  const pinExpiresAt = pinHash ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
  const insertRow: Record<string, unknown> = {
    plan_id: params.plan_id || "basic",
    project_code: projectCode ?? null,
    project_pin_hash: pinHash,
    access_pin_hash: pinHash,
    project_pin_expires_at: pinExpiresAt,
    access_pin_expires_at: pinExpiresAt,
    magic_token_hash: magicTokenHash,
    status: "AWAITING_INPUT",
    client_email: email,
    storage_prefix: params.storage_prefix ?? null,
  };

  const { data: project, error: errProject } = await supabase
    .from("projects")
    .insert(insertRow)
    .select()
    .single();

  if (errProject) throw new Error(`Chyba při vytváření projektu: ${errProject.message}`);
  const projectId = (project as ProjectRow).id;

  const briefRow: Omit<ProjectBriefRow, "project_id" | "created_at" | "updated_at"> = {
    plan_id: params.plan_id || "basic",
    brand_name: (params.brand_name || "").trim(),
    industry: (params.industry || "").trim(),
    communication_goal: (params.communication_goal || "").trim(),
    platforms: Array.isArray(params.platforms) ? params.platforms : [],
    tone_of_voice: (params.tone_of_voice || "").trim(),
    website_or_profile: (params.website_or_profile || "").trim(),
    client_email: email,
    note: (params.note || "").trim(),
    target_audience: params.target_audience?.trim() || null,
    offers: params.offers?.trim() || null,
    forbidden_words: params.forbidden_words?.trim() || null,
    preferred_style: params.preferred_style?.trim() || null,
    preferred_cta: params.preferred_cta?.trim() || null,
    logo_url: params.logo_url?.trim() || null,
    brand_colors: params.brand_colors?.trim() || null,
    brand_fonts: params.brand_fonts?.trim() || null,
    image_refs: params.image_refs?.trim() || null,
    source_url: params.source_url?.trim() || null,
    brand_pdf_url: params.brand_pdf_url?.trim() || null,
  };

  const { error: errBrief } = await supabase.from("project_brief").insert({
    project_id: projectId,
    ...briefRow,
  });
  if (errBrief) throw new Error(`Chyba při ukládání briefu: ${errBrief.message}`);

  const { percent, missing } = getBriefCompleteness({ ...briefRow, project_id: projectId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  await supabase.from("project_admin_meta").insert({
    project_id: projectId,
    brief_completeness: percent,
    missing_fields: missing,
  });

  return {
    project: project as ProjectRow,
    magicToken,
    projectCode,
    pin,
  };
}

export async function getProjectById(id: string): Promise<ProjectWithBriefAndMeta | null> {
  const supabase = getSupabaseClient();
  const { data: proj, error: eProj } = await supabase.from("projects").select("*").eq("id", id).single();
  if (eProj?.code === "PGRST116" || !proj) return null;
  const { data: brief } = await supabase.from("project_brief").select("*").eq("project_id", id).single();
  const { data: adminMeta } = await supabase.from("project_admin_meta").select("*").eq("project_id", id).single();
  return {
    ...(proj as ProjectRow),
    brief: (brief as ProjectBriefRow) ?? null,
    admin_meta: (adminMeta as ProjectAdminMetaRow) ?? null,
  };
}

/** Pro klienta: projekt + brief (bez admin_meta). */
export async function getProjectByIdForClient(id: string): Promise<(ProjectRow & { brief: ProjectBriefRow | null }) | null> {
  const supabase = getSupabaseClient();
  const { data: proj, error: eProj } = await supabase.from("projects").select("*").eq("id", id).single();
  if (eProj?.code === "PGRST116" || !proj) return null;
  const { data: brief } = await supabase.from("project_brief").select("*").eq("project_id", id).single();
  return {
    ...(proj as ProjectRow),
    brief: (brief as ProjectBriefRow) ?? null,
  };
}

export type VerifyCodePinResult =
  | { ok: true; project: ProjectRow & { brief: ProjectBriefRow | null } }
  | { ok: false; error: "code_not_found" | "pin_mismatch" | "pin_expired" | "pin_hash_missing" };

/** Normalizuje project code pro lookup: trim, uppercase, pomlčky (– — ‑) -> "-". */
function normalizeCodeForLookup(raw: string): string {
  let s = raw.trim().toUpperCase();
  s = s.replace(/[–—‑]/g, "-");
  s = s.replace(/[^A-Z0-9-]/g, "");
  return s;
}

async function verifyPinAgainstHash(pinNorm: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("$2")) {
    return bcrypt.compare(pinNorm, storedHash);
  }
  const shaHash = hashToken(pinNorm);
  if (storedHash === shaHash) return true;
  if (storedHash === pinNorm) return true; // legacy plain
  return false;
}

export async function verifyProjectByCodeAndPin(
  code: string,
  pin: string
): Promise<VerifyCodePinResult> {
  const supabase = getSupabaseClient();
  const codeNorm = normalizeCodeForLookup(code);
  const pinNorm = pin.trim().replace(/\D/g, "");

  const { data: proj, error } = await supabase
    .from("projects")
    .select("*")
    .eq("project_code", codeNorm)
    .maybeSingle();

  if (error || !proj) {
    return { ok: false, error: "code_not_found" };
  }

  const row = proj as ProjectRow & { access_pin_hash?: string | null; project_pin_expires_at?: string | null; access_pin_expires_at?: string | null };
  const storedHash = row.project_pin_hash ?? row.access_pin_hash ?? null;

  if (!storedHash || storedHash === "") {
    return { ok: false, error: "pin_hash_missing" };
  }

  const pinMatch = await verifyPinAgainstHash(pinNorm, storedHash);
  if (!pinMatch) {
    return { ok: false, error: "pin_mismatch" };
  }

  const expiry = row.project_pin_expires_at ?? row.access_pin_expires_at ?? null;
  if (expiry && new Date(expiry) < new Date()) {
    return { ok: false, error: "pin_expired" };
  }

  const { data: brief } = await supabase.from("project_brief").select("*").eq("project_id", proj.id).single();
  return {
    ok: true,
    project: {
      ...(proj as ProjectRow),
      brief: (brief as ProjectBriefRow) ?? null,
    },
  };
}

/** @deprecated Použij verifyProjectByCodeAndPin. */
export async function getProjectByCodeAndPin(code: string, pin: string): Promise<(ProjectRow & { brief: ProjectBriefRow | null }) | null> {
  const r = await verifyProjectByCodeAndPin(code, pin);
  return r.ok ? r.project : null;
}

export async function getProjectByMagicToken(token: string): Promise<(ProjectRow & { brief: ProjectBriefRow | null }) | null> {
  const supabase = getSupabaseClient();
  const tokenHash = hashToken(token.trim());
  const { data: proj, error } = await supabase
    .from("projects")
    .select("*")
    .eq("magic_token_hash", tokenHash)
    .single();
  if (error || !proj) return null;
  const { data: brief } = await supabase.from("project_brief").select("*").eq("project_id", proj.id).single();
  return {
    ...(proj as ProjectRow),
    brief: (brief as ProjectBriefRow) ?? null,
  };
}

export async function listProjects(): Promise<ProjectWithBriefAndMeta[]> {
  const supabase = getSupabaseClient();
  const { data: rows, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  const list: ProjectWithBriefAndMeta[] = [];
  for (const r of rows ?? []) {
    const id = (r as ProjectRow).id;
    const { data: brief } = await supabase.from("project_brief").select("*").eq("project_id", id).single();
    const { data: adminMeta } = await supabase.from("project_admin_meta").select("*").eq("project_id", id).single();
    list.push({
      ...(r as ProjectRow),
      brief: (brief as ProjectBriefRow) ?? null,
      admin_meta: (adminMeta as ProjectAdminMetaRow) ?? null,
    });
  }
  return list;
}

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<ProjectRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data as ProjectRow;
}

const SESSION_BYTES = 32;
const SESSION_DAYS = 30;

function generateSessionToken(): string {
  return randomBytes(SESSION_BYTES).toString("hex");
}

export async function createProjectSession(projectId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  const { error } = await supabase.from("project_sessions").insert({
    project_id: projectId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error("Chyba při vytváření session.");
  return token;
}

export async function getProjectBySessionToken(token: string): Promise<(ProjectRow & { brief: ProjectBriefRow | null }) | null> {
  const supabase = getSupabaseClient();
  const tokenHash = hashToken(token.trim());
  const { data: session, error: sessionError } = await supabase
    .from("project_sessions")
    .select("project_id, expires_at")
    .eq("token_hash", tokenHash)
    .single();
  if (sessionError || !session) return null;
  const row = session as { project_id: string; expires_at: string };
  if (new Date(row.expires_at) < new Date()) return null;
  return getProjectByIdForClient(row.project_id);
}

export async function getProjectFiles(projectId: string): Promise<ProjectFileRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("project_files")
    .select("id, project_id, storage_path, kind, original_name, content_type, size_bytes, created_at")
    .eq("project_id", projectId)
    .order("kind")
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as ProjectFileRow[];
}

export async function insertProjectFile(row: {
  project_id: string;
  storage_path: string;
  kind: "logo" | "photo" | "manual";
  original_name?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("project_files").insert(row);
  if (error) throw new Error(`Chyba při ukládání záznamu souboru: ${error.message}`);
}
