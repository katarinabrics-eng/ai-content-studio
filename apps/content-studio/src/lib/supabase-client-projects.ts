import { randomBytes } from "crypto";
import { getSupabaseClient } from "./supabase-server";
import type { DiagWorkflowStatus } from "./diagnostika-workflow";

const ACCESS_DAYS_FREE = 3;
const ACCESS_DAYS_PAID = 14;
const SHORT_CODE_LENGTH = 8;
const SHORT_CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";

export type AccessType = "FREE" | "PAID" | "ACTIVE";

function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

function generateShortCode(): string {
  let s = "";
  const bytes = randomBytes(SHORT_CODE_LENGTH);
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    s += SHORT_CODE_CHARS[bytes[i]! % SHORT_CODE_CHARS.length];
  }
  return s;
}

/** FREE = +3 dny od baseDate, PAID = +14 dní, ACTIVE = null. */
export function getAccessExpiresAt(accessType: AccessType, baseDate: Date = new Date()): string | null {
  if (accessType === "ACTIVE") return null;
  const d = new Date(baseDate);
  d.setDate(d.getDate() + (accessType === "PAID" ? ACCESS_DAYS_PAID : ACCESS_DAYS_FREE));
  return d.toISOString();
}

export type PaymentStatus = "none" | "pending" | "paid";
export type ClientProjectStatus = "new" | "paid" | "in_progress" | "done";

export type ClientProjectRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  email: string | null;
  web_url: string | null;
  manual_input: string | null;
  scan_result: Record<string, unknown>;
  payment_status: PaymentStatus;
  booking_id: string | null;
  booking_date: string | null;
  booking_time: string | null;
  status: ClientProjectStatus;
  workflow_status: DiagWorkflowStatus;
  access_token: string | null;
  access_expires_at: string | null;
  access_type: AccessType | null;
  last_contact_at: string | null;
  short_code: string | null;
};

export async function createClientProject(params: {
  web_url?: string | null;
  manual_input?: string | null;
  scan_result: Record<string, unknown>;
  name?: string | null;
  email?: string | null;
  workflow_status?: DiagWorkflowStatus;
}): Promise<{ id: string }> {
  const supabase = getSupabaseClient();
  const access_token = generateAccessToken();
  const access_type: AccessType = "FREE";
  const access_expires_at = getAccessExpiresAt(access_type);
  const short_code = generateShortCode();
  const workflow_status = params.workflow_status ?? "DIAG_AWAITING_CURATOR";
  const { data, error } = await supabase
    .from("client_projects")
    .insert({
      web_url: params.web_url ?? null,
      manual_input: params.manual_input ?? null,
      scan_result: params.scan_result ?? {},
      name: params.name ?? null,
      email: params.email ?? null,
      workflow_status,
      updated_at: new Date().toISOString(),
      access_token,
      access_expires_at,
      access_type,
      short_code,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: (data as { id: string }).id };
}

export async function updateClientProjectWorkflowStatus(
  projectId: string,
  workflowStatus: DiagWorkflowStatus
): Promise<ClientProjectRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_projects")
    .update({ workflow_status: workflowStatus, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .select()
    .single();
  if (error) return null;
  return data as ClientProjectRow;
}

export async function updateClientProjectStatus(
  projectId: string,
  status: ClientProjectStatus
): Promise<ClientProjectRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .select()
    .single();
  if (error) return null;
  return data as ClientProjectRow;
}

export async function deleteClientProject(projectId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("client_projects").delete().eq("id", projectId);
  if (error) throw error;
}

export async function updateClientProjectEmail(projectId: string, email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("client_projects")
    .update({ email, updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error) throw error;
}

/** Aktualizuje scan_result (a volitelně web_url, manual_input) u existujícího záznamu. Používá se při druhém uložení v diagnostice (po refine). */
export async function updateClientProjectScanResult(
  projectId: string,
  updates: { scan_result: Record<string, unknown>; web_url?: string | null; manual_input?: string | null }
): Promise<ClientProjectRow | null> {
  const supabase = getSupabaseClient();
  const payload: Record<string, unknown> = {
    scan_result: updates.scan_result,
    updated_at: new Date().toISOString(),
  };
  if (updates.web_url !== undefined) payload.web_url = updates.web_url;
  if (updates.manual_input !== undefined) payload.manual_input = updates.manual_input;
  const { data, error } = await supabase
    .from("client_projects")
    .update(payload)
    .eq("id", projectId)
    .select()
    .single();
  if (error) return null;
  return data as ClientProjectRow;
}

/** Aktualizuje editovatelná pole záznamu diagnostiky (admin i klient). */
export async function updateClientProject(
  projectId: string,
  updates: { name?: string | null; email?: string | null; web_url?: string | null; manual_input?: string | null; last_contact_at?: string | null; access_type?: AccessType | null; access_expires_at?: string | null }
): Promise<ClientProjectRow | null> {
  const supabase = getSupabaseClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.web_url !== undefined) payload.web_url = updates.web_url;
  if (updates.manual_input !== undefined) payload.manual_input = updates.manual_input;
  if (updates.last_contact_at !== undefined) payload.last_contact_at = updates.last_contact_at;
  if (updates.access_type !== undefined) payload.access_type = updates.access_type;
  if (updates.access_expires_at !== undefined) payload.access_expires_at = updates.access_expires_at;
  const { data, error } = await supabase
    .from("client_projects")
    .update(payload)
    .eq("id", projectId)
    .select()
    .single();
  if (error) return null;
  return data as ClientProjectRow;
}

export async function setClientProjectPaidFromBooking(bookingId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: booking, error: bookErr } = await supabase
    .from("bookings")
    .select("date, time, email")
    .eq("id", bookingId)
    .single();

  if (bookErr || !booking) return;

  const b = booking as { date: string; time: string; email: string };
  const { data: project } = await supabase
    .from("client_projects")
    .select("created_at")
    .eq("booking_id", bookingId)
    .single();

  const created = project?.created_at ? new Date((project as { created_at: string }).created_at) : new Date();
  const access_expires_at = getAccessExpiresAt("PAID", created);

  const { error } = await supabase
    .from("client_projects")
    .update({
      payment_status: "paid",
      status: "paid",
      booking_date: b.date,
      booking_time: b.time,
      email: b.email,
      access_type: "PAID",
      access_expires_at,
      updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId);

  if (error) throw error;
}

export async function linkBookingToClientProject(projectId: string, bookingId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("email, date, time")
    .eq("id", bookingId)
    .single();

  if (!booking) return;

  const b = booking as { email: string; date: string; time: string };
  const { error } = await supabase
    .from("client_projects")
    .update({
      booking_id: bookingId,
      email: b.email,
      payment_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw error;
}

export async function listClientProjects(): Promise<ClientProjectRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClientProjectRow[];
}

export async function getClientProjectById(id: string): Promise<ClientProjectRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("client_projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ClientProjectRow | null;
}

/** Normalizuje web URL pro porovnání (lowercase, bez www, bez koncového lomítka). */
export function normalizeWebUrl(url: string | null | undefined): string | null {
  if (url == null || typeof url !== "string" || !url.trim()) return null;
  try {
    const u = new URL(url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.protocol}//${host}${path}`;
  } catch {
    return null;
  }
}

/** Vrací nejnovější projekt s daným e-mailem (pro upsert při diagnostice). E-mail se porovnává case-insensitive. */
export async function getClientProjectByEmail(email: string): Promise<ClientProjectRow | null> {
  if (!email || typeof email !== "string" || !email.trim()) return null;
  const supabase = getSupabaseClient();
  const escaped = email.trim().replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
  const { data, error } = await supabase
    .from("client_projects")
    .select("*")
    .ilike("email", escaped)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as ClientProjectRow | null;
}

/** Vrací projekt se shodným e-mailem a webem (pro detekci duplicitní diagnostiky). Nepřepisujeme, ukládáme jako verzi. */
export async function getClientProjectByEmailAndWeb(email: string, webUrl: string | null): Promise<ClientProjectRow | null> {
  if (!email || typeof email !== "string" || !email.trim()) return null;
  const supabase = getSupabaseClient();
  const escaped = email.trim().replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
  const { data: rows, error } = await supabase
    .from("client_projects")
    .select("*")
    .ilike("email", escaped)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  const list = (rows ?? []) as ClientProjectRow[];
  const want = normalizeWebUrl(webUrl);
  for (const row of list) {
    if (normalizeWebUrl(row.web_url) === want) return row;
  }
  return null;
}

export type DiagnosticVersionStatus = "pending" | "accepted" | "ignored";

export type DiagnosticVersionRow = {
  id: string;
  project_id: string;
  scan_result: Record<string, unknown>;
  created_at: string;
  status: DiagnosticVersionStatus;
};

/** Uloží novou verzi diagnostiky (bez přepisu projektu). */
export async function insertDiagnosticVersion(projectId: string, scanResult: Record<string, unknown>): Promise<{ id: string }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("diagnostic_versions")
    .insert({ project_id: projectId, scan_result: scanResult ?? {}, status: "pending" })
    .select("id")
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id };
}

/** Vrátí pending verzi pro projekt (nejnovější). */
export async function getPendingDiagnosticVersion(projectId: string): Promise<DiagnosticVersionRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("diagnostic_versions")
    .select("id, project_id, scan_result, created_at, status")
    .eq("project_id", projectId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as DiagnosticVersionRow | null;
}

/** Všechny verze projektu (pro historii a porovnání). */
export async function listDiagnosticVersions(projectId: string): Promise<DiagnosticVersionRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("diagnostic_versions")
    .select("id, project_id, scan_result, created_at, status")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DiagnosticVersionRow[];
}

/** Vrátí verzi podle id (pro ověření project_id). */
export async function getDiagnosticVersionById(versionId: string): Promise<DiagnosticVersionRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("diagnostic_versions")
    .select("id, project_id, scan_result, created_at, status")
    .eq("id", versionId)
    .single();
  if (error || !data) return null;
  return data as DiagnosticVersionRow;
}

/** Přijme verzi: zkopíruje scan_result do projektu a označí verzi jako accepted. */
export async function acceptDiagnosticVersion(versionId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data: version, error: fetchErr } = await supabase
    .from("diagnostic_versions")
    .select("project_id, scan_result, status")
    .eq("id", versionId)
    .single();
  if (fetchErr || !version || (version as { status: string }).status !== "pending") return false;
  const v = version as { project_id: string; scan_result: Record<string, unknown> };
  const { error: updateProject } = await supabase
    .from("client_projects")
    .update({ scan_result: v.scan_result, updated_at: new Date().toISOString() })
    .eq("id", v.project_id);
  if (updateProject) return false;
  const { error: updateVersion } = await supabase
    .from("diagnostic_versions")
    .update({ status: "accepted" })
    .eq("id", versionId);
  return !updateVersion;
}

/** Označí verzi jako ignorovanou. */
export async function ignoreDiagnosticVersion(versionId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("diagnostic_versions").update({ status: "ignored" }).eq("id", versionId);
  return !error;
}

/** Vrací projekt při platném tokenu. Pokud token chybí nebo je po access_expires_at, vrací null. */
export async function getClientProjectByAccessToken(token: string): Promise<ClientProjectRow | null> {
  if (!token?.trim()) return null;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_projects")
    .select("*")
    .eq("access_token", token.trim())
    .maybeSingle();
  if (error) return null;
  const row = data as ClientProjectRow | null;
  if (!row) return null;
  const expiresAt = row.access_expires_at ? new Date(row.access_expires_at).getTime() : 0;
  if (expiresAt > 0 && Date.now() > expiresAt) return null;
  return row;
}

/** Vyhledá projekt podle krátkého kódu (pro /d/[shortCode]). Kontroluje platnost přístupu. */
export async function getClientProjectByShortCode(shortCode: string): Promise<ClientProjectRow | null> {
  if (!shortCode?.trim()) return null;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_projects")
    .select("*")
    .eq("short_code", shortCode.trim())
    .maybeSingle();
  if (error || !data) return null;
  const row = data as ClientProjectRow;
  const expiresAt = row.access_expires_at ? new Date(row.access_expires_at).getTime() : 0;
  if (expiresAt > 0 && Date.now() > expiresAt) return null;
  return row;
}
