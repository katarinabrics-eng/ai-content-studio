/**
 * Utility pro upload do Supabase Storage (client-projects bucket).
 */

import { getSupabaseClient } from "./supabase-server";
import { BUCKET_CLIENT_PROJECTS } from "./project-paths";

export type UploadOptions = {
  contentType?: string;
  upsert?: boolean;
};

export async function uploadFile(
  path: string,
  body: Buffer | Blob | string,
  options: UploadOptions = {}
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET_CLIENT_PROJECTS).upload(path, body, {
    contentType: options.contentType,
    upsert: options.upsert ?? false,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Vytvoří prázdné .keep soubory pro adresářovou strukturu. */
export async function ensurePlaceholderDirs(prefix: string): Promise<void> {
  const supabase = getSupabaseClient();
  const dirs = [
    "ai/text/in/.keep",
    "ai/text/out/.keep",
    "ai/visual/in/.keep",
    "ai/visual/out/.keep",
    "deliverables/final/.keep",
  ];
  for (const d of dirs) {
    const path = `${prefix.replace(/\/+$/, "")}/${d}`;
    await supabase.storage.from(BUCKET_CLIENT_PROJECTS).upload(path, new Blob([""]), { upsert: true });
  }
}
