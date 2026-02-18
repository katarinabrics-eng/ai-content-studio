import { getSupabaseClient } from "./supabase-server";

export type PostDraftRow = {
  id: string;
  intake_id: string;
  created_at: string;
  payload: Record<string, unknown>;
};

export async function getPostDraftsByIntakeId(intakeId: string): Promise<PostDraftRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("post_drafts")
    .select("id, intake_id, created_at, payload")
    .eq("intake_id", intakeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Chyba DB při načítání draftů: ${error.message}`);
  }

  return (data ?? []) as PostDraftRow[];
}

export async function getDraftById(draftId: string): Promise<PostDraftRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("post_drafts")
    .select("id, intake_id, created_at, payload")
    .eq("id", draftId)
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") return null;
    throw new Error(`Chyba DB při načítání draftu: ${error?.message ?? "Not found"}`);
  }

  return data as PostDraftRow;
}

export async function updateDraftPayload(draftId: string, payload: Record<string, unknown>): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("post_drafts")
    .update({ payload })
    .eq("id", draftId);

  if (error) {
    throw new Error(`Chyba DB při aktualizaci draftu: ${error.message}`);
  }
}

export async function insertPostDrafts(
  intakeId: string,
  drafts: { payload: Record<string, unknown> }[]
): Promise<PostDraftRow[]> {
  const supabase = getSupabaseClient();
  const rows = drafts.map((d) => ({ intake_id: intakeId, payload: d.payload }));

  const { data, error } = await supabase
    .from("post_drafts")
    .insert(rows)
    .select("id, intake_id, created_at, payload");

  if (error) {
    throw new Error(`Chyba DB při ukládání draftů: ${error.message}`);
  }

  return (data ?? []) as PostDraftRow[];
}
