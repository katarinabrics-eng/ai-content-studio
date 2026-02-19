/**
 * Append event do events.jsonl (_meta/events.jsonl).
 */

import { getSupabaseClient } from "./supabase-server";
import { BUCKET_CLIENT_PROJECTS } from "./project-paths";

export type EventPayload = {
  type: string;
  at?: string;
  [key: string]: unknown;
};

/** Načte existující events.jsonl (pokud existuje) a append nový řádek. */
export async function appendEvent(storagePrefix: string, event: EventPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  const path = `${storagePrefix.replace(/\/+$/, "")}/_meta/events.jsonl`;
  const supabase = getSupabaseClient();
  const payload = { ...event, at: event.at ?? new Date().toISOString() };
  const line = JSON.stringify(payload) + "\n";

  const { data: existing } = await supabase.storage.from(BUCKET_CLIENT_PROJECTS).download(path);
  const body = existing
    ? new Blob([await existing.arrayBuffer(), line])
    : new Blob([line]);
  const { error } = await supabase.storage.from(BUCKET_CLIENT_PROJECTS).upload(path, body, {
    contentType: "application/x-ndjson",
    upsert: true,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
