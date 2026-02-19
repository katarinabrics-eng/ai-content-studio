/**
 * Status workflow for client jobs.
 * Timeline and transitions for curator + client views.
 */

export const CLIENT_JOB_STATUSES = [
  "paid",
  "onboarding_pending",
  "onboarding_submitted",
  "ai_processing",
  "curator_review",
  "ready_for_approval",
  "approved",
  "delivered",
  "scheduled",
  "client_changes_requested",
] as const;

export type ClientJobStatus = (typeof CLIENT_JOB_STATUSES)[number];

export const CLIENT_JOB_STATUS_LABELS: Record<ClientJobStatus, string> = {
  paid: "Zaplaceno",
  onboarding_pending: "Čeká na onboarding",
  onboarding_submitted: "Onboarding odeslán",
  ai_processing: "AI zpracování",
  curator_review: "Kontrola kurátora",
  ready_for_approval: "Připraveno k schválení",
  approved: "Schváleno",
  delivered: "Dodáno",
  scheduled: "Naplánováno",
  client_changes_requested: "Klient žádá úpravy",
};

/** Order for timeline (earlier = first). */
export const CLIENT_JOB_STATUS_ORDER: ClientJobStatus[] = [
  "paid",
  "onboarding_pending",
  "onboarding_submitted",
  "ai_processing",
  "curator_review",
  "ready_for_approval",
  "client_changes_requested",
  "approved",
  "scheduled",
  "delivered",
];

export function getStatusOrder(status: ClientJobStatus): number {
  const i = CLIENT_JOB_STATUS_ORDER.indexOf(status);
  return i === -1 ? 999 : i;
}

export function isStatusValid(s: string): s is ClientJobStatus {
  return CLIENT_JOB_STATUSES.includes(s as ClientJobStatus);
}

/** Allowed next statuses (simplified; extend per business rules). */
export const ALLOWED_TRANSITIONS: Partial<Record<ClientJobStatus, ClientJobStatus[]>> = {
  paid: ["onboarding_pending"],
  onboarding_pending: ["onboarding_submitted"],
  onboarding_submitted: ["ai_processing"],
  ai_processing: ["curator_review", "client_changes_requested"],
  curator_review: ["ready_for_approval", "client_changes_requested"],
  ready_for_approval: ["approved", "client_changes_requested"],
  approved: ["scheduled", "delivered"],
  client_changes_requested: ["ai_processing", "curator_review"],
  scheduled: ["delivered"],
  delivered: [],
};

export function canTransition(from: ClientJobStatus, to: ClientJobStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}
