import { createHash, randomBytes } from "crypto";
import { getSupabaseClient } from "./supabase-server";
import type { ProjectStatus } from "./project-status-engine";

const CODE_LENGTH = 8;
const PIN_LENGTH = 6;
const TOKEN_BYTES = 32;

export type ProjectRow = {
  id: string;
  plan_id: string;
  brand: string;
  obor: string;
  cil: string;
  sit: string;
  tonalita: string;
  poznamka: string;
  email: string | null;
  project_code: string | null;
  pin_hash: string | null;
  magic_token_hash: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

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

function generatePin(): string {
  let s = "";
  const bytes = randomBytes(PIN_LENGTH);
  for (let i = 0; i < PIN_LENGTH; i++) s += String(bytes[i]! % 10);
  return s;
}

export function generateMagicToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export async function createProject(params: {
  plan_id: string;
  brand: string;
  obor: string;
  cil: string;
  sit: string;
  tonalita: string;
  poznamka: string;
  email?: string | null;
}): Promise<{
  project: ProjectRow;
  magicToken?: string;
  projectCode?: string;
  pin?: string;
}> {
  const supabase = getSupabaseClient();
  const email = params.email?.trim() || null;

  let magicToken: string | undefined;
  let magicTokenHash: string | null = null;
  let projectCode: string | undefined;
  let pin: string | undefined;
  let pinHash: string | null = null;

  if (email) {
    magicToken = generateMagicToken();
    magicTokenHash = hashToken(magicToken);
  } else {
    projectCode = generateCode();
    pin = generatePin();
    pinHash = hashToken(pin);
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      plan_id: params.plan_id || "basic",
      brand: (params.brand || "").trim(),
      obor: (params.obor || "").trim(),
      cil: (params.cil || "").trim(),
      sit: (params.sit || "").trim(),
      tonalita: (params.tonalita || "").trim(),
      poznamka: (params.poznamka || "").trim(),
      email,
      project_code: projectCode ?? null,
      pin_hash: pinHash,
      magic_token_hash: magicTokenHash,
      status: "PROCESSING_DATA",
    })
    .select()
    .single();

  if (error) throw new Error(`Chyba při vytváření projektu: ${error.message}`);
  return {
    project: data as ProjectRow,
    magicToken,
    projectCode,
    pin,
  };
}

export async function getProjectById(id: string): Promise<ProjectRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error?.code === "PGRST116" || !data) return null;
  return data as ProjectRow;
}

export async function getProjectByCodeAndPin(code: string, pin: string): Promise<ProjectRow | null> {
  const supabase = getSupabaseClient();
  const pinHash = hashToken(pin.trim());
  const codeTrim = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("project_code", codeTrim)
    .eq("pin_hash", pinHash)
    .single();
  if (error || !data) return null;
  return data as ProjectRow;
}

export async function getProjectByMagicToken(token: string): Promise<ProjectRow | null> {
  const supabase = getSupabaseClient();
  const tokenHash = hashToken(token.trim());
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("magic_token_hash", tokenHash)
    .single();
  if (error || !data) return null;
  return data as ProjectRow;
}

export async function listProjects(): Promise<ProjectRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as ProjectRow[];
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

export async function getProjectBySessionToken(token: string): Promise<ProjectRow | null> {
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
  return getProjectById(row.project_id);
}
