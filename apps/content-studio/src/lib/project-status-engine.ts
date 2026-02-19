/**
 * Test project status workflow (no payment).
 */

export const PROJECT_STATUSES = [
  "PROCESSING_DATA",
  "IN_PRODUCTION",
  "DRAFT_READY",
  "REVISION",
  "FINAL_READY",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PROCESSING_DATA: "Zpracováváme data",
  IN_PRODUCTION: "V produkci",
  DRAFT_READY: "Návrh připraven",
  REVISION: "Revize / úpravy",
  FINAL_READY: "Finální verze připravena",
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "PROCESSING_DATA",
  "IN_PRODUCTION",
  "DRAFT_READY",
  "REVISION",
  "FINAL_READY",
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
  FINAL_READY: [],
};

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}
