/**
 * Stavový workflow projektu. Admin vidí konkrétní stavy a "kdo je na tahu".
 * Klientovi zobrazovat jen human label (žádné interní kódy).
 */

export const PROJECT_STATUSES = [
  "WAITING_PAYMENT",
  "PAID",
  "WAITING_BRIEF",
  "WAITING_MANUAL_AI_COMMAND",
  "AI_IN_PROGRESS",
  "AWAITING_APPROVAL",
  "DONE",
  "ERROR",
  "AWAITING_INPUT",
  "INPUT_RECEIVED",
  "AWAITING_MANUAL_PROMPT",
  "AI_PROCESSING",
  "APPROVED_SCHEDULED",
  "PROCESSING_DATA",
  "READY_FOR_AI",
  "IN_PRODUCTION",
  "DRAFT_READY",
  "REVISION",
  "FINAL_READY",
  "CLOSED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Lidské popisky stavů. */
export const PROJECT_STATUS_LABELS: Record<string, string> = {
  WAITING_PAYMENT: "Čeká na platbu",
  PAID: "Zaplaceno",
  WAITING_BRIEF: "Čeká na dotazník",
  WAITING_MANUAL_AI_COMMAND: "Čeká na manuální pokyn AI",
  AI_IN_PROGRESS: "AI zpracovává zadání",
  AWAITING_APPROVAL: "Čeká na schválení",
  APPROVED_SCHEDULED: "Schváleno / naplánováno",
  DONE: "Hotovo",
  ERROR: "Chyba",
  AWAITING_INPUT: "Čeká na podklady",
  INPUT_RECEIVED: "Podklady přijaty",
  AWAITING_MANUAL_PROMPT: "Čeká na manuální pokyn",
  AI_PROCESSING: "AI zpracovává zadání",
  PROCESSING_DATA: "Čeká na podklady",
  READY_FOR_AI: "Podklady přijaty",
  IN_PRODUCTION: "AI zpracovává zadání",
  DRAFT_READY: "Čeká na schválení",
  REVISION: "Zapracováváme připomínky",
  FINAL_READY: "Schváleno / naplánováno",
  CLOSED: "Hotovo",
};

/** Kdo je na tahu. */
export type WhoIsOnMove = "AI" | "Klient" | "Vy" | null;

/** Barva badge: šedá=čeká, modrá=běží, oranžová=čeká na mě, zelená=hotovo, červená=chyba. */
export type StatusBadgeVariant = "gray" | "blue" | "orange" | "green" | "red";

export type WorkflowStep = {
  step: number;
  total: number;
  label: string;
  who: WhoIsOnMove;
  currentAction: string;
  badge: StatusBadgeVariant;
};

/** Mapování status -> workflow krok (1–7). */
const STATUS_TO_STEP: Record<string, number> = {
  WAITING_PAYMENT: 0,
  PAID: 1,
  WAITING_BRIEF: 2,
  WAITING_MANUAL_AI_COMMAND: 3,
  AI_IN_PROGRESS: 4,
  AWAITING_APPROVAL: 5,
  APPROVED_SCHEDULED: 6,
  DONE: 7,
  ERROR: 0,
  AWAITING_INPUT: 1,
  PROCESSING_DATA: 1,
  INPUT_RECEIVED: 2,
  READY_FOR_AI: 2,
  AWAITING_MANUAL_PROMPT: 3,
  AI_PROCESSING: 4,
  IN_PRODUCTION: 4,
  DRAFT_READY: 5,
  REVISION: 5,
  FINAL_READY: 6,
  CLOSED: 7,
};

const TOTAL_STEPS = 8;

/** Text „Právě teď: …“ podle stavu. */
const CURRENT_ACTION_BY_STATUS: Record<string, string> = {
  WAITING_PAYMENT: "Čekáme na platbu.",
  PAID: "Platba potvrzena. Klient vyplní dotazník.",
  WAITING_BRIEF: "Čekáme na vyplnění dotazníku od klienta.",
  WAITING_MANUAL_AI_COMMAND: "Čeká na manuální pokyn admina pro spuštění AI.",
  AI_IN_PROGRESS: "AI generuje 3 návrhy captionů.",
  AWAITING_APPROVAL: "Návrhy jsou připraveny. Čeká na vaše schválení.",
  APPROVED_SCHEDULED: "Finální příspěvky jsou naplánované.",
  DONE: "Zakázka je dokončena.",
  AWAITING_INPUT: "Čekáme na vyplnění briefu od klienta.",
  PROCESSING_DATA: "Čekáme na vyplnění briefu od klienta.",
  INPUT_RECEIVED: "Podklady jsou připraveny. Čeká na odeslání pokynu AI.",
  READY_FOR_AI: "Podklady jsou připraveny. Čeká na odeslání pokynu AI.",
  AWAITING_MANUAL_PROMPT: "Čeká na váš manuální pokyn pro AI.",
  AI_PROCESSING: "AI generuje 3 návrhy captionů.",
  IN_PRODUCTION: "AI generuje 3 návrhy captionů.",
  DRAFT_READY: "Návrhy jsou připraveny. Čeká na vaše schválení.",
  REVISION: "Zapracováváme připomínky od klienta.",
  FINAL_READY: "Finální příspěvky jsou připraveny.",
  CLOSED: "Zakázka je dokončena.",
  ERROR: "Došlo k chybě. Zkuste znovu nebo kontaktujte podporu.",
};

/** Badge variant podle stavu. */
const BADGE_BY_STATUS: Record<string, StatusBadgeVariant> = {
  WAITING_PAYMENT: "gray",
  PAID: "green",
  WAITING_BRIEF: "gray",
  WAITING_MANUAL_AI_COMMAND: "orange",
  AI_IN_PROGRESS: "blue",
  AWAITING_INPUT: "gray",
  PROCESSING_DATA: "gray",
  INPUT_RECEIVED: "gray",
  READY_FOR_AI: "gray",
  AWAITING_MANUAL_PROMPT: "orange",
  AI_PROCESSING: "blue",
  IN_PRODUCTION: "blue",
  AWAITING_APPROVAL: "orange",
  DRAFT_READY: "orange",
  REVISION: "orange",
  APPROVED_SCHEDULED: "green",
  FINAL_READY: "green",
  DONE: "green",
  CLOSED: "green",
  ERROR: "red",
};

/** Kdo je na tahu podle stavu. */
const WHO_BY_STATUS: Record<string, WhoIsOnMove> = {
  WAITING_PAYMENT: "Klient",
  PAID: "Klient",
  WAITING_BRIEF: "Klient",
  WAITING_MANUAL_AI_COMMAND: "Vy",
  AI_IN_PROGRESS: "AI",
  AWAITING_INPUT: "Klient",
  PROCESSING_DATA: "Klient",
  INPUT_RECEIVED: "Vy",
  READY_FOR_AI: "Vy",
  AWAITING_MANUAL_PROMPT: "Vy",
  AI_PROCESSING: "AI",
  IN_PRODUCTION: "AI",
  AWAITING_APPROVAL: "Vy",
  DRAFT_READY: "Vy",
  REVISION: "Vy",
  APPROVED_SCHEDULED: null,
  FINAL_READY: null,
  DONE: null,
  CLOSED: null,
  ERROR: "Vy",
};

/** Vrací workflow kontext pro daný status. */
export function getWorkflowStep(status: string, errorReason?: string | null): WorkflowStep {
  const step = STATUS_TO_STEP[status] ?? 1;
  const label = PROJECT_STATUS_LABELS[status] ?? status;
  const who = WHO_BY_STATUS[status] ?? null;
  let currentAction = CURRENT_ACTION_BY_STATUS[status] ?? "Projekt je v procesu.";
  if (status === "ERROR" && errorReason) {
    currentAction = errorReason;
  }
  const badge = BADGE_BY_STATUS[status] ?? "gray";
  return {
    step: status === "ERROR" ? 0 : step,
    total: TOTAL_STEPS,
    label,
    who,
    currentAction,
    badge,
  };
}

/** Tailwind třídy pro badge. */
export function getBadgeClasses(variant: StatusBadgeVariant): string {
  switch (variant) {
    case "gray":
      return "bg-stone-100 text-stone-700";
    case "blue":
      return "bg-blue-100 text-blue-800";
    case "orange":
      return "bg-amber-100 text-amber-800";
    case "green":
      return "bg-green-100 text-green-800";
    case "red":
      return "bg-red-100 text-red-800";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "WAITING_PAYMENT",
  "PAID",
  "WAITING_BRIEF",
  "WAITING_MANUAL_AI_COMMAND",
  "AI_IN_PROGRESS",
  "AWAITING_APPROVAL",
  "APPROVED_SCHEDULED",
  "DONE",
  "ERROR",
];

/** Mapování legacy statusů na pořadí v workflow. */
const LEGACY_STATUS_ORDER: Record<string, number> = {
  PROCESSING_DATA: 1,
  READY_FOR_AI: 2,
  IN_PRODUCTION: 4,
  DRAFT_READY: 5,
  REVISION: 5,
  FINAL_READY: 6,
  CLOSED: 7,
  INPUT_RECEIVED: 2,
  AWAITING_MANUAL_PROMPT: 3,
  AI_PROCESSING: 4,
};

export function getStatusOrder(status: ProjectStatus): number {
  const i = PROJECT_STATUS_ORDER.indexOf(status);
  if (i !== -1) return i;
  const legacy = LEGACY_STATUS_ORDER[status];
  if (legacy !== undefined) return legacy;
  return 999;
}

export function isProjectStatus(s: string): s is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(s);
}

export const ALLOWED_TRANSITIONS: Partial<Record<string, string[]>> = {
  WAITING_PAYMENT: ["PAID", "ERROR"],
  PAID: ["WAITING_BRIEF", "ERROR"],
  WAITING_BRIEF: ["WAITING_MANUAL_AI_COMMAND", "ERROR"],
  WAITING_MANUAL_AI_COMMAND: ["AI_IN_PROGRESS", "ERROR"],
  AI_IN_PROGRESS: ["AWAITING_APPROVAL", "ERROR"],
  AWAITING_APPROVAL: ["APPROVED_SCHEDULED", "DONE", "ERROR"],
  APPROVED_SCHEDULED: ["DONE", "ERROR"],
  AWAITING_INPUT: ["INPUT_RECEIVED", "ERROR"],
  PROCESSING_DATA: ["INPUT_RECEIVED", "AWAITING_MANUAL_PROMPT", "AI_PROCESSING", "ERROR"],
  INPUT_RECEIVED: ["AWAITING_MANUAL_PROMPT", "AI_PROCESSING", "ERROR"],
  READY_FOR_AI: ["AWAITING_MANUAL_PROMPT", "AI_PROCESSING", "ERROR"],
  AWAITING_MANUAL_PROMPT: ["AI_PROCESSING", "ERROR"],
  AI_PROCESSING: ["AWAITING_APPROVAL", "REVISION", "ERROR"],
  IN_PRODUCTION: ["DRAFT_READY", "REVISION", "ERROR"],
  DRAFT_READY: ["APPROVED_SCHEDULED", "REVISION", "DONE", "ERROR"],
  REVISION: ["AWAITING_APPROVAL", "DRAFT_READY", "ERROR"],
  FINAL_READY: ["DONE", "CLOSED", "ERROR"],
  DONE: [],
  CLOSED: [],
  ERROR: ["PAID", "WAITING_BRIEF", "WAITING_MANUAL_AI_COMMAND", "AI_IN_PROGRESS", "AWAITING_APPROVAL"],
};

export function canTransition(from: string, to: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

/** Pro zobrazení timeline: mapuje legacy status na ekvivalentní nový. */
export function getDisplayStatusForTimeline(status: string): string {
  const map: Record<string, string> = {
    PROCESSING_DATA: "WAITING_BRIEF",
    READY_FOR_AI: "WAITING_MANUAL_AI_COMMAND",
    IN_PRODUCTION: "AI_IN_PROGRESS",
    DRAFT_READY: "AWAITING_APPROVAL",
    REVISION: "AWAITING_APPROVAL",
    FINAL_READY: "APPROVED_SCHEDULED",
    CLOSED: "DONE",
    AWAITING_INPUT: "WAITING_BRIEF",
    INPUT_RECEIVED: "WAITING_MANUAL_AI_COMMAND",
    AWAITING_MANUAL_PROMPT: "WAITING_MANUAL_AI_COMMAND",
    AI_PROCESSING: "AI_IN_PROGRESS",
  };
  return map[status] ?? status;
}

/** Stav projektu pro výpočet statusu (priorita shora dolů). */
export type ProjectStateForStatus = {
  /** Chyba -> „Chyba“. */
  error?: boolean | string | null;
  /** publishedAt != null -> „Hotovo“. */
  publishedAt?: string | null;
  /** scheduledAt != null -> „Schváleno / naplánováno“. */
  scheduledAt?: string | null;
  /** aiOutputReady == true && approvedAt == null -> „Čeká na schválení“ (Na tahu: Vy). */
  aiOutputReady?: boolean | null;
  /** approvedAt != null (spolu s aiOutputReady) -> přechod na schváleno/naplánováno nebo hotovo. */
  approvedAt?: string | null;
  /** aiJob in (queued, running) -> „AI zpracovává zadání“ (Na tahu: AI). */
  aiJobStatus?: "queued" | "running" | "completed" | "failed" | null;
  /** questionnaireSubmittedAt != null -> „Čeká na manuální pokyn“ (Na tahu: Vy). */
  questionnaireSubmittedAt?: string | null;
};

/**
 * Vypočítá status projektu podle pravidel (priorita shora dolů).
 * 1) chyba -> ERROR
 * 2) publishedAt != null -> DONE
 * 3) scheduledAt != null -> APPROVED_SCHEDULED
 * 4) aiOutputReady == true && approvedAt == null -> AWAITING_APPROVAL
 * 5) aiJob in (queued, running) -> AI_PROCESSING
 * 6) questionnaireSubmittedAt != null -> AWAITING_MANUAL_PROMPT
 * 7) questionnaireSubmittedAt == null -> AWAITING_INPUT
 */
export function computeProjectStatus(state: ProjectStateForStatus | null | undefined): ProjectStatus {
  if (!state) return "AWAITING_INPUT";

  if (state.error) return "ERROR";
  if (state.publishedAt != null) return "DONE";
  if (state.scheduledAt != null) return "APPROVED_SCHEDULED";
  if (state.aiOutputReady === true && state.approvedAt == null) return "AWAITING_APPROVAL";
  if (state.aiJobStatus === "queued" || state.aiJobStatus === "running") return "AI_PROCESSING";
  if (state.questionnaireSubmittedAt != null) return "AWAITING_MANUAL_PROMPT";
  return "AWAITING_INPUT";
}

/**
 * Vrací workflow kontext z objektu stavu projektu.
 * Použije computeProjectStatus(state) a pak getWorkflowStep.
 */
export function getWorkflowStepFromState(
  state: ProjectStateForStatus | null | undefined,
  errorReason?: string | null
): WorkflowStep {
  const status = computeProjectStatus(state);
  return getWorkflowStep(status, errorReason);
}
