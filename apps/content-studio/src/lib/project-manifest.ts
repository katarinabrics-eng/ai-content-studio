/**
 * Tvorba a update manifestu projektu (_meta/manifest.json).
 */

import type { ProjectFileRow } from "./supabase-projects";
import { uploadFile } from "./storage-upload";
import { fullPath, PATH } from "./project-paths";

export type ManifestEntry = {
  path: string;
  kind?: string;
  url?: string;
  mime?: string;
  size?: number;
};

export type ManifestData = {
  project_id: string;
  project_code: string;
  storage_prefix: string;
  version: "v1";
  created_at: string;
  updated_at: string;
  files: ManifestEntry[];
};

export function buildManifest(data: {
  projectId: string;
  projectCode: string;
  storagePrefix: string;
  files?: ProjectFileRow[] | ManifestEntry[];
}): ManifestData {
  const now = new Date().toISOString();
  const files: ManifestEntry[] = (data.files ?? []).map((f) => ({
    path: "storage_path" in f ? f.storage_path : f.path,
    kind: "kind" in f ? f.kind : f.kind,
    mime: "content_type" in f ? f.content_type ?? undefined : f.mime,
    size: "size_bytes" in f ? f.size_bytes ?? undefined : f.size,
    url: "url" in f ? f.url : undefined,
  }));
  return {
    project_id: data.projectId,
    project_code: data.projectCode,
    storage_prefix: data.storagePrefix,
    version: "v1",
    created_at: now,
    updated_at: now,
    files,
  };
}

export async function saveManifest(
  storagePrefix: string,
  manifest: ManifestData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const path = fullPath(storagePrefix, PATH.manifest);
  const json = JSON.stringify(manifest, null, 2);
  return uploadFile(path, json, { contentType: "application/json", upsert: true });
}
