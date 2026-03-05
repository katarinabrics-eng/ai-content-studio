/**
 * Mapování mezi pipeline UI (LEAD, HOVOR, AKTIVNI, HOTOVO, SUPLIK, ARCHIV)
 * a reálnými hodnotami: workflow_status (Supabase) a dashboard_section (scan_result).
 */

export const PIPELINE_IDS = ["LEAD", "HOVOR", "AKTIVNI", "HOTOVO"] as const;
export const SPECIAL_IDS = ["SUPLIK", "ARCHIV"] as const;
export type PipelineStatus = (typeof PIPELINE_IDS)[number] | (typeof SPECIAL_IDS)[number];

/** workflow_status → zobrazený pipeline stav (bez Šuplík/Archiv) */
const WORKFLOW_TO_PIPELINE: Record<string, PipelineStatus> = {
  DIAG_AI_PROCESSING: "LEAD",
  DIAG_LEAD_NEREALIZOVANY: "LEAD",
  DIAG_AWAITING_CURATOR: "LEAD",
  DIAG_READY_FOR_CLIENT: "HOVOR",
  DIAG_CLIENT_FEEDBACK: "AKTIVNI",
  DIAG_SENT_TO_CLIENT: "AKTIVNI",
  DIAG_DELIVERED: "HOTOVO",
};

/** pipeline stav → cílový workflow_status (pro přechod zpět do pipeline) */
export const PIPELINE_TO_WORKFLOW: Record<string, string> = {
  LEAD: "DIAG_AWAITING_CURATOR",
  HOVOR: "DIAG_READY_FOR_CLIENT",
  AKTIVNI: "DIAG_CLIENT_FEEDBACK",
  HOTOVO: "DIAG_DELIVERED",
};

export function toPipelineStatus(
  workflowStatus: string | null | undefined,
  dashboardSection: string | null | undefined
): PipelineStatus {
  if (dashboardSection === "SUPLIK" || dashboardSection === "ARCHIV") {
    return dashboardSection;
  }
  if (workflowStatus && WORKFLOW_TO_PIPELINE[workflowStatus]) {
    return WORKFLOW_TO_PIPELINE[workflowStatus];
  }
  return "LEAD";
}
