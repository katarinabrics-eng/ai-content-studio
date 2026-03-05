/**
 * Konstanty cest v rámci projektové složky ve Storage.
 * Bucket: client-projects
 * Prefix: projects/<PROJECT_CODE>/v1/
 */

export const BUCKET_CLIENT_PROJECTS = "client-projects";
/** Bucket pro podklady v admin dashboardu (fotky, loga, PDF, moodboard). */
export const BUCKET_PROJECT_ASSETS = "project-assets";

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
  /** Materiály nahrané kurátorem (strategie, checklist, vizuály, prezentace, PDF). */
  curatorDir: "deliverables/curator",
  /** Výstup stratega (JSON: strategistId, output, createdAt). */
  strategistOut: "ai/strategist/out.json",
} as const;

/** Plné cesty v rámci prefixu projektu (např. projects/LCF-xxx/v1/brief/brief.json) */
export function fullPath(prefix: string, relPath: string): string {
  return `${prefix.replace(/\/+$/, "")}/${relPath.replace(/^\/+/, "")}`;
}
