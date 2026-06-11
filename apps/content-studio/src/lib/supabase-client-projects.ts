import { randomBytes } from "crypto";
import { getSupabaseClient } from "./supabase-server";
import type { DiagWorkflowStatus } from "./diagnostika-workflow";

const ACCESS_DAYS = 7;
const SHORT_CODE_LENGTH = 8;
const SHORT_CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";

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

/** Vrací datum expirace přístupu (created + ACCESS_DAYS). Exportováno pro admin PATCH. */
export type AccessType = "FREE" | "PAID" | "ACTIVE";

export function getAccessExpiresAt(accessType: AccessType, created: Date): string {
  const d = new Date(created);
  d.setDate(d.getDate() + ACCESS_DAYS);
  return d.toISOString();
}

function getDefaultAccessExpiresAt(): string {
  return getAccessExpiresAt("FREE", new Date());
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
  const access_expires_at = getDefaultAccessExpiresAt();
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
export type UpdateClientProjectParams = {
  name?: string | null;
  email?: string | null;
  web_url?: string | null;
  manual_input?: string | null;
  last_contact_at?: string | null;
  access_type?: AccessType | null;
  access_expires_at?: string | null;
  outputs_activated?: boolean;
  outputs_activated_at?: string | null;
  access_sent_at?: string | null;
  brief_submitted_at?: string | null;
};

export async function updateClientProject(
  projectId: string,
  updates: UpdateClientProjectParams
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
  if (updates.outputs_activated !== undefined) payload.outputs_activated = updates.outputs_activated;
  if (updates.outputs_activated_at !== undefined) payload.outputs_activated_at = updates.outputs_activated_at;
  if (updates.access_sent_at !== undefined) payload.access_sent_at = updates.access_sent_at;
  if (updates.brief_submitted_at !== undefined) payload.brief_submitted_at = updates.brief_submitted_at;
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
  const { error } = await supabase
    .from("client_projects")
    .update({
      payment_status: "paid",
      status: "paid",
      booking_date: b.date,
      booking_time: b.time,
      email: b.email,
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

/** Vrací projekt se shodným e-mailem a web_url (oba musí sedět). Pro upsert při save-scan. */
export async function getClientProjectByEmailAndWeb(
  email: string,
  webUrl: string | null
): Promise<ClientProjectRow | null> {
  const project = await getClientProjectByEmail(email);
  if (!project) return null;
  const a = (project.web_url ?? "").trim().toLowerCase();
  const b = (webUrl ?? "").trim().toLowerCase();
  if (a !== b) return null;
  return project;
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

/** Uloží novou verzi diagnostiky k projektu (stub – tabulka diagnostic_versions může být doplněna později). */
export async function insertDiagnosticVersion(
  _projectId: string,
  _scanResult: Record<string, unknown>
): Promise<void> {
  // Stub: bez tabulky diagnostic_versions nic neukládáme
}

export type DiagnosticVersionRow = {
  id: string;
  project_id: string;
  scan_result: Record<string, unknown>;
  created_at: string;
  status: "pending" | "accepted" | "ignored";
};

/** Vrací pending verzi diagnostiky pro projekt (stub). */
export async function getPendingDiagnosticVersion(_projectId: string): Promise<DiagnosticVersionRow | null> {
  return null;
}

/** Vrací seznam verzí diagnostiky projektu (stub). */
export async function listDiagnosticVersions(_projectId: string): Promise<DiagnosticVersionRow[]> {
  return [];
}

/** Vrací verzi diagnostiky podle id (stub). */
export async function getDiagnosticVersionById(_versionId: string): Promise<DiagnosticVersionRow | null> {
  return null;
}

/** Přijme verzi a přepíše scan_result projektu (stub). */
export async function acceptDiagnosticVersion(_versionId: string): Promise<boolean> {
  return true;
}

/** Označí verzi jako ignorovanou (stub). */
export async function ignoreDiagnosticVersion(_versionId: string): Promise<boolean> {
  return true;
}
