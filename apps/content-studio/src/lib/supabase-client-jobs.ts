import { getSupabaseClient } from "./supabase-server";
import type { ClientJobStatus } from "./client-status-engine";

export type ClientJobRow = {
  id: string;
  client_id: string;
  week_key: string;
  status: ClientJobStatus;
  due_at: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
};

export async function getClientJobsByClientId(clientId: string): Promise<ClientJobRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_jobs")
    .select("id, client_id, week_key, status, due_at, priority, created_at, updated_at")
    .eq("client_id", clientId)
    .order("week_key", { ascending: false });

  if (error) {
    throw new Error(`Chyba při načítání jobů: ${error.message}`);
  }
  return (data ?? []) as ClientJobRow[];
}

export async function getClientJobById(jobId: string): Promise<ClientJobRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_jobs")
    .select("id, client_id, week_key, status, due_at, priority, created_at, updated_at")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") return null;
    throw new Error(`Chyba při načítání jobu: ${error?.message ?? "Not found"}`);
  }
  return data as ClientJobRow;
}

export async function getClientJobsByStatus(status: ClientJobStatus): Promise<ClientJobRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_jobs")
    .select("id, client_id, week_key, status, due_at, priority, created_at, updated_at")
    .eq("status", status)
    .order("due_at", { ascending: true });

  if (error) {
    throw new Error(`Chyba při načítání jobů: ${error.message}`);
  }
  return (data ?? []) as ClientJobRow[];
}

export async function getAllClientJobs(): Promise<ClientJobRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_jobs")
    .select("id, client_id, week_key, status, due_at, priority, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Chyba při načítání jobů: ${error.message}`);
  }
  return (data ?? []) as ClientJobRow[];
}

export async function updateClientJobStatus(
  jobId: string,
  status: ClientJobStatus
): Promise<void> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("client_jobs")
    .update({ status, updated_at: now })
    .eq("id", jobId);

  if (error) {
    throw new Error(`Chyba při aktualizaci statusu: ${error.message}`);
  }
}

export async function upsertClientJob(params: {
  clientId: string;
  weekKey: string;
  status?: ClientJobStatus;
  dueAt?: string | null;
  priority?: number;
}): Promise<ClientJobRow> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const row = {
    client_id: params.clientId,
    week_key: params.weekKey,
    status: params.status ?? "paid",
    due_at: params.dueAt ?? null,
    priority: params.priority ?? 0,
    updated_at: now,
  };
  const { data, error } = await supabase
    .from("client_jobs")
    .upsert(row, { onConflict: "client_id,week_key", ignoreDuplicates: false })
    .select("id, client_id, week_key, status, due_at, priority, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(`Chyba při ukládání jobu: ${error.message}`);
  }
  return data as ClientJobRow;
}
