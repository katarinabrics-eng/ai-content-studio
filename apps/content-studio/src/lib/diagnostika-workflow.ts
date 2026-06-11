/**
 * Workflow stavů pro diagnostiku (client_projects).
 * Kurátor vidí label, kdo je na tahu a „Právě teď“. Klientovi zobrazovat jen lidské věty.
 */

export const DIAG_WORKFLOW_STATUSES = [
  "DIAG_AI_PROCESSING",
  "DIAG_AWAITING_CURATOR",
  "DIAG_READY_FOR_CLIENT",
  "DIAG_CLIENT_FEEDBACK",
  "DIAG_SENT_TO_CLIENT",
  "DIAG_DELIVERED",
  "DIAG_LEAD_NEREALIZOVANY",
] as const;

export type DiagWorkflowStatus = (typeof DIAG_WORKFLOW_STATUSES)[number];

/** Lidské labely pro kurátora (admin). */
export const DIAG_WORKFLOW_LABELS: Record<DiagWorkflowStatus, string> = {
  DIAG_AI_PROCESSING: "AI zpracovává přístupná data",
  DIAG_AWAITING_CURATOR: "Předání kurátorovi",
  DIAG_READY_FOR_CLIENT: "Připraveno pro klienta",
  DIAG_CLIENT_FEEDBACK: "Klient vrací připomínky",
  DIAG_SENT_TO_CLIENT: "Zasláno",
  DIAG_DELIVERED: "Odevzdáno – hotovo",
  DIAG_LEAD_NEREALIZOVANY: "Nerealizovaný – jen diagnostika (kontaktovat)",
};

/** Kdo je na tahu. */
export type DiagWhoIsOnMove = "AI" | "Klient" | "Vy" | null;

/** Barva badge. */
export type DiagBadgeVariant = "gray" | "blue" | "orange" | "green" | "red";

/** Krátký popis „Právě teď“. */
export const DIAG_CURRENT_ACTION: Record<DiagWorkflowStatus, string> = {
  DIAG_AI_PROCESSING: "Analýza webu a tvorba ukázkové analýzy.",
  DIAG_AWAITING_CURATOR: "Čekáme na vás: potvrdit, upravit, zapracovat a připravit další kroky.",
  DIAG_READY_FOR_CLIENT: "Klient to u sebe vidí a může poslat korektury.",
  DIAG_CLIENT_FEEDBACK: "Klient vrátil připomínky; AI je zapracuje, pak znovu vyzve vás ke kurátorskému dohledu.",
  DIAG_SENT_TO_CLIENT: "Odesláno klientovi ke schválení a stažení.",
  DIAG_DELIVERED: "Klient potvrdil změny, schválil a stáhl. Hotovo.",
  DIAG_LEAD_NEREALIZOVANY: "Jen diagnostika – zatím nerealizovaný projekt. Budeme kontaktovat.",
};

export const DIAG_BADGE_BY_STATUS: Record<DiagWorkflowStatus, DiagBadgeVariant> = {
  DIAG_AI_PROCESSING: "blue",
  DIAG_AWAITING_CURATOR: "orange",
  DIAG_READY_FOR_CLIENT: "gray",
  DIAG_CLIENT_FEEDBACK: "orange",
  DIAG_SENT_TO_CLIENT: "green",
  DIAG_DELIVERED: "green",
  DIAG_LEAD_NEREALIZOVANY: "gray",
};

export const DIAG_WHO_BY_STATUS: Record<DiagWorkflowStatus, DiagWhoIsOnMove> = {
  DIAG_AI_PROCESSING: "AI",
  DIAG_AWAITING_CURATOR: "Vy",
  DIAG_READY_FOR_CLIENT: "Klient",
  DIAG_CLIENT_FEEDBACK: "Vy",
  DIAG_SENT_TO_CLIENT: "Klient",
  DIAG_DELIVERED: null,
  DIAG_LEAD_NEREALIZOVANY: "Vy",
};

/** Krok v pořadí 1–6 (pro zobrazení Krok X/6). */
export const DIAG_STEP_BY_STATUS: Record<DiagWorkflowStatus, number> = {
  DIAG_AI_PROCESSING: 1,
  DIAG_AWAITING_CURATOR: 2,
  DIAG_READY_FOR_CLIENT: 3,
  DIAG_CLIENT_FEEDBACK: 4,
  DIAG_SENT_TO_CLIENT: 5,
  DIAG_DELIVERED: 6,
  DIAG_LEAD_NEREALIZOVANY: 0,
};

const TOTAL_STEPS = 6;

export type DiagWorkflowStep = {
  step: number;
  total: number;
  label: string;
  who: DiagWhoIsOnMove;
  currentAction: string;
  badge: DiagBadgeVariant;
};

export function getDiagnostikaWorkflowStep(
  workflowStatus: string | null | undefined
): DiagWorkflowStep {
  if (workflowStatus == null || typeof workflowStatus !== "string") {
    return {
      step: 1,
      total: TOTAL_STEPS,
      label: DIAG_WORKFLOW_LABELS.DIAG_AWAITING_CURATOR,
      who: "Vy",
      currentAction: DIAG_CURRENT_ACTION.DIAG_AWAITING_CURATOR,
      badge: "orange",
    };
  }
  const status = workflowStatus as DiagWorkflowStatus;
  const label = DIAG_WORKFLOW_LABELS[status] ?? status;
  const who = DIAG_WHO_BY_STATUS[status] ?? null;
  const currentAction = DIAG_CURRENT_ACTION[status] ?? "Projekt je v procesu.";
  const badge = DIAG_BADGE_BY_STATUS[status] ?? "gray";
  const step = DIAG_STEP_BY_STATUS[status] ?? 1;
  return {
    step,
    total: TOTAL_STEPS,
    label,
    who,
    currentAction,
    badge,
  };
}

/** Tailwind pro badge na tmavém pozadí. */
export function getDiagBadgeClassesDark(variant: DiagBadgeVariant): string {
  switch (variant) {
    case "gray":
      return "bg-white/10 text-zinc-400";
    case "blue":
      return "bg-blue-500/20 text-blue-300";
    case "orange":
      return "bg-amber-500/20 text-amber-300";
    case "green":
      return "bg-green-500/20 text-green-300";
    case "red":
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-white/10 text-zinc-400";
  }
}

/** Povolené přechody (od -> na). Návrat na Lead (DIAG_AWAITING_CURATOR) je povolen ze všech stavů. */
export const DIAG_ALLOWED_TRANSITIONS: Partial<Record<DiagWorkflowStatus, DiagWorkflowStatus[]>> = {
  DIAG_AI_PROCESSING: ["DIAG_AWAITING_CURATOR"],
  DIAG_LEAD_NEREALIZOVANY: ["DIAG_AWAITING_CURATOR"],
  DIAG_AWAITING_CURATOR: ["DIAG_READY_FOR_CLIENT"],
  DIAG_READY_FOR_CLIENT: ["DIAG_AWAITING_CURATOR", "DIAG_CLIENT_FEEDBACK", "DIAG_SENT_TO_CLIENT"],
  DIAG_CLIENT_FEEDBACK: ["DIAG_AWAITING_CURATOR"],
  DIAG_SENT_TO_CLIENT: ["DIAG_AWAITING_CURATOR", "DIAG_DELIVERED"],
  DIAG_DELIVERED: ["DIAG_AWAITING_CURATOR"],
};

export function canDiagTransition(
  from: string | null | undefined,
  to: DiagWorkflowStatus
): boolean {
  if (from == null || typeof from !== "string") return false;
  const allowed = DIAG_ALLOWED_TRANSITIONS[from as DiagWorkflowStatus];
  return Array.isArray(allowed) && allowed.includes(to);
}

/** Lidský text pro klienta (bez kódů). */
export const DIAG_CLIENT_FACING_MESSAGE: Record<DiagWorkflowStatus, string> = {
  DIAG_AI_PROCESSING: "Připravujeme vaši analýzu.",
  DIAG_AWAITING_CURATOR: "Analýza je u nás v přípravě.",
  DIAG_READY_FOR_CLIENT: "Výsledek je připraven k vašemu posouzení. Můžete poslat připomínky.",
  DIAG_CLIENT_FEEDBACK: "Zapracováváme vaše připomínky.",
  DIAG_SENT_TO_CLIENT: "Finální verze je připravena ke stažení.",
  DIAG_DELIVERED: "Děkujeme. Zakázka je dokončena.",
  DIAG_LEAD_NEREALIZOVANY: "Děkujeme za zájem. Budeme vás kontaktovat.",
};
