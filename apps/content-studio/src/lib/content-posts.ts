import { getSupabaseClient } from "./supabase-server";

export type ContentPostStatus =
  | "generating"
  | "curator_review"
  | "client_review"
  | "approved"
  | "published";

export type ContentPostRow = {
  id: string;
  project_id: string;
  status: ContentPostStatus;
  hook: string | null;
  body: string | null;
  cta: string | null;
  hashtags: string[] | null;
  visual_brief: string | null;
  ai_image_prompt: string | null;
  canva_design_id: string | null;
  canva_preview_url: string | null;
  canva_edit_url: string | null;
  agent_style: string | null;
  pillar: string | null;
  platform: string | null;
  scheduled_for: string | null;
  curator_note: string | null;
  client_note: string | null;
  created_at: string;
  updated_at: string;
};

export async function getContentPostsByStatus(
  status: ContentPostStatus
): Promise<ContentPostRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContentPostRow[];
}

export async function getContentPostById(id: string): Promise<ContentPostRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as ContentPostRow | null;
}

export async function getContentPostsByProjectId(
  projectId: string
): Promise<ContentPostRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("project_id", projectId)
    .order("scheduled_for", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContentPostRow[];
}

export async function updateContentPostStatus(
  id: string,
  status: ContentPostStatus,
  extra?: { client_note?: string; curator_note?: string }
): Promise<ContentPostRow | null> {
  const supabase = getSupabaseClient();
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (extra?.client_note !== undefined) updates.client_note = extra.client_note;
  if (extra?.curator_note !== undefined) updates.curator_note = extra.curator_note;
  const { data, error } = await supabase
    .from("content_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data as ContentPostRow;
}

export async function createContentPost(params: {
  project_id: string;
  status?: ContentPostStatus;
  hook?: string;
  body?: string;
  platform?: string;
}): Promise<ContentPostRow> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      project_id: params.project_id,
      status: params.status ?? "generating",
      hook: params.hook ?? null,
      body: params.body ?? null,
      platform: params.platform ?? "instagram",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as ContentPostRow;
}
