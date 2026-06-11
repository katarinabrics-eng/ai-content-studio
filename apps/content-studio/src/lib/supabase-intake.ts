import { getSupabaseClient } from "./supabase-server";

export type IntakeRecord = { id: string; createdAt: string; [k: string]: unknown };

export async function getIntakes(limit = 50): Promise<IntakeRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("intake_submissions")
    .select("id, created_at, payload")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Chyba DB při načítání intake: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at ?? new Date().toISOString(),
    ...(typeof row.payload === "object" && row.payload !== null ? row.payload : {}),
  })) as IntakeRecord[];
}

export async function getIntakeByIdOrLast(intakeId?: string): Promise<IntakeRecord | null> {
  const supabase = getSupabaseClient();

  if (intakeId) {
    const { data, error } = await supabase
      .from("intake_submissions")
      .select("id, created_at, payload")
      .eq("id", intakeId)
      .single();

    if (error || !data) {
      if (error?.code === "PGRST116") return null;
      throw new Error(`Chyba DB při načítání intake: ${error?.message ?? "Not found"}`);
    }

    return {
      id: data.id,
      createdAt: data.created_at ?? new Date().toISOString(),
      ...(typeof data.payload === "object" && data.payload !== null ? data.payload : {}),
    } as IntakeRecord;
  }

  const { data, error } = await supabase
    .from("intake_submissions")
    .select("id, created_at, payload")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") return null;
    throw new Error(`Chyba DB při načítání posledního intake: ${error?.message ?? "Not found"}`);
  }

  return {
    id: data.id,
    createdAt: data.created_at ?? new Date().toISOString(),
    ...(typeof data.payload === "object" && data.payload !== null ? data.payload : {}),
  } as IntakeRecord;
}

/** Hostname z URL (bez www). */
function hostnameFromWebsite(website: unknown): string | null {
  if (typeof website !== "string" || !website.trim()) return null;
  try {
    const u = new URL(website.startsWith("http") ? website : `https://${website}`);
    const h = u.hostname.toLowerCase();
    return h.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

/** Nejnovější intake se stejným hostname (payload.website). Pro fallback při nízké confidence. */
export async function getLatestIntakeByHostname(hostname: string): Promise<Record<string, unknown> | null> {
  if (!hostname) return null;
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("intake_submissions")
    .select("id, created_at, payload")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data?.length) return null;
  for (const row of data as { id: string; created_at: string; payload: unknown }[]) {
    const p = row.payload;
    if (typeof p !== "object" || p === null) continue;
    const site = (p as Record<string, unknown>).website;
    const h = hostnameFromWebsite(site);
    if (h === normalized) return p as Record<string, unknown>;
  }
  return null;
}

export async function insertIntake(payload: Record<string, unknown>): Promise<{ id: string }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("intake_submissions")
    .insert({ payload })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Chyba DB při ukládání intake: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Chyba DB: intake nebyl vytvořen");
  }

  return { id: data.id };
}
