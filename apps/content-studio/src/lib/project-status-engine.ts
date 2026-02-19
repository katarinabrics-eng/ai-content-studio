/**
 * Status workflow: processing_data -> in_production -> draft_ready -> revision -> final_ready -> closed.
 * Klientovi zobrazovat jen human label (žádné interní kódy).
 */

export const PROJECT_STATUSES = [
  "PROCESSING_DATA",
  "IN_PRODUCTION",
  "DRAFT_READY",
  "REVISION",
  "FINAL_READY",
  "CLOSED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Lidské popisky pro klienta (bez interních kódů). */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PROCESSING_DATA: "Data se zpracovávají",
  IN_PRODUCTION: "Tvorba probíhá",
  DRAFT_READY: "Návrhy připraveny ke schválení",
  REVISION: "Zapracováváme připomínky",
  FINAL_READY: "Finální příspěvky připraveny",
  CLOSED: "Zakázka uzavřena",
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "PROCESSING_DATA",
  "IN_PRODUCTION",
  "DRAFT_READY",
  "REVISION",
  "FINAL_READY",
  "CLOSED",
];

export function getStatusOrder(status: ProjectStatus): number {
  const i = PROJECT_STATUS_ORDER.indexOf(status);
  return i === -1 ? 999 : i;
}

export function isProjectStatus(s: string): s is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(s);
}

export const ALLOWED_TRANSITIONS: Partial<Record<ProjectStatus, ProjectStatus[]>> = {
  PROCESSING_DATA: ["IN_PRODUCTION"],
  IN_PRODUCTION: ["DRAFT_READY", "REVISION"],
  DRAFT_READY: ["REVISION", "FINAL_READY"],
  REVISION: ["DRAFT_READY", "FINAL_READY"],
  FINAL_READY: ["CLOSED"],
  CLOSED: [],
};

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}
