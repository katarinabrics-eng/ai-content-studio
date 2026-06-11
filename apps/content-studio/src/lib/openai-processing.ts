/**
 * Chytrý routing OpenAI požadavků: batch (levný async), realtime (interaktivní), priority (urgentní).
 */

export type JobType =
  | "weekly_posts"
  | "single_post_regen"
  | "single_visual_regen"
  | "enrich";

export type ProcessingMode = "batch" | "realtime" | "priority";

export type ProcessingMetadata = {
  processingMode: ProcessingMode;
  processingReason: string;
  startedAt: string;
  finishedAt?: string;
};

type ChooseInput = {
  jobType: JobType;
  rush?: boolean;
  dueAt?: string; // ISO date
};

function getEnvConfig() {
  const defaultMode = (process.env.OPENAI_DEFAULT_MODE ?? "batch") as ProcessingMode;
  const enablePriority = process.env.OPENAI_ENABLE_PRIORITY !== "false";
  const priorityMaxPerDay = Math.max(0, parseInt(process.env.OPENAI_PRIORITY_MAX_PER_DAY ?? "20", 10));
  const batchEnabled = process.env.OPENAI_BATCH_ENABLED !== "false";
  return { defaultMode, enablePriority, priorityMaxPerDay, batchEnabled };
}

/**
 * Zvolí processing mode podle jobType, rush a dueAt.
 * Pravidla:
 * - weekly_posts -> batch (pokud batch enabled)
 * - enrich, single_post_regen, single_visual_regen -> realtime
 * - rush=true nebo dueAt < 24h -> priority (pokud enablePriority)
 */
export function chooseProcessingMode(input: ChooseInput): {
  mode: ProcessingMode;
  reason: string;
  useBatch: boolean;
  eta?: string;
} {
  const { enablePriority, batchEnabled } = getEnvConfig();
  const { jobType, rush = false, dueAt } = input;

  const dueAtMs = dueAt ? new Date(dueAt).getTime() : 0;
  const nowMs = Date.now();
  const hoursUntilDue = dueAtMs > 0 ? (dueAtMs - nowMs) / (1000 * 60 * 60) : 999;

  if (rush || (dueAtMs > 0 && hoursUntilDue < 24)) {
    if (enablePriority) {
      return {
        mode: "priority",
        reason: rush ? "rush=true" : `dueAt < 24h (${Math.round(hoursUntilDue)}h)`,
        useBatch: false,
      };
    }
  }

  if (jobType === "weekly_posts" && batchEnabled) {
    return {
      mode: "batch",
      reason: "weekly_posts → batch (plánovaná úloha)",
      useBatch: true,
      eta: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }

  return {
    mode: "realtime",
    reason: jobType === "weekly_posts" ? "batch disabled" : `${jobType} → realtime (interaktivní)`,
    useBatch: false,
  };
}
