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
