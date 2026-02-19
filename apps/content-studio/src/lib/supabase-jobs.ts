import { getSupabaseClient } from "./supabase-server";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type ProcessingJobRow = {
  id: string;
  job_type: string;
  status: JobStatus;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  processing_mode: string;
  processing_reason: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

const TABLE = "processing_jobs";

export async function createJob(params: {
  jobType: string;
  status?: JobStatus;
  payload: Record<string, unknown>;
  processingMode: string;
  processingReason: string;
}): Promise<ProcessingJobRow> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const row = {
    job_type: params.jobType,
    status: params.status ?? "queued",
    payload: params.payload,
    result: null,
    processing_mode: params.processingMode,
    processing_reason: params.processingReason,
    started_at: params.status === "processing" ? now : null,
    finished_at: null,
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Chyba při vytváření jobu: ${error.message}`);
  }
  return data as ProcessingJobRow;
}

export async function getJobById(id: string): Promise<ProcessingJobRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") return null;
    throw new Error(`Chyba při načítání jobu: ${error?.message ?? "Not found"}`);
  }
  return data as ProcessingJobRow;
}

export async function updateJob(
  id: string,
  updates: Partial<{
    status: JobStatus;
    result: Record<string, unknown> | null;
    started_at: string | null;
    finished_at: string | null;
  }>
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Chyba při aktualizaci jobu: ${error.message}`);
  }
}
