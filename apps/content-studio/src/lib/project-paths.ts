/**
 * Konstanty cest v rámci projektové složky ve Storage.
 * Bucket: client-projects
 * Prefix: projects/<PROJECT_CODE>/v1/
 */

export const BUCKET_CLIENT_PROJECTS = "client-projects";

export function projectStoragePrefix(projectCode: string): string {
  return `projects/${projectCode}/v1/`;
}

export const PATH = {
  brief: "brief/brief.json",
  context: "brief/context.txt",
  manifest: "_meta/manifest.json",
  events: "_meta/events.jsonl",
  logoDir: "assets/logo",
  photosDir: "assets/photos",
  manualDir: "assets/manual",
  aiTextIn: "ai/text/in",
  aiTextOut: "ai/text/out",
  aiVisualIn: "ai/visual/in",
  aiVisualOut: "ai/visual/out",
  deliverablesFinal: "deliverables/final",
} as const;

/** Plné cesty v rámci prefixu projektu (např. projects/LCF-xxx/v1/brief/brief.json) */
export function fullPath(prefix: string, relPath: string): string {
  return `${prefix.replace(/\/+$/, "")}/${relPath.replace(/^\/+/, "")}`;
}
